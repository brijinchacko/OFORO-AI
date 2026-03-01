'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useState } from 'react';

const year = new Date().getFullYear();

const docCategories = [
  { id: 'getting-started', label: 'Getting Started', icon: 'BookOpen' },
  { id: 'api-reference', label: 'API Reference', icon: 'Code' },
  { id: 'sdks', label: 'SDKs', icon: 'Package' },
  { id: 'examples', label: 'Examples', icon: 'Lightbulb' },
];

const gettingStartedContent = {
  title: 'Getting Started with Oforo',
  sections: [
    {
      heading: 'Introduction',
      content:
        'Oforo is an AI platform that provides powerful APIs for chat completions, semantic search, and text generation. This guide will help you get up and running with Oforo in minutes.',
    },
    {
      heading: 'Prerequisites',
      content: 'You will need:\n• An Oforo account (sign up at oforo.com)\n• Your API key (available in your dashboard)\n• A programming language or HTTP client',
    },
    {
      heading: 'Installation',
      content:
        'Install the Oforo SDK for your preferred language:\n\npip install oforo  # Python\nnpm install @oforo/sdk  # JavaScript\ngo get github.com/oforo/oforo-go  # Go',
    },
    {
      heading: 'Your First Request',
      content:
        'Here\'s a simple example to get you started:\n\nfrom oforo import Oforo\nclient = Oforo(api_key="your_api_key")\nresponse = client.chat.completions.create(\n    model="oforo-ai-v1",\n    messages=[{"role": "user", "content": "Hello!"}]\n)\nprint(response.choices[0].message.content)',
    },
    {
      heading: 'Next Steps',
      content:
        'Check out the API Reference for detailed information about all available endpoints and parameters. For code examples and use cases, visit our Examples section.',
    },
  ],
};

export default function DocsPage() {
  useTheme();
  const [activeCategory, setActiveCategory] = useState('getting-started');

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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '40px 20px', borderBottom: '1px solid var(--border-primary)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent)',
                textDecoration: 'none',
                marginBottom: '24px',
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
                letterSpacing: '-0.5px',
              }}
            >
              Documentation
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '40px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '48px' }}>
              {/* Sidebar */}
              <nav
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {docCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      backgroundColor:
                        activeCategory === category.id ? 'var(--bg-secondary)' : 'transparent',
                      border:
                        activeCategory === category.id
                          ? `2px solid var(--accent)`
                          : '1px solid transparent',
                      borderRadius: '8px',
                      color:
                        activeCategory === category.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '14px',
                      fontWeight: activeCategory === category.id ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (activeCategory !== category.id) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeCategory !== category.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {category.label}
                  </button>
                ))}
              </nav>

              {/* Content */}
              {activeCategory === 'getting-started' && (
                <div>
                  <h2
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      marginBottom: '32px',
                    }}
                  >
                    {gettingStartedContent.title}
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {gettingStartedContent.sections.map((section, idx) => (
                      <div key={idx}>
                        <h3
                          style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            marginBottom: '12px',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {section.heading}
                        </h3>
                        <div
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            padding: '16px',
                            borderRadius: '8px',
                            borderLeft: '4px solid var(--accent)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: '14px',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.6',
                            fontFamily: section.heading === 'Installation' || section.heading === 'Your First Request' ? '"Courier New", monospace' : 'inherit',
                          }}
                        >
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === 'api-reference' && (
                <div>
                  <h2
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      marginBottom: '32px',
                    }}
                  >
                    API Reference
                  </h2>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '12px',
                      padding: '32px',
                    }}
                  >
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Complete API documentation with endpoint specifications, request/response formats, and
                      error codes. Visit the dedicated API Reference page for detailed information about
                      chat completions, search, models, and more.
                    </p>
                  </div>
                </div>
              )}

              {activeCategory === 'sdks' && (
                <div>
                  <h2
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      marginBottom: '32px',
                    }}
                  >
                    SDKs
                  </h2>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '12px',
                      padding: '32px',
                    }}
                  >
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Oforo provides official SDKs for Python, JavaScript, and Go. Each SDK includes type
                      definitions, automatic retries, and built-in support for streaming responses. Choose
                      the SDK that best matches your development environment.
                    </p>
                  </div>
                </div>
              )}

              {activeCategory === 'examples' && (
                <div>
                  <h2
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      marginBottom: '32px',
                    }}
                  >
                    Examples
                  </h2>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '12px',
                      padding: '32px',
                    }}
                  >
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      Explore real-world examples of integrating Oforo into your applications. From simple
                      chat applications to complex multi-turn conversations and RAG systems, find code
                      samples and best practices.
                    </p>
                  </div>
                </div>
              )}
            </div>
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
