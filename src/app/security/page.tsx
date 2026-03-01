"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Security — How We Protect Your Data",
  description: "Learn how Oforo AI protects your data with encryption, GDPR compliance, and SOC 2 Type II certification.",
  keywords: ["AI security", "data protection", "Oforo security"],
};

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description:
        "All data in transit is encrypted using TLS 1.3 protocols. Sensitive data at rest is encrypted using AES-256 encryption standards.",
    },
    {
      icon: Shield,
      title: "Data Handling",
      description:
        "We follow strict data handling protocols with role-based access controls. Regular security audits ensure compliance with our security standards.",
    },
    {
      icon: CheckCircle,
      title: "GDPR Compliance",
      description:
        "Oforo is fully compliant with the General Data Protection Regulation (GDPR). We provide data subject rights and maintain detailed processing records.",
    },
    {
      icon: AlertCircle,
      title: "SOC 2 Type II",
      description:
        "We maintain SOC 2 Type II certification, demonstrating our commitment to security, availability, processing integrity, confidentiality, and privacy.",
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
            Security
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
        {/* Hero Section */}
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
            <Shield size={32} color="var(--accent)" />
            <div>
              <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
                Security is Our Priority
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-tertiary)",
                  fontSize: "0.95rem",
                }}
              >
                We take the security of your data seriously and implement industry-leading
                practices to protect your information.
              </p>
            </div>
          </div>
        </div>

        {/* Security Features Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
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
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <IconComponent size={24} color="var(--accent)" />
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                    {feature.title}
                  </h3>
                </div>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Vulnerability Reporting */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "0.5rem",
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              margin: "0 0 1rem 0",
              fontSize: "1.3rem",
              color: "var(--accent)",
            }}
          >
            Vulnerability Reporting
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              lineHeight: "1.6",
              margin: "0 0 1rem 0",
            }}
          >
            If you discover a security vulnerability in Oforo, please report it responsibly
            to our security team. We appreciate your help in keeping our platform safe.
          </p>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            Do not publicly disclose the vulnerability. Instead, email us at{" "}
            <span style={{ color: "var(--accent)", fontWeight: "bold" }}>
              security@oforo.com
            </span>{" "}
            with details. We commit to responding within 48 hours and will work with you to
            address the issue.
          </p>
        </div>

        {/* Security Standards */}
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "0.5rem",
            padding: "2rem",
          }}
        >
          <h2
            style={{
              margin: "0 0 1rem 0",
              fontSize: "1.3rem",
              color: "var(--accent)",
            }}
          >
            Security Standards
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1rem",
                  color: "var(--text-primary)",
                }}
              >
                Certifications
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.5rem",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                <li>SOC 2 Type II</li>
                <li>GDPR Compliant</li>
                <li>ISO 27001 Aligned</li>
              </ul>
            </div>
            <div>
              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1rem",
                  color: "var(--text-primary)",
                }}
              >
                Encryption Standards
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.5rem",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                <li>TLS 1.3 (In Transit)</li>
                <li>AES-256 (At Rest)</li>
                <li>SHA-256 (Hashing)</li>
              </ul>
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
