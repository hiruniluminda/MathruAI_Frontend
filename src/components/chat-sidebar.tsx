"use client"

import * as React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react"
import {
  IconMessage,
  IconPlus,
  IconTrash,
  IconDots,
  IconSearch,
  IconSettings,
  IconHelp,
  IconInnerShadowTop,
  IconClock,
  IconLoader,
} from "@tabler/icons-react"

import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Types
interface ChatSession {
  session_id: number
  session_name: string
  created_at: string
  last_activity: string
  message_count: number
}

interface ChatMessage {
  id: number
  session_id: number
  message: string
  response?: string
  message_type: 'user' | 'assistant'
  created_at: string
}

// Expose methods for external components to call
export interface ChatSidebarRef {
  refreshChatHistory: () => Promise<void>
}

const data = {
  user: {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "/avatars/user.jpg",
  },
  navSecondary: [
    {
      title: "Search Chats",
      url: "#",
      icon: IconSearch,
    },
    {
      title: "Settings", 
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
}

interface ChatHistoryItemProps {
  session: ChatSession
  isActive?: boolean
  onSelect: (sessionId: number) => void
  onDelete: (sessionId: number) => void
}

function ChatHistoryItem({ session, isActive, onSelect, onDelete }: ChatHistoryItemProps) {
  const [showOptions, setShowOptions] = useState(false)
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowOptions(false)
    if (showOptions) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showOptions])

  return (
    <SidebarMenuItem>
      <div 
        className={`group relative rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-pink-50 ${
          isActive ? 'bg-pink-100 border-l-4 border-pink-500' : ''
        }`}
        onClick={() => onSelect(session.session_id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <IconMessage className="h-4 w-4 text-pink-500 flex-shrink-0" />
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {truncateText(session.session_name || `Chat ${session.session_id}`, 25)}
              </h4>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <IconClock className="h-3 w-3" />
                {formatTime(session.last_activity)}
              </span>
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                {session.message_count}
              </span>
            </div>
          </div>
          
          <div className="relative ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowOptions(!showOptions)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
            >
              <IconDots className="h-4 w-4 text-gray-500" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(session.session_id)
                    setShowOptions(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <IconTrash className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarMenuItem>
  )
}

function groupSessionsByDate(sessions: ChatSession[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const groups = {
    today: [] as ChatSession[],
    yesterday: [] as ChatSession[],
    thisWeek: [] as ChatSession[],
    older: [] as ChatSession[]
  }

  sessions.forEach(session => {
    const sessionDate = new Date(session.last_activity)
    const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())
    
    if (sessionDateOnly.getTime() === today.getTime()) {
      groups.today.push(session)
    } else if (sessionDateOnly.getTime() === yesterday.getTime()) {
      groups.yesterday.push(session)
    } else if (sessionDateOnly.getTime() >= weekAgo.getTime()) {
      groups.thisWeek.push(session)
    } else {
      groups.older.push(session)
    }
  })

  return groups
}

interface ChatSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeSessionId?: number | null
  onSessionSelect?: (sessionId: number | null) => void
  onNewChat?: () => void
  onRefreshNeeded?: () => void
}

export const ChatSidebar = forwardRef<ChatSidebarRef, ChatSidebarProps>(
  ({ activeSessionId, onSessionSelect, onNewChat, onRefreshNeeded, ...props }, ref) => {
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [creatingSession, setCreatingSession] = useState(false)

    // Fetch chat sessions from backend
    const fetchChatSessions = useCallback(async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_BASE_URL}/chats`)
        const data = await response.json()
        
        if (data.status === 'success') {
          setChatSessions(data.sessions)
        } else {
          setError('Failed to load chat sessions')
        }
      } catch (err) {
        setError('Unable to connect to server')
        console.error('Failed to fetch chat sessions:', err)
      } finally {
        setLoading(false)
      }
    }, [])

    // Expose refresh method to parent components
    useImperativeHandle(ref, () => ({
      refreshChatHistory: fetchChatSessions
    }), [fetchChatSessions])

    // Create new chat session
    const handleNewChat = async () => {
      try {
        setCreatingSession(true)
        setError(null)
        const response = await fetch(`${API_BASE_URL}/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_name: `Chat ${new Date().toLocaleDateString()}`
          })
        })
        
        const data = await response.json()
        
        if (data.status === 'success') {
          // Refresh sessions list
          await fetchChatSessions()
          // Select the new session
          onSessionSelect?.(data.session_id)
          onNewChat?.()
        } else {
          setError('Failed to create new chat')
        }
      } catch (err) {
        setError('Failed to create new chat')
        console.error('Failed to create new chat:', err)
      } finally {
        setCreatingSession(false)
      }
    }

    // Delete chat session
    const handleDeleteChat = async (sessionId: number) => {
      if (!confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/chats/${sessionId}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        
        if (data.status === 'success') {
          setChatSessions(prev => prev.filter(session => session.session_id !== sessionId))
          if (activeSessionId === sessionId) {
            onSessionSelect?.(null)
          }
        } else {
          setError('Failed to delete chat')
        }
      } catch (err) {
        setError('Failed to delete chat')
        console.error('Failed to delete chat:', err)
      }
    }

    // Handle session selection
    const handleSelectChat = (sessionId: number) => {
      onSessionSelect?.(sessionId)
    }

    // Load sessions on mount
    useEffect(() => {
      fetchChatSessions()
    }, [fetchChatSessions])

    // Auto-refresh sessions periodically (optional)
    useEffect(() => {
      const interval = setInterval(() => {
        if (!loading && !creatingSession) {
          fetchChatSessions()
        }
      }, 60000) // Refresh every minute

      return () => clearInterval(interval)
    }, [loading, creatingSession, fetchChatSessions])

    const groupedSessions = groupSessionsByDate(chatSessions)

    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="#">
                  <IconInnerShadowTop className="!size-5 text-pink-500" />
                  <span className="text-base font-semibold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    Pregnancy Advisor
                  </span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          
          {/* New Chat Button */}
          <div className="px-3 py-2">
            <button
              onClick={handleNewChat}
              disabled={creatingSession}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingSession ? (
                <IconLoader className="h-5 w-5 animate-spin" />
              ) : (
                <IconPlus className="h-5 w-5" />
              )}
              <span className="font-medium">
                {creatingSession ? 'Creating...' : 'New Chat'}
              </span>
            </button>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-2">
          {/* Error Message */}
          {error && (
            <div className="mx-3 mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
              {error}
              <button 
                onClick={fetchChatSessions}
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Chat History */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-600 font-medium px-3 py-2 flex items-center justify-between">
              <span>Chat History</span>
              {!loading && (
                <button
                  onClick={fetchChatSessions}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Refresh chat history"
                >
                  <IconLoader className={`h-3 w-3 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <IconLoader className="h-6 w-6 animate-spin text-pink-500" />
                  <span className="ml-2 text-sm text-gray-500">Loading chats...</span>
                </div>
              ) : (
                <>
                  {/* Today */}
                  {groupedSessions.today.length > 0 && (
                    <>
                      <div className="px-3 py-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Today</span>
                      </div>
                      {groupedSessions.today.map((session) => (
                        <ChatHistoryItem
                          key={session.session_id}
                          session={session}
                          isActive={activeSessionId === session.session_id}
                          onSelect={handleSelectChat}
                          onDelete={handleDeleteChat}
                        />
                      ))}
                    </>
                  )}

                  {/* Yesterday */}
                  {groupedSessions.yesterday.length > 0 && (
                    <>
                      <div className="px-3 py-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yesterday</span>
                      </div>
                      {groupedSessions.yesterday.map((session) => (
                        <ChatHistoryItem
                          key={session.session_id}
                          session={session}
                          isActive={activeSessionId === session.session_id}
                          onSelect={handleSelectChat}
                          onDelete={handleDeleteChat}
                        />
                      ))}
                    </>
                  )}

                  {/* This Week */}
                  {groupedSessions.thisWeek.length > 0 && (
                    <>
                      <div className="px-3 py-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">This Week</span>
                      </div>
                      {groupedSessions.thisWeek.map((session) => (
                        <ChatHistoryItem
                          key={session.session_id}
                          session={session}
                          isActive={activeSessionId === session.session_id}
                          onSelect={handleSelectChat}
                          onDelete={handleDeleteChat}
                        />
                      ))}
                    </>
                  )}

                  {/* Older */}
                  {groupedSessions.older.length > 0 && (
                    <>
                      <div className="px-3 py-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Older</span>
                      </div>
                      {groupedSessions.older.map((session) => (
                        <ChatHistoryItem
                          key={session.session_id}
                          session={session}
                          isActive={activeSessionId === session.session_id}
                          onSelect={handleSelectChat}
                          onDelete={handleDeleteChat}
                        />
                      ))}
                    </>
                  )}

                  {/* Empty State */}
                  {chatSessions.length === 0 && !loading && (
                    <div className="text-center py-8 px-4">
                      <IconMessage className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No chat history yet</p>
                      <p className="text-xs text-gray-400 mt-1">Start a new conversation to see it here</p>
                    </div>
                  )}
                </>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <NavSecondary items={data.navSecondary} />
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
    )
  }
)

ChatSidebar.displayName = "ChatSidebar"