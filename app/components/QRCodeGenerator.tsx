'use client';

import { useRef, useState } from 'react';
import QRCode from 'react-qr-code';

const qrTypes = [
  'URL',
  'Text',
  'Phone',
  'SMS',
  'Email',
  'WiFi',
  'Contact (MeCard)',
  'Geo',
  'Event (iCalendar)',
] as const;

type QRType = (typeof qrTypes)[number];

export default function QrCodeGenerator() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [selectedType, setSelectedType] = useState<QRType>('URL');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [qrValue, setQrValue] = useState('');

  const handleGenerate = () => {
    let value = '';

    switch (selectedType) {
      case 'URL':
        value = formData.url || '';
        break;
      case 'Text':
        value = formData.text || '';
        break;
      case 'Phone':
        value = `tel:${formData.phone}`;
        break;
      case 'SMS':
        value = `sms:${formData.phone}?body=${encodeURIComponent(formData.message || '')}`;
        break;
      case 'Email':
        value = `mailto:${formData.email}?subject=${encodeURIComponent(formData.subject || '')}&body=${encodeURIComponent(formData.body || '')}`;
        break;
      case 'WiFi':
        value = `WIFI:T:${formData.encryption};S:${formData.ssid};P:${formData.password};;`;
        break;
      case 'Contact (MeCard)':
        value = `MECARD:N:${formData.name};TEL:${formData.phone};EMAIL:${formData.email};;`;
        break;
      case 'Geo':
        value = `geo:${formData.lat},${formData.lng}`;
        break;
      case 'Event (iCalendar)':
        value = `BEGIN:VEVENT
SUMMARY:${formData.summary}
DTSTART:${formData.start}
DTEND:${formData.end}
LOCATION:${formData.location}
DESCRIPTION:${formData.description}
END:VEVENT`;
        break;
    }

    setQrValue(value);
  };

  const handleDownload = () => {
    const svg = wrapperRef.current?.querySelector('svg');
    if (!svg) return;
  
    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
  
    img.onload = () => {
      const size = 256;
      canvas.width = size;
      canvas.height = size;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
      }
      URL.revokeObjectURL(url);
  
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'qr-code.png';
      downloadLink.click();
    };
  
    img.src = url;
  };
  

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow-md space-y-4">
      <h2 className="text-lg font-semibold text-[var(--navy)]">QR Code Type</h2>
      <select
        value={selectedType}
        onChange={(e) => {
          setSelectedType(e.target.value as QRType);
          setFormData({});
          setQrValue('');
        }}
        className="p-2 border rounded text-black w-full"
      >
        {qrTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <DynamicForm
        type={selectedType}
        formData={formData}
        onChange={setFormData}
      />

      <button
        onClick={handleGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Generate QR Code
      </button>

      {qrValue && (
  <div className="mt-6 flex flex-col items-center gap-4">
    <div ref={wrapperRef} className="bg-white p-4">
      <QRCode value={qrValue} size={256} />
    </div>
    <button
      onClick={handleDownload}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Download as PNG
    </button>
    <p className="text-xs break-all text-center">{qrValue}</p>
  </div>
)}
    </div>
  );
}

function DynamicForm({
  type,
  formData,
  onChange,
}: {
  type: QRType;
  formData: Record<string, string>;
  onChange: (newData: Record<string, string>) => void;
}) {
  const update = (key: string, value: string) =>
    onChange({ ...formData, [key]: value });

  switch (type) {
    case 'URL':
      return <Input label="URL" value={formData.url} onChange={(v) => update('url', v)} />;
    case 'Text':
      return <Input label="Text" value={formData.text} onChange={(v) => update('text', v)} />;
    case 'Phone':
      return <Input label="Phone Number" value={formData.phone} onChange={(v) => update('phone', v)} />;
    case 'SMS':
      return (
        <>
          <Input label="Phone" value={formData.phone} onChange={(v) => update('phone', v)} />
          <Input label="Message" value={formData.message} onChange={(v) => update('message', v)} />
        </>
      );
    case 'Email':
      return (
        <>
          <Input label="Email" value={formData.email} onChange={(v) => update('email', v)} />
          <Input label="Subject" value={formData.subject} onChange={(v) => update('subject', v)} />
          <Input label="Body" value={formData.body} onChange={(v) => update('body', v)} />
        </>
      );
    case 'WiFi':
      return (
        <>
          <Input label="SSID" value={formData.ssid} onChange={(v) => update('ssid', v)} />
          <Input label="Password" value={formData.password} onChange={(v) => update('password', v)} />
          <Input label="Encryption (WPA/WEP)" value={formData.encryption} onChange={(v) => update('encryption', v)} />
        </>
      );
    case 'Contact (MeCard)':
      return (
        <>
          <Input label="Name" value={formData.name} onChange={(v) => update('name', v)} />
          <Input label="Phone" value={formData.phone} onChange={(v) => update('phone', v)} />
          <Input label="Email" value={formData.email} onChange={(v) => update('email', v)} />
        </>
      );
    case 'Geo':
      return (
        <>
          <Input label="Latitude" value={formData.lat} onChange={(v) => update('lat', v)} />
          <Input label="Longitude" value={formData.lng} onChange={(v) => update('lng', v)} />
        </>
      );
    case 'Event (iCalendar)':
      return (
        <>
          <Input label="Summary" value={formData.summary} onChange={(v) => update('summary', v)} />
          <Input label="Start (e.g. 20250521T140000Z)" value={formData.start} onChange={(v) => update('start', v)} />
          <Input label="End (e.g. 20250521T150000Z)" value={formData.end} onChange={(v) => update('end', v)} />
          <Input label="Location" value={formData.location} onChange={(v) => update('location', v)} />
          <Input label="Description" value={formData.description} onChange={(v) => update('description', v)} />
        </>
      );
    default:
      return null;
  }
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 mb-2">
      <label className="font-medium">{label}</label>
      <input
        className="p-2 border rounded text-black"
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
