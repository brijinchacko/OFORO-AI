"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Oforo AI privacy policy. Learn how we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      content:
        "We collect information you provide directly to us, such as your name, email address, contact information, and any other information you choose to provide. We also automatically collect certain information about your device and how you interact with our services, including IP address, browser type, pages visited, and timestamps.",
    },
    {
      title: "How We Use Information",
      content:
        "We use the information we collect to provide, maintain, and improve our services, process transactions, send transactional and promotional communications, comply with legal obligations, and detect and prevent fraudulent activity. We may also use aggregated and anonymized data for analytics and business intelligence purposes.",
    },
    {
      title: "Data Storage",
      content:
        "Your personal data is stored on secure servers located in the European Union. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. Data is retained only for as long as necessary to fulfill the purposes outlined in this privacy policy.",
    },
    {
      title: "Your Rights",
      content:
        "You have the right to access, correct, or delete your personal data. You may also withdraw consent to data processing at any time. If you believe our processing of your data violates your rights, you have the right to lodge a complaint with your local data protection authority. To exercise any of these rights, please contact us using the information provided below.",
    },
    {
      title: "Cookies",
      content:
        "We use cookies and similar tracking technologies to enhance your experience and understand how you use our services. You can control cookie settings through your browser preferences. However, disabling certain cookies may limit your ability to use certain features of our services.",
    },
    {
      title: "Contact",
      content:
        "If you have any questions or concerns regarding this privacy policy or our privacy practices, please contact us at privacy@oforo.com. We will respond to your inquiry within 30 days.",
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
            Privacy Policy
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: "2rem",
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            borderRadius: "0.5rem",
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <p
            style={{
              color: "var(--text-tertiary)",
              fontSize: "0.95rem",
              margin: 0,
            }}
          >
            Last Updated: March 1, 2026
          </p>
        </div>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          Oforo Ltd ("we," "us," "our," or "Company") is committed to protecting
          your privacy. This Privacy Policy explains how we collect, use, disclose,
          and safeguard your information when you visit our website and use our
          services.
        </p>

        {/* Sections */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          {sections.map((section, index) => (
            <section
              key={index}
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "0.5rem",
                padding: "1.5rem",
              }}
            >
              <h2
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "1.2rem",
                  color: "var(--accent)",
                }}
              >
                {section.title}
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                }}
              >
                {section.content}
              </p>
            </section>
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
