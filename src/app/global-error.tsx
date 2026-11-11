'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-US">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          padding: '4rem 1.5rem',
          textAlign: 'center',
          background: '#FBF8F2',
          color: '#071E2A',
        }}
      >
        <h1 style={{ fontSize: '1.5rem' }}>Koral Digital is having trouble loading.</h1>
        <p style={{ opacity: 0.7 }}>
          Please try again in a moment{error.digest ? ` (reference ${error.digest})` : ''}.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.2rem',
            borderRadius: 12,
            border: 0,
            background: '#04A5B8',
            color: 'white',
            fontWeight: 600,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
