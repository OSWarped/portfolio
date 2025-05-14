// app/layout.tsx
import '@/app/globals.css';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[var(--background)] text-[var(--foreground)]">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
