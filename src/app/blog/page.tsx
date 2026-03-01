'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, ArrowRight } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const year = new Date().getFullYear();

const blogPosts = [
  {
    id: 1,
    title: 'The Future of AI in Enterprise',
    date: 'March 15, 2026',
    excerpt: 'Exploring how artificial intelligence is transforming enterprise software and business processes across industries.',
    slug: 'future-of-ai-enterprise',
  },
  {
    id: 2,
    title: 'LLMs: From Theory to Production',
    date: 'February 28, 2026',
    excerpt: 'A comprehensive guide to deploying large language models in production environments with best practices and lessons learned.',
    slug: 'llms-theory-to-production',
  },
  {
    id: 3,
    title: 'Building Intelligent APIs',
    date: 'February 10, 2026',
    excerpt: 'Learn how to design and build APIs that leverage AI capabilities to provide smarter, more intuitive user experiences.',
    slug: 'building-intelligent-apis',
  },
  {
    id: 4,
    title: 'Natural Language Processing Trends',
    date: 'January 25, 2026',
    excerpt: 'An overview of the latest trends in NLP including multimodal models, few-shot learning, and real-time processing.',
    slug: 'nlp-trends-2026',
  },
];

export const metadata: Metadata = {
  title: "Blog — AI Insights & Updates",
  description: "Read the latest insights on artificial intelligence, AI trends, LLMs, enterprise AI, and AI development from Oforo AI.",
  keywords: ["AI blog", "artificial intelligence news", "AI updates"],
};

export default function BlogPage() {
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
            Blog
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              marginBottom: '48px',
            }}
          >
            Insights and updates from the Oforo team
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px',
            }}
          >
            {blogPosts.map((post) => (
              <article
                key={post.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-tertiary)',
                    fontSize: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <Calendar size={16} />
                  {post.date}
                </div>

                <h3
                  style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    lineHeight: '1.4',
                  }}
                >
                  {post.title}
                </h3>

                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    marginBottom: '24px',
                    flex: 1,
                    lineHeight: '1.6',
                  }}
                >
                  {post.excerpt}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'gap 0.3s ease',
                  }}
                >
                  Read more
                  <ArrowRight size={16} />
                </Link>
              </article>
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
