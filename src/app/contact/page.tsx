'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useState } from 'react';

const year = new Date().getFullYear();

export default function ContactPage() {
  useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

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
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '48px' }}>
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
            Get in Touch
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
            }}
          >
            Have a question or want to work with us? We'd love to hear from you.
          </p>
        </div>

        {/* Content Grid */}
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '48px',
              alignItems: 'start',
            }}
          >
            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-primary)';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-primary)';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--accent)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-primary)';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s ease',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'opacity 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Company Info */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  padding: '40px',
                }}
              >
                <h3
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '32px',
                  }}
                >
                  Contact Information
                </h3>

                <div style={{ marginBottom: '32px' }}>
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}
                  >
                    Company
                  </h4>
                  <p
                    style={{
                      fontSize: '16px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                    }}
                  >
                    Oforo Ltd
                  </p>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <MapPin size={20} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          marginBottom: '8px',
                        }}
                      >
                        Location
                      </h4>
                      <p
                        style={{
                          fontSize: '16px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Milton Keynes, UK
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <Mail size={20} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          marginBottom: '8px',
                        }}
                      >
                        Email
                      </h4>
                      <a
                        href="mailto:hello@oforo.com"
                        style={{
                          fontSize: '16px',
                          color: 'var(--accent)',
                          textDecoration: 'none',
                          transition: 'opacity 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        hello@oforo.com
                      </a>
                    </div>
                  </div>
                </div>
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
