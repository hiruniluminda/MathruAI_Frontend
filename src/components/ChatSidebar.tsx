'use client'

import { useState } from 'react'
import { ChatSession } from '../components/types/chat'
import { formatDistanceToNow } from 'date-fns'

interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSessionId: number | null
  onSelectSession: (sessionId: number) => void
  onNewChat: () => void
  onDeleteChat: (sessionId: number) => void
  isOpen: boolean
  onToggle: () => void
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteChat,
  isOpen
}: ChatSidebarProps) {
  const [hoveredSession, setHoveredSession] = useState<number | null>(null)

  if (!isOpen) return null

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">
            No chat sessions yet
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.session_id}
                className={`relative group rounded-lg p-3 cursor-pointer transition-colors ${
                  currentSessionId === session.session_id
                    ? 'bg-gray-800 text-white'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
                onClick={() => onSelectSession(session.session_id)}
                onMouseEnter={() => setHoveredSession(session.session_id)}
                onMouseLeave={() => setHoveredSession(null)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {session.session_name || `Chat ${session.session_id}`}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
  {session.last_message_at && !isNaN(new Date(session.last_message_at).getTime()) ? (
    formatDistanceToNow(new Date(session.last_message_at), { addSuffix: true })
  ) : (
    "No messages yet"
  )}
</div>

                    {session.message_count > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {session.message_count} messages
                      </div>
                    )}
                  </div>
                  
                  {hoveredSession === session.session_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat(session.session_id)
                      }}
                      className="ml-2 p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          Pregnancy Assistant v2.2
        </div>
      </div>
    </div>
  )
}