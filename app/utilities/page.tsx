import QRCodeGenerator from "../components/QRCodeGenerator";
import JwtTokenDecoder from "../components/JwtTokenDecoder";
import Link from "next/link";

export default function Skills() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Utilities
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[var(--navy)] md:text-4xl">
              Free, practical tools built to be useful
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-700 md:text-lg">
              This section of my portfolio is dedicated to small utilities that
              solve real problems without paywalls, unnecessary signups, or
              friction. I enjoy building tools that are straightforward,
              polished, and immediately useful.
            </p>

            <p className="mt-4 text-base leading-7 text-slate-700">
              Right now I have a QR Code Generator and a JWT Token Decoder
              available. Both are meant to be fast, free, and easy to use.
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 border-b border-slate-200 pb-6">
              

              <h2 className="mt-4 text-2xl font-bold text-[var(--navy)]">
                QR Code Generator
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
                I built this because something as simple as generating a QR code
                should be fast, free, and accessible. Too many sites gate basic
                features behind signups or paid plans, so this tool keeps it
                simple and open.
              </p>
            </div>

            <QRCodeGenerator />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 border-b border-slate-200 pb-6">
              

              <h2 className="mt-4 text-2xl font-bold text-[var(--navy)]">
                JWT Token Decoder
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
                This utility is meant for quick inspection and debugging. Paste
                in a JWT to decode the header and payload locally in your
                browser, inspect common claims, and quickly see whether the
                token appears active, expired, or not yet valid.
              </p>
            </div>

            <JwtTokenDecoder />
          </div>
          <div className="border-t border-zinc-200 pt-6">
  <Link
    href="/game-collection"
    className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-400 transition hover:text-[var(--navy)]"
  >
    Ask me about my game collection
  </Link>
</div>
        </section>
      </div>
    </main>
  );
}