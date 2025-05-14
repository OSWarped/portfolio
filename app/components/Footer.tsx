// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[var(--navy)] text-white border-t-4 border-cardinal">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between">
        <p className="text-sm text-white/80">
          © {new Date().getFullYear()} Blake Milam. All rights reserved.
        </p>

        {/* right — social icons */}
        <ul className="flex gap-6 text-lg">
          <li>
            <Link
              href="https://github.com/OSWarped"
              aria-label="GitHub"
              className="hover:text-[var(--cardinal)] transition"
            >
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1 .1 1.6 1 1.6 1 .9 1.6 2.5 1.1 3.1.8.1-.6.4-1.1.6-1.3-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.3 1.1-3.1-.1-.3-.5-1.5.1-3 0 0 .9-.3 3 1.1a10.6 10.6 0 0 1 5.5 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.7.1 3 .7.8 1.1 1.8 1.1 3.1 0 4.6-2.8 5.5-5.5 5.8.4.4.7 1 .7 1.9v2.9c0 .4.3.7.8.6A12 12 0 0 0 12 .5z"/>
              </svg>
            </Link>
          </li>
          <li>
            <Link
              href="https://www.linkedin.com/in/blake-milam-a3491732/"
              aria-label="LinkedIn"
              className="hover:text-[var(--cardinal)] transition"
            >
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.98 3.5a2.5 2.5 0 1 1 .04 5 2.5 2.5 0 0 1-.04-5zM3 8.98h4v12H3v-12zm7 0h3.8v1.6h.1c.5-.9 1.9-1.9 4-1.9 4.3 0 5.1 2.8 5.1 6.5v7.8h-4v-6.9c0-1.6 0-3.6-2.2-3.6s-2.5 1.7-2.5 3.5v7H10v-14z"/>
              </svg>
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
