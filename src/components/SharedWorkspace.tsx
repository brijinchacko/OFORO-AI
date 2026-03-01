import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Users,
  Send,
  Settings,
  Share2,
  Zap,
  MessageSquare,
  Home,
  BookOpen,
  Code,
  Lightbulb,
  ChevronRight,
  Loader,
  Check,
  Clock,
} from 'lucide-react';
import { Friend } from './FriendsPanel';
import './SharedWorkspace.css';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  template: 'brainstorm' | 'research' | 'code-review' | 'meeting-notes';
  owner: string;
  members: WorkspaceMember[];
  messages: WorkspaceMessage[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarColor: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'offline' | 'away';
  joinedAt: string;
  lastSeen?: string;
  isTyping?: boolean;
}

interface WorkspaceMessage {
  id: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  authorColor: string;
  content: string;
  isAI: boolean;
  timestamp: string;
  modelId?: string;
}

interface SharedWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSendAIMessage: (text: string, modelId: string) => Promise<string>;
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    avatarColor: string;
  };
  friends: Friend[];
}

const WORKSPACE_TEMPLATES = {
  brainstorm: {
    icon: Lightbulb,
    name: 'Brainstorm',
    description: 'Generate and explore creative ideas',
  },
  research: {
    icon: BookOpen,
    name: 'Research',
    description: 'Collaborative research and discovery',
  },
  'code-review': {
    icon: Code,
    name: 'Code Review',
    description: 'Review and discuss code together',
  },
  'meeting-notes': {
    icon: MessageSquare,
    name: 'Meeting Notes',
    description: 'Take and share meeting notes',
  },
};

const DEMO_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Q1 Product Strategy',
    description: 'Planning our Q1 product roadmap and goals',
    template: 'brainstorm',
    owner: 'user-1',
    members: [
      {
        id: 'user-1',
        name: 'You',
        email: 'you@example.com',
        avatar: '👤',
        avatarColor: '#3B82F6',
        role: 'owner',
        status: 'online',
        joinedAt: '2026-02-15',
      },
      {
        id: 'user-2',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        avatar: '👩',
        avatarColor: '#EC4899',
        role: 'editor',
        status: 'online',
        joinedAt: '2026-02-15',
        isTyping: true,
      },
      {
        id: 'user-3',
        name: 'Alex Morgan',
        email: 'alex@example.com',
        avatar: '🧑',
        avatarColor: '#8B5CF6',
        role: 'editor',
        status: 'away',
        joinedAt: '2026-02-16',
        lastSeen: '5 mins ago',
      },
    ],
    messages: [
      {
        id: 'msg-1',
        author: 'Sarah Chen',
        authorId: 'user-2',
        authorAvatar: '👩',
        authorColor: '#EC4899',
        content: 'What if we focus on mobile optimization first this quarter?',
        isAI: false,
        timestamp: '10:30 AM',
      },
      {
        id: 'msg-2',
        author: 'Oforo MAX',
        authorId: 'ai',
        authorAvatar: '⚡',
        authorColor: '#F59E0B',
        content:
          'Mobile-first strategy is excellent for Q1. Consider: 1) User analytics show 65% mobile traffic, 2) Competitor analysis shows strong mobile focus, 3) Estimated 3-month timeline feasible. Recommend phased rollout: MVP in 6 weeks, full optimization by EOQ.',
        isAI: true,
        timestamp: '10:31 AM',
        modelId: 'opus-4.6',
      },
      {
        id: 'msg-3',
        author: 'You',
        authorId: 'user-1',
        authorAvatar: '👤',
        authorColor: '#3B82F6',
        content: 'I like the phased approach. What about resource allocation?',
        isAI: false,
        timestamp: '10:32 AM',
      },
      {
        id: 'msg-4',
        author: 'Oforo MAX',
        authorId: 'ai',
        authorAvatar: '⚡',
        authorColor: '#F59E0B',
        content:
          'Recommended allocation for mobile optimization: Frontend Team (60% capacity), Backend Team (40% capacity), QA (80% capacity). Budget impact: ~$45K-60K. Timeline consideration: Start week 1 of Q1, checkpoint at week 4.',
        isAI: true,
        timestamp: '10:33 AM',
        modelId: 'opus-4.6',
      },
    ],
    createdAt: '2026-02-15',
    updatedAt: '2026-03-01',
    isActive: true,
  },
  {
    id: 'ws-2',
    name: 'Content Strategy Review',
    description: 'Review and discuss content marketing approach',
    template: 'research',
    owner: 'user-2',
    members: [
      {
        id: 'user-1',
        name: 'You',
        email: 'you@example.com',
        avatar: '👤',
        avatarColor: '#3B82F6',
        role: 'viewer',
        status: 'online',
        joinedAt: '2026-02-20',
      },
      {
        id: 'user-2',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        avatar: '👩',
        avatarColor: '#EC4899',
        role: 'owner',
        status: 'offline',
        joinedAt: '2026-02-20',
        lastSeen: '2 hours ago',
      },
    ],
    messages: [
      {
        id: 'msg-5',
        author: 'Sarah Chen',
        authorId: 'user-2',
        authorAvatar: '👩',
        authorColor: '#EC4899',
        content: 'Analyzing blog traffic trends for the last quarter',
        isAI: false,
        timestamp: '3:15 PM',
      },
      {
        id: 'msg-6',
        author: 'Oforo MAX',
        authorId: 'ai',
        authorAvatar: '⚡',
        authorColor: '#F59E0B',
        content:
          'Content strategy analysis: SEO topics show 34% engagement increase YoY. Video content formats outperform text by 2.3x. Recommendation: Allocate 40% resources to video, 35% to written guides, 25% to case studies.',
        isAI: true,
        timestamp: '3:16 PM',
        modelId: 'opus-4.6',
      },
    ],
    createdAt: '2026-02-20',
    updatedAt: '2026-02-28',
    isActive: false,
  },
  {
    id: 'ws-3',
    name: 'Bug Fixes & Refactoring',
    description: 'Code review session for critical bug fixes',
    template: 'code-review',
    owner: 'user-3',
    members: [
      {
        id: 'user-1',
        name: 'You',
        email: 'you@example.com',
        avatar: '👤',
        avatarColor: '#3B82F6',
        role: 'editor',
        status: 'online',
        joinedAt: '2026-02-25',
      },
      {
        id: 'user-3',
        name: 'Alex Morgan',
        email: 'alex@example.com',
        avatar: '🧑',
        avatarColor: '#8B5CF6',
        role: 'owner',
        status: 'online',
        joinedAt: '2026-02-25',
      },
    ],
    messages: [
      {
        id: 'msg-7',
        author: 'Alex Morgan',
        authorId: 'user-3',
        authorAvatar: '🧑',
        authorColor: '#8B5CF6',
        content: 'Reviewing the authentication refactoring PR',
        isAI: false,
        timestamp: '9:45 AM',
      },
    ],
    createdAt: '2026-02-25',
    updatedAt: '2026-03-01',
    isActive: false,
  },
];

const SharedWorkspace: React.FC<SharedWorkspaceProps> = ({
  isOpen,
  onClose,
  onSendAIMessage,
  currentUser,
  friends,
}) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DEMO_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    DEMO_WORKSPACES[0]?.id || null
  );
  const [view, setView] = useState<'list' | 'workspace'>('list');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<
    'brainstorm' | 'research' | 'code-review' | 'meeting-notes'
  >('brainstorm');
  const [selectedFriendsToInvite, setSelectedFriendsToInvite] = useState<
    string[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load workspaces from localStorage
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem('oforo-workspaces');
    if (savedWorkspaces) {
      try {
        const parsed = JSON.parse(savedWorkspaces);
        setWorkspaces((prev) => [...prev, ...parsed]);
      } catch (e) {
        console.error('Error loading workspaces:', e);
      }
    }
  }, []);

  // Save workspaces to localStorage
  useEffect(() => {
    localStorage.setItem('oforo-workspaces', JSON.stringify(workspaces));
    workspaces.forEach((ws) => {
      localStorage.setItem(`oforo-workspace-${ws.id}`, JSON.stringify(ws));
    });
  }, [workspaces]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeWorkspaceId, workspaces]);

  // Simulate typing indicators
  useEffect(() => {
    if (!activeWorkspaceId) return;

    const workspace = workspaces.find((w) => w.id === activeWorkspaceId);
    if (!workspace) return;

    const typingMembersIds = workspace.members
      .filter((m) => m.isTyping && m.id !== currentUser.id)
      .map((m) => m.id);

    setTypingUsers(new Set(typingMembersIds));
  }, [workspaces, activeWorkspaceId, currentUser.id]);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) return;

    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: newWorkspaceName,
      description: newWorkspaceDesc,
      template: selectedTemplate,
      owner: currentUser.id,
      members: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          avatarColor: currentUser.avatarColor,
          role: 'owner',
          status: 'online',
          joinedAt: new Date().toISOString().split('T')[0],
        },
        ...selectedFriendsToInvite
          .map((friendId) => friends.find((f) => f.id === friendId))
          .filter(Boolean)
          .map((friend) => ({
            id: friend!.id,
            name: friend!.name,
            email: friend!.email,
            avatar: friend!.avatar,
            avatarColor: friend!.avatarColor,
            role: 'editor' as const,
            status: friend!.status,
            joinedAt: new Date().toISOString().split('T')[0],
          })),
      ],
      messages: [
        {
          id: 'init-1',
          author: 'Oforo MAX',
          authorId: 'ai',
          authorAvatar: '⚡',
          authorColor: '#F59E0B',
          content: `Welcome to ${newWorkspaceName}! This is a shared workspace where you can collaborate with your team and leverage AI assistance. Feel free to ask questions, share ideas, and I'll help guide the conversation.`,
          isAI: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          modelId: 'opus-4.6',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    setWorkspaces((prev) => [newWorkspace, ...prev]);
    setActiveWorkspaceId(newWorkspace.id);
    setView('workspace');
    setNewWorkspaceName('');
    setNewWorkspaceDesc('');
    setSelectedFriendsToInvite([]);
    setShowCreateModal(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeWorkspace) return;

    setIsLoading(true);

    const userMessage: WorkspaceMessage = {
      id: `msg-${Date.now()}`,
      author: currentUser.name,
      authorId: currentUser.id,
      authorAvatar: currentUser.avatar,
      authorColor: currentUser.avatarColor,
      content: inputValue,
      isAI: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? {
              ...ws,
              messages: [...ws.messages, userMessage],
              updatedAt: new Date().toISOString(),
            }
          : ws
      )
    );

    setInputValue('');

    // Simulate other user typing
    const otherMembers = activeWorkspace.members.filter(
      (m) => m.id !== currentUser.id
    );
    if (otherMembers.length > 0) {
      const randomMember = otherMembers[
        Math.floor(Math.random() * otherMembers.length)
      ];

      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === activeWorkspaceId
            ? {
                ...ws,
                members: ws.members.map((m) =>
                  m.id === randomMember.id ? { ...m, isTyping: true } : m
                ),
              }
            : ws
        )
      );

      setTimeout(() => {
        setWorkspaces((prev) =>
          prev.map((ws) =>
            ws.id === activeWorkspaceId
              ? {
                  ...ws,
                  members: ws.members.map((m) =>
                    m.id === randomMember.id ? { ...m, isTyping: false } : m
                  ),
                }
              : ws
          )
        );
      }, 2000);
    }

    try {
      const aiResponse = await onSendAIMessage(inputValue, 'opus-4.6');

      const aiMessage: WorkspaceMessage = {
        id: `msg-${Date.now() + 1}`,
        author: 'Oforo MAX',
        authorId: 'ai',
        authorAvatar: '⚡',
        authorColor: '#F59E0B',
        content: aiResponse,
        isAI: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        modelId: 'opus-4.6',
      };

      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === activeWorkspaceId
            ? {
                ...ws,
                messages: [...ws.messages, aiMessage],
                updatedAt: new Date().toISOString(),
              }
            : ws
        )
      );
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteFriends = () => {
    if (selectedFriendsToInvite.length === 0 || !activeWorkspace) return;

    const newMembers = selectedFriendsToInvite
      .map((friendId) => friends.find((f) => f.id === friendId))
      .filter(
        (friend) =>
          friend &&
          !activeWorkspace.members.some((m) => m.id === friend!.id)
      )
      .map((friend) => ({
        id: friend!.id,
        name: friend!.name,
        email: friend!.email,
        avatar: friend!.avatar,
        avatarColor: friend!.avatarColor,
        role: 'editor' as const,
        status: friend!.status,
        joinedAt: new Date().toISOString().split('T')[0],
      }));

    if (newMembers.length === 0) return;

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? {
              ...ws,
              members: [...ws.members, ...newMembers],
              updatedAt: new Date().toISOString(),
            }
          : ws
      )
    );

    setSelectedFriendsToInvite([]);
    setShowInviteModal(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'var(--accent)';
      case 'editor':
        return '#10B981';
      case 'viewer':
        return 'var(--text-tertiary)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#10B981';
      case 'away':
        return '#F59E0B';
      case 'offline':
        return 'var(--text-tertiary)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="shared-workspace-overlay">
      <div className="shared-workspace-modal">
        {/* Header */}
        <div className="workspace-header">
          <div className="header-content">
            {view === 'workspace' && activeWorkspace && (
              <button
                className="back-button"
                onClick={() => setView('list')}
                aria-label="Back to workspaces"
              >
                <ChevronRight style={{ transform: 'rotate(180deg)' }} />
              </button>
            )}
            <h2 className="header-title">
              {view === 'list' ? 'Shared Workspaces' : activeWorkspace?.name}
            </h2>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close workspace"
          >
            <X />
          </button>
        </div>

        {/* Main Content */}
        {view === 'list' ? (
          <div className="workspace-list-view">
            {/* Create Workspace Button */}
            <button
              className="create-workspace-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} />
              <span>Create New Workspace</span>
            </button>

            {/* Workspaces Grid */}
            <div className="workspaces-grid">
              {workspaces.length === 0 ? (
                <div className="empty-state">
                  <Zap size={48} />
                  <p>No workspaces yet. Create one to get started!</p>
                </div>
              ) : (
                workspaces.map((ws) => {
                  const TemplateIcon =
                    WORKSPACE_TEMPLATES[ws.template]?.icon || MessageSquare;
                  const onlineMembersCount = ws.members.filter(
                    (m) => m.status === 'online'
                  ).length;

                  return (
                    <div
                      key={ws.id}
                      className="workspace-card"
                      onClick={() => {
                        setActiveWorkspaceId(ws.id);
                        setView('workspace');
                      }}
                    >
                      <div className="workspace-card-header">
                        <div className="template-icon">
                          <TemplateIcon size={24} />
                        </div>
                        <span className="workspace-template">
                          {WORKSPACE_TEMPLATES[ws.template]?.name}
                        </span>
                      </div>
                      <h3 className="workspace-card-title">{ws.name}</h3>
                      <p className="workspace-card-desc">
                        {ws.description}
                      </p>
                      <div className="workspace-card-footer">
                        <div className="members-avatars">
                          {ws.members.slice(0, 3).map((member) => (
                            <div
                              key={member.id}
                              className="member-mini-avatar"
                              style={{ backgroundColor: member.avatarColor }}
                              title={member.name}
                            >
                              {member.avatar}
                            </div>
                          ))}
                          {ws.members.length > 3 && (
                            <div className="member-mini-avatar-overflow">
                              +{ws.members.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="members-info">
                          <Users size={14} />
                          <span>{ws.members.length}</span>
                          <div
                            className="status-dot"
                            style={{
                              backgroundColor: getStatusColor(
                                onlineMembersCount > 0 ? 'online' : 'offline'
                              ),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : activeWorkspace ? (
          <div className="workspace-view">
            {/* Workspace Top Bar */}
            <div className="workspace-top-bar">
              <div className="workspace-info">
                <h3>{activeWorkspace.name}</h3>
                <p className="workspace-desc-small">
                  {activeWorkspace.description}
                </p>
              </div>
              <div className="workspace-actions">
                <button
                  className="action-button"
                  onClick={() => setShowInviteModal(true)}
                  title="Invite friends"
                >
                  <Share2 size={18} />
                </button>
                <button
                  className="action-button"
                  title="Workspace settings"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>

            <div className="workspace-content">
              {/* Chat Area */}
              <div className="chat-section">
                {/* Messages */}
                <div className="messages-container">
                  {activeWorkspace.messages.length === 0 ? (
                    <div className="empty-messages">
                      <MessageSquare size={32} />
                      <p>Start the conversation</p>
                    </div>
                  ) : (
                    <>
                      {activeWorkspace.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`message ${msg.isAI ? 'ai-message' : 'user-message'}`}
                        >
                          <div
                            className="message-avatar"
                            style={{
                              backgroundColor: msg.authorColor,
                            }}
                          >
                            {msg.authorAvatar}
                          </div>
                          <div className="message-content">
                            <div className="message-header">
                              <span className="message-author">
                                {msg.author}
                              </span>
                              {msg.isAI && (
                                <span className="ai-badge">AI</span>
                              )}
                              <span className="message-time">
                                {msg.timestamp}
                              </span>
                            </div>
                            <p className="message-text">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Typing Indicators */}
                {typingUsers.size > 0 && (
                  <div className="typing-indicators">
                    {Array.from(typingUsers).map((userId) => {
                      const typingMember = activeWorkspace.members.find(
                        (m) => m.id === userId
                      );
                      return typingMember ? (
                        <div key={userId} className="typing-indicator">
                          <div
                            className="typing-avatar"
                            style={{
                              backgroundColor: typingMember.avatarColor,
                            }}
                          >
                            {typingMember.avatar}
                          </div>
                          <span className="typing-text">
                            {typingMember.name} is typing
                          </span>
                          <div className="typing-dots">
                            <span />
                            <span />
                            <span />
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Input Area */}
                <div className="input-area">
                  <textarea
                    className="message-input"
                    placeholder="Share your thoughts or ask a question..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <button
                    className={`send-button ${isLoading ? 'loading' : ''}`}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    title="Send message"
                  >
                    {isLoading ? (
                      <Loader size={18} className="spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Members Sidebar */}
              <div className="members-sidebar">
                <h4 className="members-title">
                  <Users size={16} />
                  <span>Members ({activeWorkspace.members.length})</span>
                </h4>
                <div className="members-list">
                  {activeWorkspace.members.map((member) => (
                    <div key={member.id} className="member-item">
                      <div
                        className="member-avatar-large"
                        style={{
                          backgroundColor: member.avatarColor,
                        }}
                      >
                        {member.avatar}
                        <div
                          className="member-status-badge"
                          style={{
                            backgroundColor: getStatusColor(member.status),
                          }}
                        />
                      </div>
                      <div className="member-info">
                        <div className="member-name">
                          {member.name}
                          {member.id === currentUser.id && (
                            <span className="you-badge">(You)</span>
                          )}
                        </div>
                        <div className="member-details">
                          <span
                            className="member-role"
                            style={{
                              color: getRoleColor(member.role),
                            }}
                          >
                            {member.role.charAt(0).toUpperCase() +
                              member.role.slice(1)}
                          </span>
                          <span className="member-status">
                            {member.isTyping ? (
                              <>
                                <span className="typing-dot" />
                                Typing...
                              </>
                            ) : member.status === 'online' ? (
                              'Online'
                            ) : member.status === 'away' ? (
                              'Away'
                            ) : (
                              <>
                                <Clock size={12} />
                                {member.lastSeen}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Create Workspace Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Create New Workspace</h3>

              <div className="form-group">
                <label className="form-label">Workspace Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Q1 Product Strategy"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  placeholder="What is this workspace for?"
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Template</label>
                <div className="template-grid">
                  {Object.entries(WORKSPACE_TEMPLATES).map(
                    ([key, template]) => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={key}
                          className={`template-option ${selectedTemplate === key ? 'selected' : ''}`}
                          onClick={() =>
                            setSelectedTemplate(
                              key as
                                | 'brainstorm'
                                | 'research'
                                | 'code-review'
                                | 'meeting-notes'
                            )
                          }
                        >
                          <Icon size={20} />
                          <div className="template-label">
                            <div className="template-name">
                              {template.name}
                            </div>
                            <div className="template-desc">
                              {template.description}
                            </div>
                          </div>
                          {selectedTemplate === key && (
                            <Check size={16} className="check-icon" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Invite Friends</label>
                <div className="friends-select">
                  {friends.length === 0 ? (
                    <p className="no-friends">
                      No friends to invite yet
                    </p>
                  ) : (
                    friends.map((friend) => (
                      <label key={friend.id} className="friend-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFriendsToInvite.includes(
                            friend.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFriendsToInvite((prev) => [
                                ...prev,
                                friend.id,
                              ]);
                            } else {
                              setSelectedFriendsToInvite((prev) =>
                                prev.filter((id) => id !== friend.id)
                              );
                            }
                          }}
                        />
                        <div className="friend-info">
                          <div
                            className="friend-avatar-small"
                            style={{
                              backgroundColor: friend.avatarColor,
                            }}
                          >
                            {friend.avatar}
                          </div>
                          <span>{friend.name}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="modal-button cancel"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewWorkspaceName('');
                    setNewWorkspaceDesc('');
                    setSelectedFriendsToInvite([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="modal-button primary"
                  onClick={handleCreateWorkspace}
                  disabled={!newWorkspaceName.trim()}
                >
                  Create Workspace
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Friends Modal */}
        {showInviteModal && activeWorkspace && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Invite Friends</h3>
              <p className="modal-subtitle">
                Add more people to {activeWorkspace.name}
              </p>

              <div className="friends-select">
                {friends.length === 0 ? (
                  <p className="no-friends">No friends to invite</p>
                ) : (
                  friends.map((friend) => {
                    const isAlreadyMember = activeWorkspace.members.some(
                      (m) => m.id === friend.id
                    );
                    return (
                      <label
                        key={friend.id}
                        className={`friend-checkbox ${isAlreadyMember ? 'disabled' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFriendsToInvite.includes(
                            friend.id
                          )}
                          onChange={(e) => {
                            if (!isAlreadyMember) {
                              if (e.target.checked) {
                                setSelectedFriendsToInvite((prev) => [
                                  ...prev,
                                  friend.id,
                                ]);
                              } else {
                                setSelectedFriendsToInvite((prev) =>
                                  prev.filter((id) => id !== friend.id)
                                );
                              }
                            }
                          }}
                          disabled={isAlreadyMember}
                        />
                        <div className="friend-info">
                          <div
                            className="friend-avatar-small"
                            style={{
                              backgroundColor: friend.avatarColor,
                            }}
                          >
                            {friend.avatar}
                          </div>
                          <span>{friend.name}</span>
                          {isAlreadyMember && (
                            <span className="already-member">
                              Already a member
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="modal-actions">
                <button
                  className="modal-button cancel"
                  onClick={() => {
                    setShowInviteModal(false);
                    setSelectedFriendsToInvite([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="modal-button primary"
                  onClick={handleInviteFriends}
                  disabled={selectedFriendsToInvite.length === 0}
                >
                  Invite ({selectedFriendsToInvite.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedWorkspace;
