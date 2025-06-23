// forum-app.tsx
import React, { useState, useEffect, useRef } from 'react';

// TypeScript interfaces for our data structure
interface Reaction {
  emoji: string;
  count: number;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  reactions: Reaction[];
  replies: Comment[];
  expanded: boolean;
}

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  comments: Comment[];
}

const ForumApp = () => {
  // State for threads, refreshing status, and new post form
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [activeThread, setActiveThread] = useState<ForumThread | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  
  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setThreads(mockThreads);
    }, 800);
  }, []);

  // Function to simulate real-time updates
  const simulateNewComment = () => {
    if (!activeThread) return;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: 'NewUser',
      content: 'Just joined this discussion!',
      timestamp: 'Just now',
      avatar: 'U',
      reactions: [{ emoji: '👍', count: 0 }],
      replies: [],
      expanded: true
    };
    
    const updatedThread = {
      ...activeThread,
      comments: [...activeThread.comments, newComment]
    };
    
    setActiveThread(updatedThread);
    setThreads(threads.map(t => t.id === updatedThread.id ? updatedThread : t));
  };

  // Handle swipe to refresh
  const touchStartY = useRef(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY.current;
    
    if (diff > 80 && !isRefreshing) {
      setIsRefreshing(true);
      // Simulate refreshing data
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1500);
    }
  };

  // Toggle comment expansion
  const toggleCommentExpand = (commentId: string) => {
    if (!activeThread) return;
    
    const toggle = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, expanded: !comment.expanded };
        }
        if (comment.replies.length > 0) {
          return { ...comment, replies: toggle(comment.replies) };
        }
        return comment;
      });
    };
    
    const updatedThread = {
      ...activeThread,
      comments: toggle(activeThread.comments)
    };
    
    setActiveThread(updatedThread);
  };

  // Add reaction to a comment
  const addReaction = (commentId: string, emoji: string) => {
    if (!activeThread) return;
    
    const updateReactions = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          const existingReaction = comment.reactions.find(r => r.emoji === emoji);
          const updatedReactions = existingReaction
            ? comment.reactions.map(r => 
                r.emoji === emoji ? { ...r, count: r.count + 1 } : r
              )
            : [...comment.reactions, { emoji, count: 1 }];
          
          return { ...comment, reactions: updatedReactions };
        }
        if (comment.replies.length > 0) {
          return { ...comment, replies: updateReactions(comment.replies) };
        }
        return comment;
      });
    };
    
    const updatedThread = {
      ...activeThread,
      comments: updateReactions(activeThread.comments)
    };
    
    setActiveThread(updatedThread);
  };

  // Create new post
  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    const newThread: ForumThread = {
      id: `thread-${Date.now()}`,
      title: newPostTitle,
      content: newPostContent,
      author: 'CurrentUser',
      timestamp: 'Just now',
      comments: []
    };
    
    setThreads([newThread, ...threads]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostForm(false);
    setActiveThread(newThread);
  };

  // Render a single comment with nested replies
  const renderComment = (comment: Comment, depth = 0) => {
    const indent = depth * 16;
    
    return (
      <div 
        key={comment.id} 
        className={`mb-4 transition-all duration-300 ${depth > 0 ? 'ml-4' : ''}`}
        style={{ marginLeft: `${indent}px` }}
      >
        <div className="bg-white/30 backdrop-blur-lg rounded-2xl p-4 border border-white/50 shadow-lg">
          <div className="flex items-start">
            <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold mr-3">
              {comment.avatar}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-indigo-900">{comment.author}</h3>
                  <p className="text-xs text-indigo-700/80">{comment.timestamp}</p>
                </div>
                <button 
                  onClick={() => toggleCommentExpand(comment.id)}
                  className="text-indigo-500 hover:text-indigo-700"
                >
                  {comment.expanded ? 'Collapse' : 'Expand'}
                </button>
              </div>
              <p className="mt-2 text-gray-800">{comment.content}</p>
              
              {/* Reactions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {comment.reactions.map(reaction => (
                  <button
                    key={reaction.emoji}
                    onClick={() => addReaction(comment.id, reaction.emoji)}
                    className="flex items-center bg-white/40 backdrop-blur-sm px-2 py-1 rounded-full text-sm transition-all hover:bg-white/60"
                  >
                    <span>{reaction.emoji}</span>
                    <span className="ml-1 text-indigo-900">{reaction.count}</span>
                  </button>
                ))}
                
                {/* Reaction picker */}
                <div className="relative group">
                  <button className="bg-white/40 backdrop-blur-sm px-2 py-1 rounded-full text-sm hover:bg-white/60">
                    <span className="opacity-70">+</span>
                  </button>
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex bg-white/80 backdrop-blur-lg p-2 rounded-xl shadow-lg z-10">
                    {['👍', '❤️', '😂', '😲', '👎'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(comment.id, emoji)}
                        className="text-2xl mx-1 hover:scale-110 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Nested replies */}
        {comment.expanded && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 font-sans">
      {/* Header */}
      <header className="bg-white/30 backdrop-blur-lg border-b border-white/50 sticky top-0 z-50 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg w-10 h-10 flex items-center justify-center text-white font-bold">
              F
            </div>
            <h1 className="ml-3 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              ForumGlass
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-white/40 backdrop-blur-sm p-2 rounded-full hover:bg-white/60 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="bg-white/40 backdrop-blur-sm p-2 rounded-full hover:bg-white/60 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="max-w-3xl mx-auto px-4 py-6 relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Swipe to refresh indicator */}
        {isRefreshing && (
          <div className="fixed top-16 left-0 right-0 flex justify-center z-40">
            <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-lg flex items-center">
              <svg className="animate-spin h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-indigo-700 font-medium">Updating discussions...</span>
            </div>
          </div>
        )}

        {activeThread ? (
          // Thread Detail View
          <div className="pb-24">
            {/* Back button */}
            <button 
              onClick={() => setActiveThread(null)}
              className="flex items-center text-indigo-600 mb-4 hover:text-indigo-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to discussions
            </button>
            
            {/* Thread content */}
            <div className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/50 shadow-lg">
              <h1 className="text-2xl font-bold text-indigo-900 mb-2">{activeThread.title}</h1>
              <div className="flex items-center text-sm mb-4">
                <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mr-2">
                  {activeThread.author.charAt(0)}
                </div>
                <div>
                  <span className="font-medium text-indigo-800">{activeThread.author}</span>
                  <span className="mx-2 text-indigo-700/60">•</span>
                  <span className="text-indigo-700/80">{activeThread.timestamp}</span>
                </div>
              </div>
              <p className="text-gray-800">{activeThread.content}</p>
              
              <div className="mt-6 flex space-x-4">
                <button className="flex items-center text-indigo-700 hover:text-indigo-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  24
                </button>
                <button className="flex items-center text-indigo-700 hover:text-indigo-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  {activeThread.comments.length} comments
                </button>
              </div>
            </div>
            
            {/* Comments section */}
            <div className="mb-24">
              <h2 className="text-xl font-semibold text-indigo-900 mb-4">Discussion ({activeThread.comments.length})</h2>
              
              {activeThread.comments.length > 0 ? (
                <div>
                  {activeThread.comments.map(comment => renderComment(comment))}
                </div>
              ) : (
                <div className="bg-white/30 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/50 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-indigo-900">No comments yet</h3>
                  <p className="mt-1 text-indigo-700/80">Be the first to start the discussion!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Thread List View
          <div className="pb-24">
            <h1 className="text-2xl font-bold text-indigo-900 mb-6">Community Discussions</h1>
            
            {threads.length > 0 ? (
              <div className="space-y-6">
                {threads.map(thread => (
                  <div 
                    key={thread.id} 
                    className="bg-white/30 backdrop-blur-lg rounded-2xl p-5 border border-white/50 shadow-lg transition-all hover:shadow-xl cursor-pointer"
                    onClick={() => setActiveThread(thread)}
                  >
                    <h2 className="text-lg font-semibold text-indigo-900 mb-2">{thread.title}</h2>
                    <p className="text-gray-700 line-clamp-2 mb-4">{thread.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mr-2">
                          {thread.author.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-indigo-800">{thread.author}</span>
                        <span className="mx-2 text-indigo-700/60">•</span>
                        <span className="text-sm text-indigo-700/80">{thread.timestamp}</span>
                      </div>
                      <div className="flex items-center text-indigo-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="text-sm">{thread.comments.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/30 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/50 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-indigo-900">No discussions yet</h3>
                <p className="mt-1 text-indigo-700/80 mb-4">Start a new discussion to get things going</p>
                <button 
                  onClick={() => setShowNewPostForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                  Create First Post
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Action Button */}
        <button 
          onClick={() => activeThread ? simulateNewComment() : setShowNewPostForm(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg z-40 hover:opacity-90 transition-opacity"
        >
          {activeThread ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>

        {/* New Post Form */}
        {showNewPostForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl w-full max-w-md p-6 border border-white/50 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-indigo-900">Create New Post</h2>
                <button 
                  onClick={() => setShowNewPostForm(false)}
                  className="text-indigo-500 hover:text-indigo-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="post-title" className="block text-sm font-medium text-indigo-800 mb-1">Title</label>
                  <input
                    type="text"
                    id="post-title"
                    className="w-full bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="What's your topic?"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="post-content" className="block text-sm font-medium text-indigo-800 mb-1">Content</label>
                  <textarea
                    id="post-content"
                    rows={4}
                    className="w-full bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Share your thoughts..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  ></textarea>
                </div>
                
                <button
                  onClick={handleCreatePost}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Post to Community
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/30 backdrop-blur-lg border-t border-white/50 py-6">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg w-8 h-8 flex items-center justify-center text-white font-bold mr-2">
                F
              </div>
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                ForumGlass
              </span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-indigo-700 hover:text-indigo-900 transition-colors">About</a>
              <a href="#" className="text-indigo-700 hover:text-indigo-900 transition-colors">Guidelines</a>
              <a href="#" className="text-indigo-700 hover:text-indigo-900 transition-colors">Privacy</a>
              <a href="#" className="text-indigo-700 hover:text-indigo-900 transition-colors">Terms</a>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-indigo-700/80">
            © {new Date().getFullYear()} ForumGlass. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Mock data for demonstration
const mockThreads: ForumThread[] = [
  {
    id: "thread-1",
    title: "What's your favorite UI design trend in 2023?",
    content: "I've been seeing more glassmorphism designs recently, especially in mobile apps. What do you think about this trend? Are there other design styles you're excited about?",
    author: "DesignEnthusiast",
    timestamp: "2 hours ago",
    comments: [
      {
        id: "comment-1",
        author: "CreativeCoder",
        content: "I'm really loving glassmorphism! It adds such a modern and sleek feel to interfaces. The subtle transparency and blur effects create depth without being overwhelming.",
        timestamp: "1 hour ago",
        avatar: "C",
        reactions: [{ emoji: "👍", count: 12 }, { emoji: "❤️", count: 5 }],
        replies: [
          {
            id: "reply-1-1",
            author: "DesignEnthusiast",
            content: "Totally agree! I also appreciate how it works well with vibrant color palettes.",
            timestamp: "45 min ago",
            avatar: "D",
            reactions: [{ emoji: "👍", count: 3 }],
            replies: [],
            expanded: true
          }
        ],
        expanded: true
      },
      {
        id: "comment-2",
        author: "UXMaster",
        content: "While glassmorphism is visually appealing, I think we should be cautious about accessibility. The transparency effects can sometimes reduce readability for users with visual impairments.",
        timestamp: "50 min ago",
        avatar: "U",
        reactions: [{ emoji: "👍", count: 8 }, { emoji: "👎", count: 1 }],
        replies: [
          {
            id: "reply-2-1",
            author: "AccessibilityAdvocate",
            content: "That's a great point. I always recommend having a solid background fallback for critical text elements.",
            timestamp: "30 min ago",
            avatar: "A",
            reactions: [{ emoji: "👍", count: 5 }],
            replies: [],
            expanded: true
          },
          {
            id: "reply-2-2",
            author: "DesignEnthusiast",
            content: "Excellent reminder! We should always prioritize accessibility over aesthetics.",
            timestamp: "25 min ago",
            avatar: "D",
            reactions: [{ emoji: "❤️", count: 3 }],
            replies: [],
            expanded: true
          }
        ],
        expanded: true
      }
    ]
  },
  {
    id: "thread-2",
    title: "How do you manage state in large React applications?",
    content: "As our app grows, state management is becoming more complex. What solutions have you found effective for managing state at scale?",
    author: "ReactDev",
    timestamp: "5 hours ago",
    comments: [
      {
        id: "comment-3",
        author: "StateMaster",
        content: "I've had great success with Zustand. It's lightweight and doesn't require as much boilerplate as Redux.",
        timestamp: "3 hours ago",
        avatar: "S",
        reactions: [{ emoji: "👍", count: 7 }],
        replies: [],
        expanded: true
      }
    ]
  },
  {
    id: "thread-3",
    title: "Best practices for mobile-first design implementation",
    content: "Looking for advice on implementing truly responsive mobile-first designs. What frameworks or techniques have worked best for you?",
    author: "MobileDesigner",
    timestamp: "1 day ago",
    comments: []
  }
];

export default ForumApp;