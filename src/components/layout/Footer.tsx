export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-[var(--color-text)]/60">
        <p>&copy; {new Date().getFullYear()} PREP. All rights reserved.</p>
      </div>
    </footer>
  );
}
