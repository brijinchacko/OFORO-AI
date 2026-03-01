'use client';

import Link from 'next/link';
import { ArrowLeft, Code } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const year = new Date().getFullYear();

const endpoints = [
  {
    method: 'POST',
    path: '/v1/chat/completions',
    title: 'Chat Completions',
    description: 'Generate responses based on user messages.',
    request: JSON.stringify(
      {
        model: 'oforo-ai-v1',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is machine learning?' },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        id: 'chatcmpl-123',
        object: 'text_completion',
        created: 1234567890,
        model: 'oforo-ai-v1',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Machine learning is a subset of artificial intelligence...',
            },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 25, completion_tokens: 50, total_tokens: 75 },
      },
      null,
      2
    ),
  },
  {
    method: 'POST',
    path: '/v1/embeddings',
    title: 'Generate Embeddings',
    description: 'Create vector embeddings for semantic search.',
    request: JSON.stringify(
      {
        model: 'text-embedding-3',
        input: 'Machine learning fundamentals',
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        object: 'list',
        data: [
          {
            object: 'embedding',
            embedding: [0.123, -0.456, 0.789],
            index: 0,
          },
        ],
        model: 'text-embedding-3',
        usage: { prompt_tokens: 5, total_tokens: 5 },
      },
      null,
      2
    ),
  },
  {
    method: 'GET',
    path: '/v1/models',
    title: 'List Models',
    description: 'Get a list of available models.',
    request: 'No request body required',
    response: JSON.stringify(
      {
        object: 'list',
        data: [
          {
            id: 'oforo-ai-v1',
            object: 'model',
            created: 1234567890,
            owned_by: 'oforo',
          },
          {
            id: 'text-embedding-3',
            object: 'model',
            created: 1234567890,
            owned_by: 'oforo',
          },
        ],
      },
      null,
      2
    ),
  },
];

export default function ApiReferencePage() {
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
            API Reference
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              marginBottom: '48px',
              maxWidth: '600px',
            }}
          >
            Complete documentation for Oforo API endpoints
          </p>
        </div>

        {/* Endpoints */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {endpoints.map((endpoint, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {/* Endpoint Header */}
                <div
                  style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--border-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor:
                        endpoint.method === 'POST'
                          ? '#4CAF50'
                          : endpoint.method === 'GET'
                            ? '#2196F3'
                            : '#FF9800',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      minWidth: '50px',
                      textAlign: 'center',
                    }}
                  >
                    {endpoint.method}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        fontFamily: '"Courier New", monospace',
                      }}
                    >
                      {endpoint.path}
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        marginTop: '4px',
                      }}
                    >
                      {endpoint.title}
                    </div>
                  </div>
                </div>

                {/* Endpoint Content */}
                <div style={{ padding: '24px' }}>
                  <p
                    style={{
                      fontSize: '15px',
                      color: 'var(--text-secondary)',
                      marginBottom: '24px',
                      lineHeight: '1.6',
                    }}
                  >
                    {endpoint.description}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '24px',
                    }}
                  >
                    {/* Request */}
                    <div>
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          marginBottom: '12px',
                          color: 'var(--text-primary)',
                        }}
                      >
                        Request
                      </h4>
                      <pre
                        style={{
                          backgroundColor: '#1e1e1e',
                          color: '#d4d4d4',
                          padding: '16px',
                          borderRadius: '8px',
                          overflow: 'auto',
                          fontSize: '12px',
                          lineHeight: '1.5',
                          fontFamily: '"Courier New", monospace',
                          margin: 0,
                        }}
                      >
                        {endpoint.request}
                      </pre>
                    </div>

                    {/* Response */}
                    <div>
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          marginBottom: '12px',
                          color: 'var(--text-primary)',
                        }}
                      >
                        Response
                      </h4>
                      <pre
                        style={{
                          backgroundColor: '#1e1e1e',
                          color: '#d4d4d4',
                          padding: '16px',
                          borderRadius: '8px',
                          overflow: 'auto',
                          fontSize: '12px',
                          lineHeight: '1.5',
                          fontFamily: '"Courier New", monospace',
                          margin: 0,
                        }}
                      >
                        {endpoint.response}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Parameters */}
        <div style={{ maxWidth: '1200px', margin: '48px auto 0' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '12px',
              padding: '32px',
            }}
          >
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '24px',
              }}
            >
              Common Parameters
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              <div>
                <h4
                  style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  Authorization
                </h4>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  All requests must include your API key in the Authorization header: Bearer YOUR_API_KEY
                </p>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  Content-Type
                </h4>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  Set Content-Type: application/json for all POST requests with JSON bodies.
                </p>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  Rate Limiting
                </h4>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                  }}
                >
                  Rate limits depend on your plan. Check response headers for limit information.
                </p>
              </div>
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
          marginTop: '48px',
        }}
      >
        © {year} Oforo Ltd · A Wartens Company
      </footer>
    </div>
  );
}
