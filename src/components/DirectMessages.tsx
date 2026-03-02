import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Search,
  Smile,
  Link as LinkIcon,
  Check,
  CheckCheck,
  Clock,
  Heart,
  ThumbsUp,
  Flame,
  Laugh,
} from 'lucide-react';
import { Friend } from './FriendsPanel';

// Types and Interfaces
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
  threadId?: string;
  threadTitle?: string;
  canvasId?: string;
  canvasTitle?: string;
  timestamp: string;
  read: boolean;
  reactions: MessageReaction[];
  showTypingIndicator?: boolean;
}

export interface MessageReaction {
  emoji: string;
  users: string[];
}

interface DirectMessagesProps {
  isOpen: boolean;
  onClose: () => void;
  activeFriend?: Friend | null;
  currentUser: {
    id: string;
    name: string;
    avatar: string;
  };
}

// Utility function to get unread message count
export const getUnreadCount = (conversations: DMConversation[]): number => {
  return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
};

// Main Component
const DirectMessages: React.FC<DirectMessagesProps> = ({
  isOpen,
  onClose,
  activeFriend,
  currentUser,
}) => {
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize conversations from localStorage, cleaning up stale demo data
  useEffect(() => {
    const stored = localStorage.getItem('oforo-dm-conversations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Remove any conversations with non-existent friends (old demo data)
        const cleaned = parsed.filter((conv: DMConversation) => {
          // Keep only conversations where the friend exists in the current friend list
          // This is checked when activeFriend is set, so just load what we have
          return conv && conv.id && conv.friendId;
        });
        setConversations(cleaned);
      } catch (e) {
        console.error('Failed to parse conversations:', e);
        // Clear corrupted data
        localStorage.removeItem('oforo-dm-conversations');
      }
    }
  }, []);

  // Load active conversation from localStorage
  useEffect(() => {
    if (activeConversationId) {
      const stored = localStorage.getItem(`oforo-dm-${activeConversationId}`);
      if (stored) {
        try {
          const messages = JSON.parse(stored);
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === activeConversationId ? { ...conv, messages } : conv
            )
          );
        } catch (e) {
          console.error('Failed to parse messages:', e);
        }
      }
    }
  }, [activeConversationId]);

  // Handle active friend selection
  useEffect(() => {
    if (activeFriend) {
      const existingConv = conversations.find(
        (c) => c.friendId === activeFriend.id
      );

      if (existingConv) {
        setActiveConversationId(existingConv.id);
      } else {
        const newConvId = `conv-${Date.now()}`;
        const newConversation: DMConversation = {
          id: newConvId,
          friendId: activeFriend.id,
          friendName: activeFriend.name,
          friendAvatar: activeFriend.avatar,
          friendAvatarColor: activeFriend.avatarColor,
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        };

        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(newConvId);
        localStorage.setItem(
          `oforo-dm-${newConvId}`,
          JSON.stringify(newConversation.messages)
        );
      }
    }
  }, [activeFriend, conversations.length, currentUser.name]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationId, conversations]);

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem('oforo-dm-conversations', JSON.stringify(conversations));
  }, [conversations]);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) =>
      conv.friendName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const handleSendMessage = (
    content: string,
    type: 'text' | 'thread-link' | 'canvas-link' = 'text'
  ) => {
    if (!activeConversation || !content.trim()) return;

    const newMessage: DMMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      reactions: [],
    };

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === activeConversationId) {
        const updatedMessages = [...conv.messages, newMessage];
        localStorage.setItem(
          `oforo-dm-${conv.id}`,
          JSON.stringify(updatedMessages)
        );

        return {
          ...conv,
          messages: updatedMessages,
          lastMessage: content,
          lastMessageTime: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setMessageInput('');
    setShowEmojiPicker(false);
  };

  const handleShareThread = () => {
    const threadTitle = 'Exciting Project Update';
    const threadId = `thread-${Date.now()}`;
    handleSendMessage(
      `Check out this thread: ${threadTitle}`,
      'thread-link'
    );
  };

  const handleShareCanvas = () => {
    const canvasTitle = 'Design Mockup';
    const canvasId = `canvas-${Date.now()}`;
    handleSendMessage(`Check out this canvas: ${canvasTitle}`, 'canvas-link');
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeConversationId) {
          const updatedMessages = conv.messages.map((msg) => {
            if (msg.id === messageId) {
              const existingReaction = msg.reactions.find(
                (r) => r.emoji === emoji
              );
              let updatedReactions = [...msg.reactions];

              if (existingReaction) {
                if (existingReaction.users.includes(currentUser.id)) {
                  updatedReactions = updatedReactions.map((r) =>
                    r.emoji === emoji
                      ? {
                          ...r,
                          users: r.users.filter((u) => u !== currentUser.id),
                        }
                      : r
                  );
                } else {
                  updatedReactions = updatedReactions.map((r) =>
                    r.emoji === emoji
                      ? { ...r, users: [...r.users, currentUser.id] }
                      : r
                  );
                }
              } else {
                updatedReactions.push({
                  emoji,
                  users: [currentUser.id],
                });
              }

              return { ...msg, reactions: updatedReactions };
            }
            return msg;
          });

          localStorage.setItem(
            `oforo-dm-${conv.id}`,
            JSON.stringify(updatedMessages)
          );

          return { ...conv, messages: updatedMessages };
        }
        return conv;
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
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const emojiReactions = [
    { icon: Heart, emoji: '❤️' },
    { icon: ThumbsUp, emoji: '👍' },
    { icon: Flame, emoji: '🔥' },
    { icon: Laugh, emoji: '😂' },
  ];

  const [panelSize, setPanelSize] = useState({ width: 420, height: 520 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Resize handlers
  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const dw = resizeRef.current.startX - e.clientX;
      const dh = resizeRef.current.startY - e.clientY;
      setPanelSize({
        width: Math.max(320, Math.min(800, resizeRef.current.startW + dw)),
        height: Math.max(400, Math.min(700, resizeRef.current.startH + dh)),
      });
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
  }, [isResizing]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      style={{
        width: `${panelSize.width}px`, height: `${panelSize.height}px`,
        backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-hover)',
      }}>
      {/* Resize handle — top-left corner */}
      <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-10"
        onMouseDown={(e) => {
          e.preventDefault();
          resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: panelSize.width, startH: panelSize.height };
          setIsResizing(true);
        }}
        style={{ background: "transparent" }}>
        <div className="absolute top-1 left-1 w-2 h-2 rounded-full" style={{ background: "var(--text-tertiary)", opacity: 0.4 }} />
      </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-2.5 border-b flex-shrink-0"
          style={{
            borderColor: 'var(--border-primary)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={18} style={{ color: 'var(--accent)' }} />
            <h2
              className="text-sm font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Messages
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-opacity-50"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          >
            <X size={20} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div
            className="w-48 border-r flex flex-col flex-shrink-0"
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            {/* Search */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <Search size={18} style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div
                  className="flex items-center justify-center h-full text-center p-4"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <div>
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className="w-full text-left p-4 border-b transition-colors hover:bg-opacity-50"
                    style={{
                      borderColor: 'var(--border-primary)',
                      backgroundColor:
                        activeConversationId === conv.id
                          ? 'var(--bg-hover)'
                          : 'transparent',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm relative"
                          style={{
                            backgroundColor: conv.friendAvatarColor,
                          }}
                        >
                          {conv.friendAvatar}
                          <div
                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                            style={{ borderColor: 'var(--bg-elevated)' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {conv.friendName}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {conv.lastMessage || 'No messages'}
                          </p>
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div
                          className="flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat View */}
          {activeConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{
                      backgroundColor: activeConversation.friendAvatarColor,
                    }}
                  >
                    {activeConversation.friendAvatar}
                  </div>
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {activeConversation.friendName}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      online
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === currentUser.id
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div className="flex flex-col gap-1 max-w-xs">
                      <div
                        className="group px-4 py-2 rounded-lg transition-colors hover:bg-opacity-80 relative"
                        style={{
                          backgroundColor:
                            message.senderId === currentUser.id
                              ? 'var(--accent)'
                              : 'var(--bg-secondary)',
                        }}
                      >
                        <p
                          className="text-sm"
                          style={{
                            color:
                              message.senderId === currentUser.id
                                ? '#ffffff'
                                : 'var(--text-primary)',
                          }}
                        >
                          {message.content}
                        </p>

                        {/* Emoji Reactions */}
                        {message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {message.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  handleAddReaction(message.id, reaction.emoji)
                                }
                                className="px-2 py-1 rounded-full text-xs transition-colors"
                                style={{
                                  backgroundColor: 'var(--bg-hover)',
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {reaction.emoji} {reaction.users.length}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Reaction Menu on Hover */}
                        <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                          <div
                            className="flex gap-1 p-2 rounded-lg shadow-lg"
                            style={{
                              backgroundColor: 'var(--bg-elevated)',
                              borderColor: 'var(--border-primary)',
                            }}
                          >
                            {emojiReactions.map(({ emoji }, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  handleAddReaction(message.id, emoji)
                                }
                                className="p-1 rounded transition-colors hover:bg-opacity-50"
                                style={{
                                  backgroundColor: 'var(--bg-hover)',
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Timestamp & Read Status */}
                      <div
                        className="px-2 flex items-center justify-between text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span>{formatTime(message.timestamp)}</span>
                        {message.senderId === currentUser.id && (
                          <div className="flex gap-1">
                            {message.read ? (
                              <CheckCheck size={14} style={{ color: 'var(--accent)' }} />
                            ) : (
                              <Clock size={14} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {typingIndicator && (
                  <div className="flex justify-start">
                    <div
                      className="px-4 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{ backgroundColor: 'var(--accent)' }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: 'var(--accent)',
                            animationDelay: '0.2s',
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: 'var(--accent)',
                            animationDelay: '0.4s',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                className="p-4 border-t"
                style={{
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                }}
              >
                {/* Action Buttons */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleShareThread}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <LinkIcon size={16} />
                    Thread
                  </button>
                  <button
                    onClick={handleShareCanvas}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <LinkIcon size={16} />
                    Canvas
                  </button>
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Smile size={20} />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-lg outline-none transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={() => handleSendMessage(messageInput)}
                    disabled={!messageInput.trim()}
                    className="p-2 rounded-lg transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                    }}
                  >
                    <Send size={20} />
                  </button>
                </div>

                {/* Emoji Picker Suggestions */}
                {showEmojiPicker && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {['😊', '😂', '❤️', '🔥', '👍', '🎉', '🚀', '✨'].map(
                      (emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setMessageInput(
                              messageInput + ' ' + emoji
                            );
                            setShowEmojiPicker(false);
                          }}
                          className="w-8 h-8 text-xl flex items-center justify-center rounded-lg transition-colors hover:scale-110"
                          style={{
                            backgroundColor: 'var(--bg-hover)',
                          }}
                        >
                          {emoji}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="flex-1 flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">No conversation selected</p>
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default DirectMessages;
