'use client'
import QRCodeGenerator from "../components/QRCodeGenerator";

export default function Skills() {
    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-[var(--navy)]">
  QR Code Generator
</h1>
            <QRCodeGenerator></QRCodeGenerator>
        </main>
    )
}