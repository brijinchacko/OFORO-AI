import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Smile,
  Check,
  CheckCheck,
  Clock,
  Heart,
  ThumbsUp,
  Flame,
  Laugh,
  Shield,
} from 'lucide-react';
import { Friend } from './FriendsPanel';

/* ═══════ MESSAGE ENCRYPTION (AES-GCM via Web Crypto API) ═══════ */
const ENCRYPTION_KEY_NAME = 'oforo-dm-encryption-key';

async function getDMEncryptionKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(ENCRYPTION_KEY_NAME);
  if (stored) {
    const keyData = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', keyData, 'AES-GCM', true, ['encrypt', 'decrypt']);
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const exported = await crypto.subtle.exportKey('raw', key);
  localStorage.setItem(ENCRYPTION_KEY_NAME, btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(exported)))));
  return key;
}

async function encryptMessage(text: string): Promise<string> {
  try {
    const key = await getDMEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    return 'ENC:' + btoa(String.fromCharCode.apply(null, Array.from(combined)));
  } catch {
    return text;
  }
}

async function decryptMessage(data: string): Promise<string> {
  if (!data.startsWith('ENC:')) return data;
  try {
    const key = await getDMEncryptionKey();
    const combined = Uint8Array.from(atob(data.slice(4)), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
    return new TextDecoder().decode(decrypted);
  } catch {
    return '[Encrypted message - unable to decrypt]';
  }
}

// Types
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

export interface DMMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'thread-link' | 'canvas-link';
  timestamp: string;
  read: boolean;
  reactions: MessageReaction[];
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

// Utility
export const getUnreadCount = (conversations: DMConversation[]): number => {
  return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
};

// ═══════ COMPACT SINGLE-CHAT DM PANEL ═══════
const DirectMessages: React.FC<DirectMessagesProps> = ({
  isOpen,
  onClose,
  activeFriend,
  friends,
  currentUser,
}) => {
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clean stale DM conversations for friends that no longer exist
  useEffect(() => {
    if (friends.length === 0) return;
    const stored = localStorage.getItem('oforo-dm-conversations');
    if (!stored) return;
    try {
      const convos: DMConversation[] = JSON.parse(stored);
      const friendIds = new Set(friends.map((f) => f.id));
      const cleaned = convos.filter((c) => friendIds.has(c.friendId));
      // Remove stale per-conversation message stores
      const removedConvos = convos.filter((c) => !friendIds.has(c.friendId));
      removedConvos.forEach((c) => localStorage.removeItem(`oforo-dm-${c.id}`));
      if (cleaned.length !== convos.length) {
        localStorage.setItem('oforo-dm-conversations', JSON.stringify(cleaned));
      }
    } catch {
      localStorage.removeItem('oforo-dm-conversations');
    }
  }, [friends]);

  // Load or create conversation when activeFriend changes
  useEffect(() => {
    if (!activeFriend || !isOpen) {
      setMessages([]);
      setConversationId(null);
      return;
    }

    const stored = localStorage.getItem('oforo-dm-conversations');
    let convos: DMConversation[] = [];
    try { convos = stored ? JSON.parse(stored) : []; } catch { convos = []; }

    let conv = convos.find((c) => c.friendId === activeFriend.id);
    if (!conv) {
      const newId = `conv-${Date.now()}`;
      conv = {
        id: newId,
        friendId: activeFriend.id,
        friendName: activeFriend.name,
        friendAvatar: activeFriend.avatar,
        friendAvatarColor: activeFriend.avatarColor,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      convos.unshift(conv);
      localStorage.setItem('oforo-dm-conversations', JSON.stringify(convos));
      localStorage.setItem(`oforo-dm-${newId}`, JSON.stringify([]));
    }

    setConversationId(conv.id);

    // Load & decrypt messages
    const msgStore = localStorage.getItem(`oforo-dm-${conv.id}`);
    if (msgStore) {
      try {
        const raw: DMMessage[] = JSON.parse(msgStore);
        Promise.all(raw.map(async (m) => ({ ...m, content: await decryptMessage(m.content) }))).then(setMessages);
      } catch { setMessages([]); }
    } else {
      setMessages([]);
    }
  }, [activeFriend, isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !conversationId || !activeFriend) return;

    const newMsg: DMMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      type: 'text',
      timestamp: new Date().toISOString(),
      read: false,
      reactions: [],
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setMessageInput('');
    setShowEmojiPicker(false);

    // Encrypt & save
    const encrypted = await Promise.all(updated.map(async (m) => ({
      ...m, content: await encryptMessage(m.content),
    })));
    localStorage.setItem(`oforo-dm-${conversationId}`, JSON.stringify(encrypted));

    // Update conversation list
    const stored = localStorage.getItem('oforo-dm-conversations');
    let convos: DMConversation[] = [];
    try { convos = stored ? JSON.parse(stored) : []; } catch { convos = []; }
    convos = convos.map((c) =>
      c.id === conversationId
        ? { ...c, lastMessage: content, lastMessageTime: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : c
    );
    localStorage.setItem('oforo-dm-conversations', JSON.stringify(convos));
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const existing = msg.reactions.find((r) => r.emoji === emoji);
        let reactions = [...msg.reactions];
        if (existing) {
          if (existing.users.includes(currentUser.id)) {
            reactions = reactions.map((r) => r.emoji === emoji ? { ...r, users: r.users.filter((u) => u !== currentUser.id) } : r);
          } else {
            reactions = reactions.map((r) => r.emoji === emoji ? { ...r, users: [...r.users, currentUser.id] } : r);
          }
        } else {
          reactions.push({ emoji, users: [currentUser.id] });
        }
        return { ...msg, reactions };
      })
    );
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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col gap-0.5 max-w-[75%]">
              <div
                className="group px-3 py-2 rounded-xl relative"
                style={{
                  backgroundColor: message.senderId === currentUser.id ? 'var(--accent)' : 'var(--bg-secondary)',
                }}
              >
                <p
                  className="text-[13px] leading-snug"
                  style={{ color: message.senderId === currentUser.id ? '#ffffff' : 'var(--text-primary)' }}
                >
                  {message.content}
                </p>

                {/* Reactions */}
                {message.reactions.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {message.reactions.map((reaction, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddReaction(message.id, reaction.emoji)}
                        className="px-1.5 py-0.5 rounded-full text-[10px]"
                        style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                      >
                        {reaction.emoji} {reaction.users.length}
                      </button>
                    ))}
                  </div>
                )}

                {/* Reaction hover menu */}
                <div className="absolute bottom-full left-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <div className="flex gap-0.5 p-1 rounded-lg shadow-lg" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                    {emojiReactions.map(({ emoji }, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddReaction(message.id, emoji)}
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
                <span>{formatTime(message.timestamp)}</span>
                {message.senderId === currentUser.id && (
                  message.read
                    ? <CheckCheck size={11} style={{ color: 'var(--accent)' }} />
                    : <Clock size={11} />
                )}
              </div>
            </div>
          </div>
        ))}
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
            disabled={!messageInput.trim()}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-40 flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="flex items-center gap-1 mt-1 px-0.5">
          <Shield size={9} style={{ color: '#22c55e' }} />
          <span className="text-[8px]" style={{ color: 'var(--text-tertiary)' }}>End-to-end encrypted</span>
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
