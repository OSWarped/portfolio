'use client';

// React hooks used for component state and memoized derived values.
import { useMemo, useState } from 'react';

// Generic JSON-like object shape for decoded header/payload data.
type JsonRecord = Record<string, unknown>;

// Possible statuses for the token after decoding and inspection.
type DecodeStatus = 'idle' | 'active' | 'expired' | 'notYetValid' | 'invalid';

// Shape of the decoded result we store in component state.
type DecodeResult = {
  status: DecodeStatus;
  error?: string;
  headerRaw?: string;
  payloadRaw?: string;
  signature?: string;
  header?: JsonRecord;
  payload?: JsonRecord;
};

// Friendly display labels for common JWT claims.
const commonClaimLabels: Record<string, string> = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expires',
  nbf: 'Not Before',
  iat: 'Issued At',
  jti: 'JWT ID',
  typ: 'Type',
  azp: 'Authorized Party',
  scope: 'Scope',
  client_id: 'Client ID',
};

// Type guard to make sure a decoded JSON value is a plain object
// and not null or an array.
function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Decode a Base64URL-encoded JWT segment into a readable string.
// JWTs use URL-safe Base64, so we first convert it back to normal Base64.
function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Encode a string into Base64URL format.
// This is mainly used to build a sample JWT for the demo button.
function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

// Convert a JWT numeric timestamp (seconds since Unix epoch)
// into a local readable date/time string.
function formatTimestamp(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toLocaleString();
}

// Format claim values for display in the UI.
// Some claims are timestamps, some may be arrays, and some may be objects.
function formatClaimValue(key: string, value: unknown): string {
  // For time-based claims, show both the raw Unix timestamp and readable date.
  if (['exp', 'nbf', 'iat'].includes(key) && typeof value === 'number') {
    return `${value} (${formatTimestamp(value) ?? 'Invalid date'})`;
  }

  // Display arrays as comma-separated values.
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  // Pretty-print nested objects.
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }

  // Everything else becomes a string.
  return String(value);
}

// Build a fake sample token so users can test the decoder without
// needing to paste in a real JWT.
function createSampleToken(): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  // Current time in seconds.
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    iss: 'portfolio-demo',
    sub: 'user-123',
    aud: 'portfolio-utilities',
    iat: now,
    nbf: now - 60,
    exp: now + 60 * 60,
    name: 'Demo User',
    role: 'developer',
    scope: 'read:projects write:utilities',
  };

  // Encode header, payload, and a fake signature into JWT format.
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const encodedSignature = base64UrlEncode('demo-signature');

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// Determine the token status based on time-related payload claims.
// This does NOT verify the signature; it only inspects exp/nbf.
function getStatusFromPayload(payload: JsonRecord): DecodeStatus {
  const now = Math.floor(Date.now() / 1000);
  const exp = typeof payload.exp === 'number' ? payload.exp : null;
  const nbf = typeof payload.nbf === 'number' ? payload.nbf : null;

  if (nbf && now < nbf) return 'notYetValid';
  if (exp && now >= exp) return 'expired';
  return 'active';
}

// Return Tailwind classes for the status badge based on token status.
function statusBadgeClasses(status: DecodeStatus): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'expired':
      return 'bg-rose-100 text-rose-700 border border-rose-200';
    case 'notYetValid':
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'invalid':
      return 'bg-slate-200 text-slate-700 border border-slate-300';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
}

// Return a human-readable label for the current status.
function statusLabel(status: DecodeStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'expired':
      return 'Expired';
    case 'notYetValid':
      return 'Not Yet Valid';
    case 'invalid':
      return 'Invalid Token';
    default:
      return 'Ready';
  }
}

export default function JwtTokenDecoder() {
  // Stores the raw JWT the user pastes into the textarea.
  const [token, setToken] = useState('');

  // Stores the decoded result, error state, and token status.
  const [result, setResult] = useState<DecodeResult>({ status: 'idle' });

  // Tracks which section was most recently copied to clipboard.
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Pull only the claims we want to highlight in the "Common Claims" section.
  // useMemo avoids recalculating unless the payload changes.
  const displayedClaims = useMemo(() => {
    if (!result.payload) return [];

    return Object.entries(result.payload).filter(([key]) =>
      Object.prototype.hasOwnProperty.call(commonClaimLabels, key)
    );
  }, [result.payload]);

  // Main decode action for the "Decode Token" button.
  const decodeToken = () => {
    const trimmed = token.trim();

    // Guard against empty input.
    if (!trimmed) {
      setResult({
        status: 'invalid',
        error: 'Paste a JWT token to decode.',
      });
      return;
    }

    // JWTs should have exactly 3 sections: header.payload.signature
    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      setResult({
        status: 'invalid',
        error: 'A JWT must contain exactly three segments separated by periods.',
      });
      return;
    }

    try {
      const [headerSegment, payloadSegment, signatureSegment] = parts;

      // Decode the header and payload from Base64URL into plain text JSON.
      const decodedHeader = base64UrlDecode(headerSegment);
      const decodedPayload = base64UrlDecode(payloadSegment);

      // Parse the decoded text into JavaScript objects.
      const headerValue = JSON.parse(decodedHeader) as unknown;
      const payloadValue = JSON.parse(decodedPayload) as unknown;

      // Ensure both parsed values are plain objects.
      if (!isRecord(headerValue) || !isRecord(payloadValue)) {
        setResult({
          status: 'invalid',
          error: 'The decoded header or payload is not valid JSON object data.',
        });
        return;
      }

      // Save the decoded token information into state.
      setResult({
        status: getStatusFromPayload(payloadValue),
        headerRaw: decodedHeader,
        payloadRaw: decodedPayload,
        signature: signatureSegment,
        header: headerValue,
        payload: payloadValue,
      });
    } catch {
      // Catch malformed Base64, invalid JSON, or other decode failures.
      setResult({
        status: 'invalid',
        error: 'Unable to decode this token. Make sure it is a properly formatted JWT.',
      });
    }
  };

  // Reset the form and clear all decoded output.
  const clearAll = () => {
    setToken('');
    setResult({ status: 'idle' });
    setCopiedSection(null);
  };

  // Load a sample JWT into the textarea for quick testing.
  const loadSample = () => {
    const sample = createSampleToken();
    setToken(sample);
    setCopiedSection(null);
    setResult({ status: 'idle' });
  };

  // Copy a block of text to the clipboard and briefly show "Copied".
  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedSection(label);
      window.setTimeout(() => setCopiedSection(null), 1500);
    } catch {
      setCopiedSection(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Input area where the user pastes a JWT and triggers actions */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label
          htmlFor="jwt-token"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Paste JWT
        </label>

        <textarea
          id="jwt-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="min-h-36 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 outline-none transition focus:border-[var(--cardinal)]"
        />

        {/* Action buttons for decode, demo token, and reset */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={decodeToken}
            className="rounded-xl bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--navy-raise)]"
          >
            Decode Token
          </button>

          <button
            onClick={loadSample}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Load Sample Token
          </button>

          <button
            onClick={clearAll}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Disclaimer so users know this tool only decodes and does not verify signatures */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <span className="font-semibold">Important:</span> this tool decodes JWT
        data locally in your browser for inspection. It does not verify the
        token signature or prove that the token is authentic.
      </div>

      {/* Status badge and either an error message or reassurance text */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusBadgeClasses(
            result.status
          )}`}
        >
          {statusLabel(result.status)}
        </span>

        {result.error ? (
          <span className="text-sm text-rose-700">{result.error}</span>
        ) : (
          <span className="text-sm text-slate-600">
            Decode tokens without sending them to a server.
          </span>
        )}
      </div>

      {/* Only show decoded details if a payload was successfully parsed */}
      {result.payload && (
        <div className="grid gap-5">
          {/* Summary card for common JWT claims */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--navy)]">
              Common Claims
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {displayedClaims.length > 0 ? (
                displayedClaims.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {commonClaimLabels[key] ?? key}
                    </div>
                    <div className="mt-1 break-words text-sm text-slate-800 whitespace-pre-wrap">
                      {formatClaimValue(key, value)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">
                  No common JWT claims were found in this payload.
                </p>
              )}
            </div>
          </div>

          {/* Side-by-side decoded JSON for header and payload */}
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-[var(--navy)]">
                  Header
                </h3>

                {/* Copy the raw decoded header JSON */}
                {result.headerRaw && (
                  <button
                    onClick={() => copyText('header', result.headerRaw!)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {copiedSection === 'header' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>

              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-[var(--navy)]">
                  Payload
                </h3>

                {/* Copy the raw decoded payload JSON */}
                {result.payloadRaw && (
                  <button
                    onClick={() => copyText('payload', result.payloadRaw!)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {copiedSection === 'payload' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>

              <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </section>
          </div>

          {/* Raw signature section for completeness */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-[var(--navy)]">
              Signature
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This is the raw signature segment from the token. It is shown for
              completeness only and is not verified by this utility.
            </p>

            <div className="mt-4 break-all rounded-xl bg-slate-50 p-4 font-mono text-sm text-slate-800">
              {result.signature}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}