// src/App.tsx
import React, { useState, useRef, useEffect } from 'react';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  reactions: { [key: string]: number };
  replies: Comment[];
  isExpanded: boolean;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  tags: string[];
}

const ForumApp = () => {
  // State management
  const [comments, setComments] = useState<Comment[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState<{id: string, x: number, y: number} | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const touchStartRef = useRef<{startY: number, scrollTop: number} | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Emoji reactions
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '👏'];
  
  // Sample forum post
  const forumPost: ForumPost = {
    id: 'post-1',
    title: 'Welcome to our new community forum!',
    content: "We're excited to launch this new platform for our community. Please share your thoughts, ideas, and questions here. Let's build something amazing together!",
    author: 'Alex Johnson',
    timestamp: '2 hours ago',
    tags: ['announcement', 'welcome', 'community']
  };
  
  // Initialize with sample comments
  useEffect(() => {
    setComments([
      {
        id: 'comment-1',
        author: 'Taylor Smith',
        avatar: 'TS',
        content: "This is amazing! I've been waiting for something like this. Can't wait to see how the community grows.",
        timestamp: '1 hour ago',
        reactions: { '👍': 5, '❤️': 3 },
        replies: [
          {
            id: 'reply-1-1',
            author: 'Jordan Lee',
            avatar: 'JL',
            content: "Totally agree! The design looks fantastic too.",
            timestamp: '45 min ago',
            reactions: { '👍': 2 },
            replies: [],
            isExpanded: true
          },
          {
            id: 'reply-1-2',
            author: 'Morgan Chen',
            avatar: 'MC',
            content: "Will there be support for private messaging?",
            timestamp: '30 min ago',
            reactions: {},
            replies: [
              {
                id: 'reply-1-2-1',
                author: 'Alex Johnson',
                avatar: 'AJ',
                content: "Yes, private messaging is on our roadmap for Q3!",
                timestamp: '15 min ago',
                reactions: { '👏': 4 },
                replies: [],
                isExpanded: true
              }
            ],
            isExpanded: true
          }
        ],
        isExpanded: true
      },
      {
        id: 'comment-2',
        author: 'Casey Brown',
        avatar: 'CB',
        content: "The mobile experience is smooth. Love the gesture controls!",
        timestamp: '50 min ago',
        reactions: { '❤️': 7 },
        replies: [],
        isExpanded: true
      },
      {
        id: 'comment-3',
        author: 'Riley Davis',
        avatar: 'RD',
        content: "How do I customize my profile? I can't seem to find the settings.",
        timestamp: '25 min ago',
        reactions: {},
        replies: [],
        isExpanded: true
      }
    ]);
  }, []);
  
  // Toggle comment expansion
  const toggleComment = (commentId: string) => {
    setComments(prev => toggleCommentRecursive(prev, commentId));
  };
  
  const toggleCommentRecursive = (comments: Comment[], commentId: string): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, isExpanded: !comment.isExpanded };
      }
      if (comment.replies.length > 0) {
        return { ...comment, replies: toggleCommentRecursive(comment.replies, commentId) };
      }
      return comment;
    });
  };
  
  // Add reaction to comment
  const addReaction = (commentId: string, emoji: string) => {
    setComments(prev => addReactionRecursive(prev, commentId, emoji));
    setShowReactionMenu(null);
  };
  
  const addReactionRecursive = (comments: Comment[], commentId: string, emoji: string): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        const newReactions = { ...comment.reactions };
        newReactions[emoji] = (newReactions[emoji] || 0) + 1;
        return { ...comment, reactions: newReactions };
      }
      if (comment.replies.length > 0) {
        return { ...comment, replies: addReactionRecursive(comment.replies, commentId, emoji) };
      }
      return comment;
    });
  };
  
  // Handle touch start for swipe to refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (contentRef.current && contentRef.current.scrollTop === 0) {
      touchStartRef.current = {
        startY: e.touches[0].pageY,
        scrollTop: contentRef.current.scrollTop
      };
    }
  };
  
  // Handle touch move for swipe to refresh
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touchY = e.touches[0].pageY;
    const diff = touchY - touchStartRef.current.startY;
    
    if (diff > 50) {
      setIsRefreshing(true);
      // Simulate refreshing data
      setTimeout(() => {
        setIsRefreshing(false);
        touchStartRef.current = null;
      }, 1000);
    }
  };
  
  // Handle touch end
  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };
  
  // Handle long press for reaction menu
  const handleLongPress = (commentId: string, e: React.TouchEvent | React.MouseEvent) => {
    if (e.type === 'mousedown' || e.type === 'touchstart') {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      setShowReactionMenu({ id: commentId, x: clientX, y: clientY });
    }
  };
  
  // Add a new comment
  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    
    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      author: 'You',
      avatar: 'ME',
      content: newComment,
      timestamp: 'Just now',
      reactions: {},
      replies: [],
      isExpanded: true
    };
    
    setComments([...comments, newCommentObj]);
    setNewComment('');
    setIsFabMenuOpen(false);
  };
  
  // Render comment with nested replies
  const renderComment = (comment: Comment, depth: number = 0) => {
    const hasReplies = comment.replies.length > 0;
    
    return (
      <div 
        key={comment.id}
        className={`relative transition-all duration-300 ease-in-out ${
          depth > 0 ? 'ml-4 md:ml-6 border-l-2 border-indigo-200/30 pl-3' : ''
        }`}
      >
        {/* Comment card */}
        <div 
          className={`bg-white/20 backdrop-blur-lg rounded-2xl p-4 mb-3 shadow-lg transition-all duration-300 ${
            depth > 0 ? 'border border-purple-200/20' : ''
          }`}
          onTouchStart={(e) => handleLongPress(comment.id, e)}
          onMouseDown={(e) => handleLongPress(comment.id, e)}
        >
          <div className="flex items-start gap-3">
            {/* User avatar */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
              {comment.avatar}
            </div>
            
            {/* Comment content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">{comment.author}</h3>
                <span className="text-xs text-white/60">{comment.timestamp}</span>
              </div>
              <p className="mt-1 text-white/90">{comment.content}</p>
              
              {/* Reactions */}
              {Object.keys(comment.reactions).length > 0 && (
                <div className="mt-2 flex gap-2">
                  {Object.entries(comment.reactions).map(([emoji, count]) => (
                    <span 
                      key={emoji} 
                      className="bg-purple-500/20 text-xs px-2 py-1 rounded-full text-white flex items-center gap-1"
                    >
                      {emoji} {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Expand/collapse button for replies */}
        {hasReplies && (
          <button 
            onClick={() => toggleComment(comment.id)}
            className="flex items-center text-sm text-indigo-200 mb-2 ml-4"
          >
            <span className="mr-1">
              {comment.isExpanded ? '▼' : '▶'}
            </span>
            {comment.isExpanded 
              ? `Collapse ${comment.replies.length} replies` 
              : `Expand ${comment.replies.length} replies`}
          </button>
        )}
        
        {/* Replies */}
        {hasReplies && comment.isExpanded && (
          <div className="mt-1">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col font-['Poppins']">
      {/* Glassmorphism header */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl py-4 px-5 border-b border-white/20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-xl font-bold text-white">CommunityHub</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Swipe refresh indicator */}
      {isRefreshing && (
        <div className="w-full flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      )}
      
      {/* Main content */}
      <main 
        ref={contentRef}
        className="flex-1 overflow-y-auto pb-24 pt-4 px-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Forum post */}
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-5 mb-5 shadow-lg border border-purple-200/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold">
              AJ
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{forumPost.title}</h2>
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-sm">by {forumPost.author}</span>
                <span className="text-white/60 text-xs">•</span>
                <span className="text-white/60 text-xs">{forumPost.timestamp}</span>
              </div>
            </div>
          </div>
          
          <p className="text-white/90 mb-4">{forumPost.content}</p>
          
          <div className="flex flex-wrap gap-2">
            {forumPost.tags.map(tag => (
              <span 
                key={tag} 
                className="bg-indigo-500/30 text-indigo-200 text-xs px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
            <div className="flex gap-4">
              <button className="flex items-center gap-1 text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>42</span>
              </button>
              <button className="flex items-center gap-1 text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{comments.length}</span>
              </button>
            </div>
            
            <button className="text-pink-400 hover:text-pink-300 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>Save</span>
            </button>
          </div>
        </div>
        
        {/* Comments section header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Comments</h3>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Sort by:</span>
            <select className="bg-indigo-900/50 text-white text-sm rounded-lg px-2 py-1 border border-white/20">
              <option>Newest</option>
              <option>Most Popular</option>
              <option>Oldest</option>
            </select>
          </div>
        </div>
        
        {/* Comments list */}
        <div className="mb-24">
          {comments.map(comment => renderComment(comment))}
        </div>
      </main>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {isFabMenuOpen ? (
          <div className="flex flex-col items-end gap-3">
            <button 
              onClick={handleAddComment}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full px-5 py-3 shadow-lg font-medium flex items-center gap-2 transition-transform hover:scale-105"
            >
              Post Comment
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </button>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your comment..."
              className="w-full bg-white/20 backdrop-blur-lg rounded-2xl p-4 text-white placeholder-white/50 border border-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
              rows={3}
            />
            <button 
              onClick={() => setIsFabMenuOpen(false)}
              className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsFabMenuOpen(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Reaction menu */}
      {showReactionMenu && (
        <div 
          className="fixed z-50 bg-white/20 backdrop-blur-xl rounded-full p-2 shadow-xl flex gap-2"
          style={{
            left: showReactionMenu.x - 120,
            top: showReactionMenu.y - 60
          }}
        >
          {emojis.map(emoji => (
            <button
              key={emoji}
              onClick={() => addReaction(showReactionMenu.id, emoji)}
              className="text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/30 transition-all transform hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      
      {/* Glassmorphism footer */}
      <footer className="sticky bottom-0 bg-white/10 backdrop-blur-xl py-3 px-5 border-t border-white/20 flex justify-around">
        <button className="flex flex-col items-center text-pink-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button className="flex flex-col items-center text-white/70">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xs mt-1">Communities</span>
        </button>
        
        <button className="flex flex-col items-center text-white/70">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-xs mt-1">Messages</span>
        </button>
        
        <button className="flex flex-col items-center text-white/70">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-1">Profile</span>
        </button>
      </footer>
    </div>
  );
};

export default ForumApp;