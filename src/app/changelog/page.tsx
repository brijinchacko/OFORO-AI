"use client";

import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ChangelogPage() {
  const versions = [
    {
      version: "v2.1.0",
      date: "March 2026",
      changes: [
        "Enhanced search functionality with improved relevance ranking",
        "New dark mode optimizations for better readability",
        "Added batch processing capabilities for API",
        "Improved authentication security with additional 2FA options",
        "Performance improvements reducing API response times by 30%",
      ],
    },
    {
      version: "v2.0.0",
      date: "February 2026",
      changes: [
        "Major UI redesign with new component library",
        "Introduction of real-time chat collaboration features",
        "Complete API v2 release with backward compatibility",
        "New admin dashboard with advanced analytics",
        "Support for multi-language interfaces",
      ],
    },
    {
      version: "v1.5.0",
      date: "January 2026",
      changes: [
        "Initial search feature release",
        "Added webhook support for integrations",
        "Implemented comprehensive audit logging",
        "New user onboarding flow",
        "Expanded API documentation",
      ],
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border-primary)",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "bold" }}>
            Changelog
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <p
          style={{
            color: "var(--text-tertiary)",
            marginBottom: "2rem",
            fontSize: "0.95rem",
          }}
        >
          See what's new in Oforo with our latest releases and updates.
        </p>

        {/* Versions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          {versions.map((v, index) => (
            <div
              key={v.version}
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "0.5rem",
                padding: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    color: "var(--accent)",
                  }}
                >
                  {v.version}
                </h2>
                <span
                  style={{
                    color: "var(--text-tertiary)",
                    fontSize: "0.9rem",
                  }}
                >
                  {v.date}
                </span>
              </div>

              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.5rem",
                  listStyleType: "disc",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {v.changes.map((change, i) => (
                  <li
                    key={i}
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.95rem",
                    }}
                  >
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-primary)",
          padding: "2rem",
          backgroundColor: "var(--bg-secondary)",
          textAlign: "center",
          fontSize: "0.875rem",
          color: "var(--text-tertiary)",
        }}
      >
        <p style={{ margin: 0 }}>
          © 2026 Oforo Ltd. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
