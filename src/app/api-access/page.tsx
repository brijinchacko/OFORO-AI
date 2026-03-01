'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Code, Zap, Check } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const year = new Date().getFullYear();

const apiOfferings = [
  {
    id: 1,
    title: 'REST API',
    description: 'Standard HTTP-based API for seamless integration with any platform.',
  },
  {
    id: 2,
    title: 'WebSocket',
    description: 'Real-time bidirectional communication for streaming responses.',
  },
  {
    id: 3,
    title: 'SDK',
    description: 'Official SDKs for Python, JavaScript, and Go with full type support.',
  },
];

const pricingTiers = [
  {
    name: 'Developer',
    price: 'Free',
    requests: '1,000 requests/month',
    support: 'Community',
    features: ['REST API', 'SDK Access', 'Community Support'],
  },
  {
    name: 'Professional',
    price: '$99',
    requests: '100,000 requests/month',
    support: 'Email Support',
    features: ['REST API', 'WebSocket', 'SDK Access', 'Email Support', 'Rate Limit Increase'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    requests: 'Unlimited',
    support: '24/7 Support',
    features: ['REST API', 'WebSocket', 'SDK Access', '24/7 Priority Support', 'SLA', 'Dedicated Account Manager'],
  },
];

export const metadata: Metadata = {
  title: "API Access — Integrate Oforo AI",
  description: "Get started with Oforo AI APIs. REST API, WebSocket, and SDK access for developers building with Oforo AI.",
  keywords: ["AI API", "Oforo API", "AI developer tools", "AI integration"],
};

export default function ApiAccessPage() {
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
            API Access
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              marginBottom: '48px',
              maxWidth: '600px',
            }}
          >
            Powerful APIs to integrate AI capabilities into your applications
          </p>
        </div>

        {/* API Offerings */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '32px',
            }}
          >
            Our API Offerings
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {apiOfferings.map((offering) => (
              <div
                key={offering.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                }}
              >
                <Code
                  size={32}
                  style={{ color: 'var(--accent)', marginBottom: '16px', margin: '0 auto 16px' }}
                />
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '12px',
                  }}
                >
                  {offering.title}
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  {offering.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Code Examples */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '64px' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '32px',
            }}
          >
            Quick Start Examples
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Python Example */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: '16px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Python
              </div>
              <pre
                style={{
                  padding: '24px',
                  margin: 0,
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  overflow: 'auto',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  fontFamily: '"Courier New", monospace',
                }}
              >
{`import oforo

client = oforo.Client(
    api_key="your_api_key"
)

response = client.chat.completions.create(
    model="oforo-ai-v1",
    messages=[{
        "role": "user",
        "content": "Hello!"
    }]
)

print(response.choices[0].message.content)`}
              </pre>
            </div>

            {/* JavaScript Example */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: '16px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                JavaScript
              </div>
              <pre
                style={{
                  padding: '24px',
                  margin: 0,
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  overflow: 'auto',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  fontFamily: '"Courier New", monospace',
                }}
              >
{`import Oforo from '@oforo/sdk';

const client = new Oforo({
  apiKey: 'your_api_key'
});

const response = await client.chat.completions.create({
  model: 'oforo-ai-v1',
  messages: [{
    role: 'user',
    content: 'Hello!'
  }]
});

console.log(response.choices[0].message.content);`}
              </pre>
            </div>

            {/* cURL Example */}
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: '16px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                cURL
              </div>
              <pre
                style={{
                  padding: '24px',
                  margin: 0,
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  overflow: 'auto',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  fontFamily: '"Courier New", monospace',
                }}
              >
{`curl -X POST https://api.oforo.com/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "oforo-ai-v1",
    "messages": [{
      "role": "user",
      "content": "Hello!"
    }]
  }'`}
              </pre>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '32px',
              textAlign: 'center',
            }}
          >
            Pricing Plans
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: index === 1 ? `2px solid var(--accent)` : '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transform: index === 1 ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                }}
              >
                {index === 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <h3
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    marginTop: index === 1 ? '12px' : '0',
                  }}
                >
                  {tier.name}
                </h3>

                <div style={{ marginBottom: '24px' }}>
                  <span
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: 'var(--accent)',
                    }}
                  >
                    {tier.price}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-tertiary)',
                      marginLeft: '8px',
                    }}
                  >
                    {tier.price !== 'Custom' ? '/month' : ''}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                  }}
                >
                  {tier.requests}
                </div>

                <ul style={{ flex: 1, marginBottom: '24px' }}>
                  {tier.features.map((feature, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Check size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  style={{
                    backgroundColor: index === 1 ? 'var(--accent)' : 'var(--bg-primary)',
                    color: index === 1 ? '#ffffff' : 'var(--accent)',
                    border: index === 1 ? 'none' : '1px solid var(--accent)',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onClick={() => {
                    window.location.href = 'mailto:hello@oforo.com?subject=API%20Key%20Request';
                  }}
                >
                  Get API Key
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
