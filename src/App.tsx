// CommunityForum.tsx
import React, { useState, useEffect, useRef } from 'react';

// Importing custom font from Google Fonts
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// Types
interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  reactions: Reaction[];
  replies: Comment[];
  isExpanded: boolean;
}

// Initial data
const mockUsers: User[] = [
  { id: '1', name: 'Alex Johnson', avatar: 'AJ' },
  { id: '2', name: 'Taylor Swift', avatar: 'TS' },
  { id: '3', name: 'Chris Evans', avatar: 'CE' },
  { id: '4', name: 'Emma Watson', avatar: 'EW' },
  { id: '5', name: 'Michael Scott', avatar: 'MS' },
];

const emojiOptions = ['👍', '❤️', '😂', '😮', '😢', '👏'];

const generateMockComments = (depth = 0): Comment[] => {
  if (depth > 3) return [];
  
  return Array.from({ length: depth === 0 ? 5 : Math.floor(Math.random() * 3) + 1 }, (_, i) => {
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const replies = depth < 3 ? generateMockComments(depth + 1) : [];
    
    return {
      id: `${depth}-${i}-${Date.now()}`,
      user,
      content: depth === 0 
        ? `Discussion starter #${i+1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
        : `Reply #${i+1}: Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
      timestamp: `${Math.floor(Math.random() * 60)} minutes ago`,
      reactions: emojiOptions.slice(0, Math.floor(Math.random() * 4) + 2).map(emoji => ({
        emoji,
        count: Math.floor(Math.random() * 20) + 1,
        users: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => `User${i+1}`)
      })),
      replies,
      isExpanded: depth < 2,
    };
  });
};

const CommunityForum: React.FC = () => {
  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState<{commentId: string, position: {x: number, y: number}} | null>(null);
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const touchStartRef = useRef<{time: number, commentId: string} | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const refreshTriggerRef = useRef<HTMLDivElement>(null);

  // Initialize comments
  useEffect(() => {
    setComments(generateMockComments());
    
    // Simulate WebSocket connection
    const wsInterval = setInterval(() => {
      // Simulate new comments being added
      if (comments.length > 0 && Math.random() > 0.7) {
        const newComment = generateMockComments()[0];
        setComments(prev => [newComment, ...prev]);
      }
    }, 10000);
    
    return () => clearInterval(wsInterval);
  }, []);

  // Toggle comment expansion
  const toggleComment = (commentId: string) => {
    const toggle = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, isExpanded: !comment.isExpanded };
        }
        if (comment.replies.length > 0) {
          return { ...comment, replies: toggle(comment.replies) };
        }
        return comment;
      });
    };
    
    setComments(toggle(comments));
  };

  // Handle reaction long press
  const handleTouchStart = (commentId: string) => {
    touchStartRef.current = { time: Date.now(), commentId };
    
    const timer = setTimeout(() => {
      if (touchStartRef.current?.commentId === commentId) {
        setShowReactionMenu({ commentId, position: { x: 50, y: 50 } });
      }
    }, 500);
    
    const clearTimer = () => {
      clearTimeout(timer);
      document.removeEventListener('touchend', clearTimer);
    };
    
    document.addEventListener('touchend', clearTimer, { once: true });
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  // Add reaction to comment
  const addReaction = (commentId: string, emoji: string) => {
    const updateComments = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          const existingReaction = comment.reactions.find(r => r.emoji === emoji);
          const updatedReactions = existingReaction
            ? comment.reactions.map(r => 
                r.emoji === emoji ? { ...r, count: r.count + 1 } : r
              )
            : [...comment.reactions, { emoji, count: 1, users: ['You'] }];
          
          return { ...comment, reactions: updatedReactions };
        }
        
        if (comment.replies.length > 0) {
          return { ...comment, replies: updateComments(comment.replies) };
        }
        
        return comment;
      });
    };
    
    setComments(updateComments(comments));
    setShowReactionMenu(null);
  };

  // Handle swipe to refresh
  const handleTouchStartRefresh = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY;
    if (mainContentRef.current && mainContentRef.current.scrollTop === 0) {
      setIsRefreshing(true);
    }
  };

  const handleTouchMoveRefresh = (e: React.TouchEvent) => {
    if (!isRefreshing) return;
    
    const touchY = e.touches[0].clientY;
    if (refreshTriggerRef.current) {
      refreshTriggerRef.current.style.transform = `translateY(${Math.min(touchY, 100)}px)`;
    }
  };

  const handleTouchEndRefresh = () => {
    if (isRefreshing) {
      setIsRefreshing(false);
      // Simulate refresh
      setTimeout(() => {
        setComments(generateMockComments());
        if (refreshTriggerRef.current) {
          refreshTriggerRef.current.style.transform = 'translateY(0)';
        }
      }, 1000);
    }
  };

  // Submit new post
  const handleSubmitPost = () => {
    if (postContent.trim()) {
      const newComment: Comment = {
        id: `new-${Date.now()}`,
        user: mockUsers[0], // Current user
        content: postContent,
        timestamp: 'Just now',
        reactions: [],
        replies: [],
        isExpanded: true,
      };
      
      setComments(prev => [newComment, ...prev]);
      setPostContent('');
      setNewPostModalOpen(false);
    }
  };

  // Recursive comment component
  const CommentComponent: React.FC<{ comment: Comment; depth?: number }> = ({ 
    comment, 
    depth = 0 
  }) => {
    const indent = depth * 16;
    
    return (
      <div 
        className={`mb-4 transition-all duration-300 ${depth > 0 ? 'ml-4' : ''}`}
        style={{ marginLeft: `${indent}px` }}
      >
        {/* Comment header */}
        <div 
          className="flex items-start space-x-3 p-3 rounded-xl bg-white/10 backdrop-blur-lg"
          onTouchStart={() => handleTouchStart(comment.id)}
          onTouchEnd={handleTouchEnd}
        >
          {/* User avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold">
            {comment.user.avatar}
          </div>
          
          {/* Comment content */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">{comment.user.name}</h3>
              <span className="text-xs text-white/60">{comment.timestamp}</span>
            </div>
            <p className="mt-1 text-white/90">{comment.content}</p>
            
            {/* Reactions */}
            <div className="mt-2 flex flex-wrap gap-1">
              {comment.reactions.map((reaction, idx) => (
                <button 
                  key={idx}
                  className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm flex items-center space-x-1"
                  onClick={() => addReaction(comment.id, reaction.emoji)}
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-white/80">{reaction.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Expand/Collapse replies */}
        {comment.replies.length > 0 && (
          <button
            className="mt-2 ml-3 text-sm font-medium text-pink-300 flex items-center"
            onClick={() => toggleComment(comment.id)}
          >
            {comment.isExpanded ? 'Hide replies' : `Show ${comment.replies.length} replies`}
            <svg 
              className={`ml-1 w-4 h-4 transition-transform ${comment.isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
        
        {/* Replies */}
        {comment.isExpanded && comment.replies.length > 0 && (
          <div className="mt-3 border-l-2 border-white/20 pl-3">
            {comment.replies.map(reply => (
              <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 font-sans"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Custom Glassmorphism Styles */}
      <style>
        {`
          .glass-panel {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          
          .floating-btn {
            background: linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1));
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          }
          
          .refresh-indicator {
            transition: transform 0.3s ease;
          }
          
          @media (max-width: 640px) {
            .comment-indent {
              margin-left: 16px;
            }
          }
        `}
      </style>
      
      {/* Header */}
      <header className="glass-panel fixed top-0 left-0 right-0 z-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold">
              CF
            </div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              Community Forum
            </h1>
          </div>
          
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main 
        ref={mainContentRef}
        className="flex-1 pt-20 pb-24 px-4 overflow-auto"
        onTouchStart={handleTouchStartRefresh}
        onTouchMove={handleTouchMoveRefresh}
        onTouchEnd={handleTouchEndRefresh}
      >
        {/* Swipe to refresh indicator */}
        <div 
          ref={refreshTriggerRef}
          className="refresh-indicator flex justify-center py-3"
        >
          {isRefreshing && (
            <div className="w-10 h-10 rounded-full border-t-2 border-r-2 border-pink-500 animate-spin"></div>
          )}
        </div>
        
        <div className="max-w-2xl mx-auto">
          {/* Forum title */}
          <div className="glass-panel mb-6 p-5">
            <h2 className="text-2xl font-bold text-white">Design Discussions</h2>
            <p className="text-white/80 mt-1">Share ideas, feedback, and inspiration</p>
          </div>
          
          {/* Comments list */}
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map(comment => (
                <CommentComponent key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="glass-panel p-8 text-center">
                <p className="text-white/80">No discussions yet. Be the first to post!</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Floating Action Button */}
      <button
        className="floating-btn fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full text-white flex items-center justify-center"
        onClick={() => setNewPostModalOpen(true)}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      {/* Footer */}
      <footer className="glass-panel fixed bottom-0 left-0 right-0 z-50 p-3">
        <div className="flex justify-around">
          {['Home', 'Topics', 'Notifications', 'Profile'].map((item) => (
            <button key={item} className="p-2 text-white/80 hover:text-white transition-colors">
              {item}
            </button>
          ))}
        </div>
      </footer>
      
      {/* Reaction Menu */}
      {showReactionMenu && (
        <div 
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowReactionMenu(null)}
        >
          <div 
            className="glass-panel p-3 rounded-2xl flex space-x-3 animate-fade-in"
            style={{
              position: 'fixed',
              top: `${showReactionMenu.position.y}px`,
              left: `${showReactionMenu.position.x}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {emojiOptions.map(emoji => (
              <button
                key={emoji}
                className="text-2xl p-2 hover:scale-125 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  addReaction(showReactionMenu.commentId, emoji);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* New Post Modal */}
      {newPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div 
            className="glass-panel w-full max-w-md rounded-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">New Discussion</h3>
            
            <textarea
              className="w-full bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={5}
              placeholder="What would you like to discuss?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                onClick={() => setNewPostModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
                onClick={handleSubmitPost}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityForum;