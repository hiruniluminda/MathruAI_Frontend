"use client"

import * as React from "react"
import { useState } from "react"
import {
  IconMessage,
  IconPlus,
  IconTrash,
  IconDots,
  IconSearch,
  IconSettings,
  IconHelp,
  IconInnerShadowTop,
  IconCalendar,
  IconClock,
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

// Mock chat history data - replace with your actual data source
const mockChatHistory = [
  {
    id: "1",
    title: "Pregnancy nutrition questions",
    lastMessage: "Thank you for the vitamin recommendations!",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    messageCount: 8
  },
  {
    id: "2", 
    title: "Exercise during second trimester",
    lastMessage: "What exercises are safe at 20 weeks?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    messageCount: 12
  },
  {
    id: "3",
    title: "Morning sickness remedies",
    lastMessage: "The ginger tea really helped!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    messageCount: 6
  },
  {
    id: "4",
    title: "Prenatal appointments schedule",
    lastMessage: "When should I schedule my next ultrasound?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    messageCount: 4
  },
  {
    id: "5",
    title: "Baby movement patterns",
    lastMessage: "Is it normal to feel less movement in the evening?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    messageCount: 10
  },
  {
    id: "6",
    title: "Sleep positions during pregnancy",
    lastMessage: "Thanks for the pillow suggestions!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
    messageCount: 5
  }
]

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
  chat: typeof mockChatHistory[0]
  isActive?: boolean
  onSelect: (chatId: string) => void
  onDelete: (chatId: string) => void
}

function ChatHistoryItem({ chat, isActive, onSelect, onDelete }: ChatHistoryItemProps) {
  const [showOptions, setShowOptions] = useState(false)
  
  const formatTime = (date: Date) => {
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

  return (
    <SidebarMenuItem>
      <div 
        className={`group relative rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-pink-50 ${
          isActive ? 'bg-pink-100 border-l-4 border-pink-500' : ''
        }`}
        onClick={() => onSelect(chat.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <IconMessage className="h-4 w-4 text-pink-500 flex-shrink-0" />
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {truncateText(chat.title, 25)}
              </h4>
            </div>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {truncateText(chat.lastMessage, 45)}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <IconClock className="h-3 w-3" />
                {formatTime(chat.timestamp)}
              </span>
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                {chat.messageCount}
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
                    onDelete(chat.id)
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

function groupChatsByDate(chats: typeof mockChatHistory) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const groups = {
    today: [] as typeof mockChatHistory,
    yesterday: [] as typeof mockChatHistory,
    thisWeek: [] as typeof mockChatHistory,
    older: [] as typeof mockChatHistory
  }

  chats.forEach(chat => {
    const chatDate = new Date(chat.timestamp.getFullYear(), chat.timestamp.getMonth(), chat.timestamp.getDate())
    
    if (chatDate.getTime() === today.getTime()) {
      groups.today.push(chat)
    } else if (chatDate.getTime() === yesterday.getTime()) {
      groups.yesterday.push(chat)
    } else if (chatDate.getTime() >= weekAgo.getTime()) {
      groups.thisWeek.push(chat)
    } else {
      groups.older.push(chat)
    }
  })

  return groups
}

export function ChatSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeChatId, setActiveChatId] = useState<string | null>("1")
  const [chatHistory, setChatHistory] = useState(mockChatHistory)

  const handleNewChat = () => {
    setActiveChatId(null)
    // Add logic to start a new chat
    console.log("Starting new chat...")
  }

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId)
    // Add logic to load selected chat
    console.log("Loading chat:", chatId)
  }

  const handleDeleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    if (activeChatId === chatId) {
      setActiveChatId(null)
    }
  }

  const groupedChats = groupChatsByDate(chatHistory)

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
            className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <IconPlus className="h-5 w-5" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        {/* Chat History */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium px-3 py-2">
            Chat History
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            {/* Today */}
            {groupedChats.today.length > 0 && (
              <>
                <div className="px-3 py-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Today</span>
                </div>
                {groupedChats.today.map((chat) => (
                  <ChatHistoryItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChatId === chat.id}
                    onSelect={handleSelectChat}
                    onDelete={handleDeleteChat}
                  />
                ))}
              </>
            )}

            {/* Yesterday */}
            {groupedChats.yesterday.length > 0 && (
              <>
                <div className="px-3 py-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yesterday</span>
                </div>
                {groupedChats.yesterday.map((chat) => (
                  <ChatHistoryItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChatId === chat.id}
                    onSelect={handleSelectChat}
                    onDelete={handleDeleteChat}
                  />
                ))}
              </>
            )}

            {/* This Week */}
            {groupedChats.thisWeek.length > 0 && (
              <>
                <div className="px-3 py-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">This Week</span>
                </div>
                {groupedChats.thisWeek.map((chat) => (
                  <ChatHistoryItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChatId === chat.id}
                    onSelect={handleSelectChat}
                    onDelete={handleDeleteChat}
                  />
                ))}
              </>
            )}

            {/* Older */}
            {groupedChats.older.length > 0 && (
              <>
                <div className="px-3 py-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Older</span>
                </div>
                {groupedChats.older.map((chat) => (
                  <ChatHistoryItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChatId === chat.id}
                    onSelect={handleSelectChat}
                    onDelete={handleDeleteChat}
                  />
                ))}
              </>
            )}

            {/* Empty State */}
            {chatHistory.length === 0 && (
              <div className="text-center py-8 px-4">
                <IconMessage className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No chat history yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a new conversation to see it here</p>
              </div>
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