"""Fetch prepfinland Instagram video posts, mirror them to Cloudflare R2, and
write a manifest the landing page can load.

A post is selected only when its caption contains ALL of the required hashtags
(order does not matter). Matching videos (and their poster thumbnails) are
downloaded and uploaded to an R2 bucket; the manifest then references the
stable public R2 URLs instead of Instagram's short-lived signed CDN URLs.

Posts are read from Instagram's public user-feed endpoint
(api/v1/feed/user/<id>/) using only the public web app-id header — no login and
no Meta app. That endpoint sidesteps the profile-info API, which returns HTTP
400 for accounts (like @prepfinland) whose business-category metadata points at
an asset Meta has deleted.

Run it locally with `npm run fetch-instagram`, which loads .env.instagram.local
(see .env.instagram.example) and executes this script. Running from a home /
residential connection avoids the datacenter-IP blocking that makes this
unreliable from CI.

Configuration (env — set in .env.instagram.local):
  IG_USERNAME           Instagram username to scan (default: prepfinland)
  IG_USER_ID            Numeric user id override (optional; resolved from the
                        public profile page when omitted)
  IG_HASHTAGS           Comma-separated hashtags a post MUST all contain
                        (default: prepfinland,beprepared,preparmy)
  IG_MAX                Max recent posts to scan (default: 60)

  R2_ACCOUNT_ID         Cloudflare account id (bucket endpoint host)
  R2_BUCKET             Target R2 bucket name
  R2_PREFIX             Key prefix / folder inside the bucket (default: instagram/)
  R2_PUBLIC_BASE_URL    Public base URL the bucket is served from
                        (r2.dev URL or a custom domain), used to build asset links
  R2_ACCESS_KEY_ID      R2 S3 access key id (secret)
  R2_SECRET_ACCESS_KEY  R2 S3 secret access key (secret)

Writes public/instagram.json relative to the repo root; review and commit it
afterwards to publish the refreshed carousel.
"""
from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import boto3
import requests
from botocore.client import Config
from botocore.exceptions import ClientError
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

OUTPUT_PATH = Path("public/instagram.json")
DEFAULT_HASHTAGS = "prepfinland,beprepared,preparmy"

# Public web app id sent by instagram.com itself; required by the feed endpoint.
IG_APP_ID = "936619743392459"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
MEDIA_TYPE_VIDEO = 2
MEDIA_TYPE_CAROUSEL = 8


def parse_env() -> dict:
    username = (os.environ.get("IG_USERNAME") or "prepfinland").strip().lstrip("@")
    hashtags_raw = (os.environ.get("IG_HASHTAGS") or DEFAULT_HASHTAGS).strip()
    max_posts_raw = (os.environ.get("IG_MAX") or "60").strip()

    hashtags = [h.strip().lstrip("#").lower() for h in hashtags_raw.split(",") if h.strip()]
    if not hashtags:
        sys.exit("IG_HASHTAGS resolved to an empty list")

    try:
        max_posts = int(max_posts_raw)
    except ValueError:
        sys.exit(f"IG_MAX must be an integer, got {max_posts_raw!r}")

    prefix = (os.environ.get("R2_PREFIX") or "instagram/").strip().lstrip("/")
    if prefix and not prefix.endswith("/"):
        prefix += "/"

    public_base = (os.environ.get("R2_PUBLIC_BASE_URL") or "").strip().rstrip("/")

    cfg = {
        "username": username,
        "user_id": (os.environ.get("IG_USER_ID") or "").strip(),
        "hashtags": hashtags,
        "max_posts": max_posts,
        "account_id": (os.environ.get("R2_ACCOUNT_ID") or "").strip(),
        "bucket": (os.environ.get("R2_BUCKET") or "").strip(),
        "prefix": prefix,
        "public_base": public_base,
        "access_key": (os.environ.get("R2_ACCESS_KEY_ID") or "").strip(),
        "secret_key": (os.environ.get("R2_SECRET_ACCESS_KEY") or "").strip(),
    }

    missing = [
        name
        for name, key in (
            ("R2_ACCOUNT_ID", "account_id"),
            ("R2_BUCKET", "bucket"),
            ("R2_PUBLIC_BASE_URL", "public_base"),
            ("R2_ACCESS_KEY_ID", "access_key"),
            ("R2_SECRET_ACCESS_KEY", "secret_key"),
        )
        if not cfg[key]
    ]
    if missing:
        sys.exit("Missing required R2 configuration: " + ", ".join(missing))

    return cfg


def extract_hashtags(caption: str | None) -> list[str]:
    if not caption:
        return []
    return [m.group(1).lower() for m in re.finditer(r"#([A-Za-z0-9_]+)", caption)]


def matches_all(caption: str | None, required: list[str]) -> bool:
    tags = set(extract_hashtags(caption))
    return all(tag in tags for tag in required)


def r2_client(cfg: dict):
    return boto3.client(
        "s3",
        endpoint_url=f"https://{cfg['account_id']}.r2.cloudflarestorage.com",
        aws_access_key_id=cfg["access_key"],
        aws_secret_access_key=cfg["secret_key"],
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def object_exists(client, bucket: str, key: str) -> bool:
    try:
        client.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError as exc:
        if exc.response.get("Error", {}).get("Code") in ("404", "NoSuchKey", "NotFound"):
            return False
        raise


def mirror_asset(session: requests.Session, client, cfg: dict, source_url: str, key: str, content_type: str) -> str:
    """Ensure the asset at source_url exists in R2 under `key`; return its public URL."""
    public_url = f"{cfg['public_base']}/{key}"
    if object_exists(client, cfg["bucket"], key):
        print(f"  exists  {key}")
        return public_url

    # (connect timeout, read timeout); videos can be tens of MB.
    resp = session.get(source_url, timeout=(15, 180))
    resp.raise_for_status()
    client.put_object(
        Bucket=cfg["bucket"],
        Key=key,
        Body=resp.content,
        ContentType=content_type,
        CacheControl="public, max-age=31536000, immutable",
    )
    print(f"  upload  {key} ({len(resp.content)} bytes)")
    return public_url


def ig_session() -> requests.Session:
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT, "X-IG-App-ID": IG_APP_ID})
    # Retry transient network errors and rate-limit / 5xx responses with backoff.
    retry = Retry(
        total=4,
        connect=4,
        read=4,
        status=4,
        backoff_factor=2,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset(["GET"]),
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def resolve_user_id(session: requests.Session, cfg: dict) -> str:
    if cfg["user_id"]:
        return cfg["user_id"]
    resp = session.get(f"https://www.instagram.com/{cfg['username']}/", timeout=30)
    resp.raise_for_status()
    for pattern in (r'"profilePage_(\d+)"', r'"props":\{"id":"(\d+)"', r'"user":\{"id":"(\d+)"'):
        match = re.search(pattern, resp.text)
        if match:
            return match.group(1)
    sys.exit(
        f"Could not resolve a numeric user id for @{cfg['username']}. "
        "Set IG_USER_ID in .env.instagram.local to override."
    )


def iter_feed_items(session: requests.Session, user_id: str, max_scan: int):
    """Yield up to max_scan recent feed items, following pagination."""
    scanned = 0
    max_id: str | None = None
    while scanned < max_scan:
        params: dict = {"count": 12}
        if max_id:
            params["max_id"] = max_id
        resp = session.get(
            f"https://www.instagram.com/api/v1/feed/user/{user_id}/", params=params, timeout=(15, 60)
        )
        resp.raise_for_status()
        data = resp.json()
        for item in data.get("items") or []:
            yield item
            scanned += 1
            if scanned >= max_scan:
                return
        if not data.get("more_available") or not data.get("next_max_id"):
            return
        max_id = data["next_max_id"]


def item_caption(item: dict) -> str:
    return ((item.get("caption") or {}).get("text")) or ""


def extract_video(item: dict) -> tuple[str | None, str | None]:
    """Return (video_url, poster_url) for a video post or a carousel with a video child."""
    candidates = [item]
    if item.get("media_type") == MEDIA_TYPE_CAROUSEL:
        candidates = item.get("carousel_media") or []
    for media in candidates:
        versions = media.get("video_versions") or []
        if not versions:
            continue
        posters = (media.get("image_versions2") or {}).get("candidates") or []
        return versions[0].get("url"), (posters[0].get("url") if posters else None)
    return None, None


def build_manifest(cfg: dict) -> dict:
    session = ig_session()
    user_id = resolve_user_id(session, cfg)
    print(f"Scanning up to {cfg['max_posts']} recent posts from @{cfg['username']} (id {user_id})")

    client = r2_client(cfg)
    entries: list[dict] = []
    for item in iter_feed_items(session, user_id, cfg["max_posts"]):
        caption = item_caption(item)
        if not matches_all(caption, cfg["hashtags"]):
            continue
        video_src, poster_src = extract_video(item)
        if not video_src:
            continue

        shortcode = item.get("code") or item.get("pk")
        print(f"Post {shortcode}")
        base_key = f"{cfg['prefix']}{shortcode}"
        video_url = mirror_asset(session, client, cfg, video_src, f"{base_key}.mp4", "video/mp4")
        poster_url = (
            mirror_asset(session, client, cfg, poster_src, f"{base_key}.jpg", "image/jpeg")
            if poster_src
            else None
        )
        taken_at = datetime.fromtimestamp(item.get("taken_at", 0), tz=timezone.utc)
        entries.append(
            {
                "shortcode": shortcode,
                "permalink": f"https://www.instagram.com/p/{shortcode}/",
                "caption": caption,
                "taken_at": taken_at.isoformat().replace("+00:00", "Z"),
                "video_url": video_url,
                "poster_url": poster_url,
                "hashtags": extract_hashtags(caption),
                "likes": item.get("like_count"),
                "video_view_count": item.get("play_count") or item.get("view_count"),
            }
        )

    print(f"Matched {len(entries)} video posts with all of {cfg['hashtags']}")
    entries.sort(key=lambda e: e["taken_at"], reverse=True)
    return {
        "username": cfg["username"],
        "hashtags": cfg["hashtags"],
        "fetched_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "posts": entries,
    }


def load_previous() -> dict | None:
    if not OUTPUT_PATH.exists():
        return None
    try:
        return json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def content_unchanged(previous: dict | None, manifest: dict) -> bool:
    if not previous:
        return False
    return (
        previous.get("username") == manifest["username"]
        and previous.get("hashtags") == manifest["hashtags"]
        and previous.get("posts") == manifest["posts"]
    )


def main() -> int:
    cfg = parse_env()

    try:
        manifest = build_manifest(cfg)
    except requests.HTTPError as exc:
        status = exc.response.status_code if exc.response is not None else "?"
        sys.exit(
            f"Instagram request failed (HTTP {status}). If this is a 401/429, you may be rate "
            f"limited — wait and retry, ideally from a home connection.\nUnderlying error: {exc}"
        )
    except requests.RequestException as exc:
        sys.exit(f"Network error talking to Instagram: {exc}")

    previous = load_previous()
    if content_unchanged(previous, manifest):
        print(f"No content changes ({len(manifest['posts'])} posts); leaving file as-is.")
        return 0

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(manifest, indent=2, sort_keys=True, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(manifest['posts'])} posts to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
