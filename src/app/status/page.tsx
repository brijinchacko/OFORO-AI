"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle, Zap } from "lucide-react";

export default function StatusPage() {
  const services = [
    { name: "API", status: "operational" },
    { name: "Chat", status: "operational" },
    { name: "Search", status: "operational" },
    { name: "Authentication", status: "operational" },
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
            System Status
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
        {/* Status Overview */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "0.5rem",
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <CheckCircle size={32} color="#10b981" />
            <div>
              <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
                All Systems Operational
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-tertiary)",
                  fontSize: "0.95rem",
                }}
              >
                All services are running smoothly
              </p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "1rem",
            }}
          >
            <Zap size={18} color="#f59e0b" />
            <span style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
              Uptime: <strong>99.9%</strong>
            </span>
          </div>
        </div>

        {/* Services Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {services.map((service) => (
            <div
              key={service.name}
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "0.5rem",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                  {service.name}
                </h3>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                  }}
                />
              </div>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-tertiary)",
                  fontSize: "0.9rem",
                  textTransform: "capitalize",
                }}
              >
                {service.status}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            marginTop: "2rem",
          }}
        >
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
            Last 30 Days
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <p
                style={{
                  margin: "0 0 0.5rem 0",
                  color: "var(--text-tertiary)",
                  fontSize: "0.9rem",
                }}
              >
                Average Uptime
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "var(--accent)",
                }}
              >
                99.92%
              </p>
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 0.5rem 0",
                  color: "var(--text-tertiary)",
                  fontSize: "0.9rem",
                }}
              >
                Incidents
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                0
              </p>
            </div>
          </div>
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
