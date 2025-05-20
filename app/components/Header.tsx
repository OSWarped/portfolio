// components/Header.tsx
//import DarkModeToggle from './DarkModeToggle';
import Link            from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--navy)]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-bold text-white hover:text-cardinal">
          Blake Milam
        </Link>

        <ul className="flex gap-6 text-sm font-medium">
          <li><Link href="/projects" className="hover:text-cardinal">Projects</Link></li>
          <li><Link href="/skills" className="hover:text-cardinal">Utilities</Link></li>
          <li><Link href="/contact"  className="hover:text-cardinal">Contact</Link></li>
          {/* <li><DarkModeToggle /></li> */}
        </ul>
      </nav>
      {/* thin Cardinal accent bar under header */}
      <div className="h-1 bg-cardinal" />
    </header>
  );
}
