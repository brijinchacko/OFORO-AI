import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Send,
  Smile,
  CheckCheck,
  Clock,
  Heart,
  ThumbsUp,
  Flame,
  Laugh,
} from 'lucide-react';
import { Friend } from './FriendsPanel';

// Types
export interface DMMessage {
  id: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  content: string;
  type: 'text' | 'thread-link' | 'canvas-link';
  read: boolean;
  createdAt: string;
  reactions?: { emoji: string; users: string[] }[];
}

export interface DMConversation {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  friendAvatarColor: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  messages: DMMessage[];
}

export interface MessageReaction {
  emoji: string;
  users: string[];
}

interface DirectMessagesProps {
  isOpen: boolean;
  onClose: () => void;
  activeFriend?: Friend | null;
  friends: Friend[];
  currentUser: {
    id: string;
    name: string;
    avatar: string;
  };
}

export const getUnreadCount = (conversations: DMConversation[]): number => {
  return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
};

const POLL_INTERVAL = 3000;

const DirectMessages: React.FC<DirectMessagesProps> = ({
  isOpen,
  onClose,
  activeFriend,
  currentUser,
}) => {
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFetchRef = useRef<string | null>(null);

  // Fetch messages from server API
  const fetchMessages = useCallback(async (friendId: string, since?: string) => {
    try {
      let url = `/api/messages?friendId=${friendId}`;
      if (since) url += `&since=${encodeURIComponent(since)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data.messages as DMMessage[];
    } catch {
      return null;
    }
  }, []);

  // Mark messages as read on server
  const markAsRead = useCallback(async (friendId: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });
    } catch { /* ignore */ }
  }, []);

  // Load full conversation when activeFriend changes
  useEffect(() => {
    if (!activeFriend || !isOpen) {
      setMessages([]);
      lastFetchRef.current = null;
      return;
    }

    (async () => {
      const msgs = await fetchMessages(activeFriend.id);
      if (msgs) {
        setMessages(msgs);
        if (msgs.length > 0) {
          lastFetchRef.current = msgs[msgs.length - 1].createdAt;
        }
        markAsRead(activeFriend.id);
      }
    })();
  }, [activeFriend, isOpen, fetchMessages, markAsRead]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!activeFriend || !isOpen) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      return;
    }

    pollRef.current = setInterval(async () => {
      const newMsgs = await fetchMessages(activeFriend.id, lastFetchRef.current || undefined);
      if (newMsgs && newMsgs.length > 0) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const unique = newMsgs.filter((m) => !ids.has(m.id));
          if (unique.length === 0) return prev;
          return [...prev, ...unique];
        });
        lastFetchRef.current = newMsgs[newMsgs.length - 1].createdAt;
        markAsRead(activeFriend.id);
      }
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [activeFriend, isOpen, fetchMessages, markAsRead]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message via API
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !activeFriend || sending) return;

    setSending(true);
    setMessageInput('');
    setShowEmojiPicker(false);

    // Optimistic UI: show message immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: DMMessage = {
      id: tempId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: activeFriend.id,
      content,
      type: 'text',
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: activeFriend.id, content, type: 'text' }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace temp message with server-confirmed one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...data.message, senderName: currentUser.name } : m))
        );
        lastFetchRef.current = data.message.createdAt;
      } else {
        // Remove optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(messageInput);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const emojiReactions = [
    { icon: Heart, emoji: '❤️' },
    { icon: ThumbsUp, emoji: '👍' },
    { icon: Flame, emoji: '🔥' },
    { icon: Laugh, emoji: '😂' },
  ];

  if (!isOpen || !activeFriend) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      style={{
        width: '340px',
        height: '440px',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-hover)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: activeFriend.avatarColor }}
            >
              {activeFriend.avatar}
            </div>
            {activeFriend.status === 'online' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2"
                style={{ borderColor: 'var(--bg-secondary)' }} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {activeFriend.name}
            </p>
            <p className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
              {activeFriend.status === 'online' ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> online</>
              ) : 'offline'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:opacity-80"
          style={{ backgroundColor: 'var(--bg-hover)' }}
        >
          <X size={16} style={{ color: 'var(--text-primary)' }} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
              Send a message to start chatting with {activeFriend.name.split(' ')[0]}
            </p>
          </div>
        )}
        {messages.map((message) => {
          const isMine = message.senderId === currentUser.id;
          return (
            <div
              key={message.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col gap-0.5 max-w-[75%]">
                <div
                  className="group px-3 py-2 rounded-xl relative"
                  style={{
                    backgroundColor: isMine ? 'var(--accent)' : 'var(--bg-secondary)',
                  }}
                >
                  <p
                    className="text-[13px] leading-snug"
                    style={{ color: isMine ? '#ffffff' : 'var(--text-primary)' }}
                  >
                    {message.content}
                  </p>

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {message.reactions.map((reaction, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded-full text-[10px]"
                          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                        >
                          {reaction.emoji} {reaction.users.length}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reaction hover menu */}
                  <div className="absolute bottom-full left-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <div className="flex gap-0.5 p-1 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                      {emojiReactions.map(({ emoji }, idx) => (
                        <button
                          key={idx}
                          className="p-1 rounded text-sm hover:scale-110 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timestamp + read */}
                <div className="px-1 flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{formatTime(message.createdAt)}</span>
                  {isMine && (
                    message.read
                      ? <CheckCheck size={11} style={{ color: 'var(--accent)' }} />
                      : <Clock size={11} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t flex-shrink-0" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 rounded-lg transition-colors flex-shrink-0"
            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          >
            <Smile size={16} />
          </button>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-1.5 rounded-lg outline-none text-[13px]"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
          />
          <button
            onClick={() => handleSendMessage(messageInput)}
            disabled={!messageInput.trim() || sending}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-40 flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
          >
            <Send size={16} />
          </button>
        </div>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="mt-1.5 flex gap-1.5 flex-wrap">
            {['😊', '😂', '❤️', '🔥', '👍', '🎉', '🚀', '✨'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => { setMessageInput(messageInput + ' ' + emoji); setShowEmojiPicker(false); }}
                className="w-7 h-7 text-base flex items-center justify-center rounded-lg hover:scale-110 transition-transform"
                style={{ backgroundColor: 'var(--bg-hover)' }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessages;
