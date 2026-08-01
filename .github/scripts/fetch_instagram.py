"""Fetch prepfinland Instagram video posts, mirror them to Cloudflare R2, and
write a manifest the landing page can load.

A post is selected only when its caption contains ALL of the required hashtags
(order does not matter). Matching videos (and their poster thumbnails) are
downloaded and uploaded to an R2 bucket; the manifest then references the
stable public R2 URLs instead of Instagram's short-lived signed CDN URLs.

Configuration (env — set from GitHub variables / secrets in the workflow):
  IG_USERNAME           Instagram username to scan (default: prepfinland)
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

Writes public/instagram.json relative to the repo root (the workflow cwd).
"""
from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import boto3
import instaloader
import requests
from botocore.client import Config
from botocore.exceptions import ClientError
from instaloader.exceptions import (
    ConnectionException,
    LoginRequiredException,
    ProfileNotExistsException,
    QueryReturnedBadRequestException,
)

OUTPUT_PATH = Path("public/instagram.json")
DEFAULT_HASHTAGS = "prepfinland,beprepared,preparmy"


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


def mirror_asset(client, cfg: dict, source_url: str, key: str, content_type: str) -> str:
    """Ensure the asset at source_url exists in R2 under `key`; return its public URL."""
    public_url = f"{cfg['public_base']}/{key}"
    if object_exists(client, cfg["bucket"], key):
        print(f"  exists  {key}")
        return public_url

    resp = requests.get(source_url, timeout=60)
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


def fetch_posts(cfg: dict) -> list:
    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False,
        quiet=True,
    )
    profile = instaloader.Profile.from_username(L.context, cfg["username"])

    selected = []
    for i, post in enumerate(profile.get_posts()):
        if i >= cfg["max_posts"]:
            break
        if not post.is_video:
            continue
        caption = post.caption or ""
        if not matches_all(caption, cfg["hashtags"]):
            continue
        selected.append(post)
    return selected


def build_manifest(cfg: dict) -> dict:
    posts = fetch_posts(cfg)
    print(f"Found {len(posts)} video posts matching {cfg['hashtags']}")

    client = r2_client(cfg)
    entries: list[dict] = []
    for post in posts:
        print(f"Post {post.shortcode}")
        base_key = f"{cfg['prefix']}{post.shortcode}"
        video_url = mirror_asset(client, cfg, post.video_url, f"{base_key}.mp4", "video/mp4")
        poster_url = mirror_asset(client, cfg, post.url, f"{base_key}.jpg", "image/jpeg")
        entries.append(
            {
                "shortcode": post.shortcode,
                "permalink": f"https://www.instagram.com/p/{post.shortcode}/",
                "caption": post.caption or "",
                "taken_at": post.date_utc.replace(tzinfo=timezone.utc)
                .isoformat()
                .replace("+00:00", "Z"),
                "video_url": video_url,
                "poster_url": poster_url,
                "hashtags": extract_hashtags(post.caption),
                "likes": post.likes,
                "video_view_count": post.video_view_count,
            }
        )

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
    except ProfileNotExistsException:
        sys.exit(f"Profile @{cfg['username']} does not exist or is not public")
    except (ConnectionException, LoginRequiredException, QueryReturnedBadRequestException) as exc:
        sys.exit(f"Instagram blocked or failed the request: {exc}")

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
