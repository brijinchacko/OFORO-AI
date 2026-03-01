'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const year = new Date().getFullYear();

const positions = [
  {
    id: 1,
    title: 'AI Engineer',
    location: 'Milton Keynes, UK',
    description: 'Help us build the next generation of AI-powered tools and APIs.',
    type: 'Full-time',
  },
  {
    id: 2,
    title: 'Full Stack Developer',
    location: 'Remote',
    description: 'Design and develop scalable web applications that power Oforo\'s platform.',
    type: 'Full-time',
  },
  {
    id: 3,
    title: 'Product Designer',
    location: 'Milton Keynes, UK',
    description: 'Create intuitive and beautiful user experiences for our AI products.',
    type: 'Full-time',
  },
  {
    id: 4,
    title: 'Data Scientist',
    location: 'Remote',
    description: 'Work on data analysis and machine learning projects that impact thousands of users.',
    type: 'Full-time',
  },
];

export const metadata: Metadata = {
  title: "Careers at Oforo AI — Join Our Team",
  description: "Explore job opportunities at Oforo AI. We're hiring AI engineers, developers, designers, and data scientists in Milton Keynes, UK and Bangalore, India.",
  keywords: ["AI jobs UK", "AI careers", "Oforo careers", "AI jobs Bangalore"],
};

export default function CareersPage() {
  useTheme();

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1, padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--accent)',
              textDecoration: 'none',
              marginBottom: '40px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <h1
            style={{
              fontSize: '48px',
              fontWeight: '700',
              marginBottom: '16px',
              letterSpacing: '-0.5px',
            }}
          >
            Join Oforo
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              lineHeight: '1.6',
              marginBottom: '48px',
            }}
          >
            Oforo is an AI company based in Milton Keynes, UK, part of the Wartens Group. We're building intelligent APIs and tools that help businesses harness the power of artificial intelligence. Join our team and help shape the future of AI.
          </p>
        </div>

        {/* Open Positions */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '32px',
              color: 'var(--text-primary)',
            }}
          >
            Open Positions
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {positions.map((position) => (
              <div
                key={position.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        marginBottom: '8px',
                      }}
                    >
                      {position.title}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--text-tertiary)',
                        fontSize: '14px',
                      }}
                    >
                      <MapPin size={14} />
                      {position.location}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '6px 12px',
                      borderRadius: '6px',
                    }}
                  >
                    {position.type}
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    marginBottom: '24px',
                    flex: 1,
                    lineHeight: '1.6',
                  }}
                >
                  {position.description}
                </p>

                <button
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'opacity 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onClick={() => {
                    window.location.href = 'mailto:careers@oforo.com';
                  }}
                >
                  Apply
                  <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-primary)',
          padding: '32px 20px',
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          fontSize: '14px',
        }}
      >
        © {year} Oforo Ltd · A Wartens Company
      </footer>
    </div>
  );
}
