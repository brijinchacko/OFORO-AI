'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Users,
  MessageSquare,
  Layout,
  Share2,
  AtSign,
  Info,
  Trash2,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const STORAGE_KEY = 'oforo-notifications';
const POLL_INTERVAL = 2000;

// Icon mapping for notification types
const notificationIcons: Record<string, React.ReactNode> = {
  friend_request: <Users size={18} />,
  new_message: <MessageSquare size={18} />,
  workspace_invite: <Layout size={18} />,
  shared_thread: <Share2 size={18} />,
  shared_canvas: <Layout size={18} />,
  mention: <AtSign size={18} />,
  system: <Info size={18} />,
};

// Color mapping for notification types
const notificationColors: Record<string, string> = {
  friend_request: '#3B82F6',
  new_message: '#10B981',
  workspace_invite: '#F59E0B',
  shared_thread: '#8B5CF6',
  shared_canvas: '#EC4899',
  mention: '#F97316',
  system: '#6B7280',
};

export function addNotification(
  type: string,
  title: string,
  message: string,
  actionUrl?: string
): void {
  const notifications = getNotifications();
  const newNotification: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl,
  };
  notifications.unshift(newNotification);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return getInitialNotifications();
  try {
    return JSON.parse(stored);
  } catch {
    return getInitialNotifications();
  }
}

function getInitialNotifications(): Notification[] {
  const now = new Date();
  return [
    {
      id: 'demo-1',
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'Sarah Chen wants to connect with you',
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      read: false,
    },
    {
      id: 'demo-2',
      type: 'new_message',
      title: 'New Message',
      message: 'You have a message from Alex: "Hey, did you see the latest updates?"',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      read: false,
    },
    {
      id: 'demo-3',
      type: 'workspace_invite',
      title: 'Workspace Invitation',
      message: "You've been invited to join Design Team workspace",
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
      read: true,
    },
    {
      id: 'demo-4',
      type: 'shared_canvas',
      title: 'Canvas Shared',
      message: 'Jamie shared "Q1 Planning Board" with you',
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
      read: true,
    },
    {
      id: 'demo-5',
      type: 'mention',
      title: 'You Were Mentioned',
      message: '@Sarah mentioned you in "Project Kickoff" thread',
      timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(),
      read: false,
    },
  ];
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    setMounted(true);
    setNotifications(getNotifications());
  }, []);

  // Poll localStorage every 2 seconds
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setNotifications(getNotifications());
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [mounted]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    setIsOpen(false);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  if (!mounted) {
    return (
      <div className="relative">
        <button
          className="p-2 rounded-lg transition-colors"
          style={{
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-secondary)',
          }}
          disabled
        >
          <Bell size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-all duration-200 hover:bg-opacity-80"
        style={{
          color: 'var(--text-primary)',
          backgroundColor: isOpen ? 'var(--bg-hover)' : 'var(--bg-secondary)',
        }}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white animate-pulse"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-96 rounded-xl shadow-xl border animate-in fade-in slide-in-from-top-2 duration-200 z-50"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-primary)',
            maxHeight: '600px',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div
            className="sticky top-0 p-4 border-b flex items-center justify-between"
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--bg-elevated)',
            }}
          >
            <h3
              className="font-semibold text-lg"
              style={{ color: 'var(--text-primary)' }}
            >
              Notifications
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg transition-colors"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              <X size={18} />
            </button>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div
              className="p-8 text-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <Info size={32} className="mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div>
              <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className="p-4 cursor-pointer transition-colors duration-150 hover:bg-opacity-50"
                    style={{
                      backgroundColor: notification.read
                        ? 'transparent'
                        : 'var(--bg-hover)',
                    }}
                    onMouseEnter={(e) => {
                      if (!notification.read) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!notification.read) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="flex-shrink-0 p-2 rounded-lg mt-1"
                        style={{
                          backgroundColor: `${
                            notificationColors[notification.type] || '#6B7280'
                          }20`,
                          color: notificationColors[notification.type] || '#6B7280',
                        }}
                      >
                        {notificationIcons[notification.type] || (
                          <Info size={18} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className="font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div
                              className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5 animate-pulse"
                              style={{ backgroundColor: 'var(--accent)' }}
                            />
                          )}
                        </div>
                        <p
                          className="text-sm mt-1 line-clamp-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {notification.message}
                        </p>
                        <p
                          className="text-xs mt-2"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 rounded-lg transition-colors"
                          style={{
                            color: 'var(--text-tertiary)',
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              'var(--bg-hover)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              'transparent')
                          }
                          title="Delete notification"
                        >
                          <Trash2 size={16} />
                        </button>
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 rounded-lg transition-colors"
                            style={{
                              color: 'var(--accent)',
                              backgroundColor: 'transparent',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                'var(--bg-hover)')
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                'transparent')
                            }
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        {notification.read && (
                          <div style={{ color: 'var(--text-tertiary)' }}>
                            <CheckCheck size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              {notifications.length > 0 && (
                <div
                  className="sticky bottom-0 p-3 border-t flex items-center justify-between gap-2"
                  style={{
                    borderColor: 'var(--border-primary)',
                    backgroundColor: 'var(--bg-elevated)',
                  }}
                >
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      color: 'var(--accent)',
                      backgroundColor: 'transparent',
                      border: `1px solid var(--border-primary)`,
                    }}
                    onMouseEnter={(e) => {
                      if (unreadCount > 0) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <CheckCheck size={14} className="inline mr-1" />
                    Mark all as read
                  </button>
                  <button
                    onClick={clearAll}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color: 'var(--text-secondary)',
                      backgroundColor: 'transparent',
                      border: `1px solid var(--border-primary)`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Trash2 size={14} className="inline mr-1" />
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
