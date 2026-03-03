"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content:
        "By accessing and using Oforo's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    },
    {
      title: "Service Description",
      content:
        "Oforo provides AI-powered communication and search services through our platform. These services are provided on an 'as is' and 'as available' basis. We reserve the right to modify or discontinue any service at any time with or without notice.",
    },
    {
      title: "User Obligations",
      content:
        "You agree not to use Oforo's services for any unlawful purpose or in violation of any laws, regulations, or third-party rights. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You agree not to transmit any harmful, defamatory, obscene, or offensive content.",
    },
    {
      title: "Intellectual Property",
      content:
        "All content on the Oforo website, including text, graphics, logos, images, and software, is the property of Oforo Ltd or its content suppliers and is protected by international copyright laws. You are granted a limited license to view and use the content solely for personal, non-commercial purposes.",
    },
    {
      title: "Limitation of Liability",
      content:
        "In no event shall Oforo Ltd be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the services, even if we have been advised of the possibility of such damages. Our total liability shall not exceed the amount you paid for the service in the last 12 months.",
    },
    {
      title: "Changes to Terms",
      content:
        "Oforo reserves the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the service following the posting of revised terms means that you accept and agree to the changes. We recommend reviewing these terms periodically for updates.",
    },
    {
      title: "Governing Law",
      content:
        "These Terms of Service are governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law principles. You irrevocably submit to the exclusive jurisdiction of the courts located in England and Wales.",
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
            Terms of Service
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
          These Terms of Service ("Terms") constitute a legally binding agreement
          between you and Oforo Ltd ("Company"). Please read these terms carefully
          before using our website and services.
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
