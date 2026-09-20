"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#020617",
          color: "#f8fafc",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#60a5fa", fontWeight: 700 }}>CashFlow</p>

            <h1 style={{ marginTop: "12px" }}>
              The application couldn&apos;t load
            </h1>

            <p
              style={{
                color: "#cbd5e1",
                lineHeight: 1.6,
              }}
            >
              An unexpected error occurred. Please try loading CashFlow again.
            </p>

            {error.digest ? (
              <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                Reference: {error.digest}
              </p>
            ) : null}

            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "20px",
                border: 0,
                borderRadius: "8px",
                background: "#2563eb",
                color: "white",
                padding: "11px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}