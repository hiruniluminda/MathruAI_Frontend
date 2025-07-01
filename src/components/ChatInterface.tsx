'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatArea } from './ChatArea'
import { ChatSession, Message } from '../components/types/chat'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export function ChatInterface() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Load chat sessions on mount
  useEffect(() => {
    loadChatSessions()
  }, [])

  // Load messages when session changes - THIS IS THE KEY FIX
  useEffect(() => {
    console.log('Session changed to:', currentSessionId)
    if (currentSessionId) {
      loadChatHistory(currentSessionId)
    } else {
      setMessages([])
    }
  }, [currentSessionId])

  const loadChatSessions = async () => {
    try {
      console.log('Loading chat sessions from:', `${API_BASE_URL}/chats`)
      const response = await fetch(`${API_BASE_URL}/chats`)
      if (response.ok) {
        const data = await response.json()
        console.log('Raw API response:', data)
        console.log('Sessions data:', data.sessions)
        
        // FIXED: Normalize the sessions to have consistent session_id property
        const normalizedSessions = (data.sessions || []).map((session: any) => ({
          session_id: session.id || session.session_id, // Use 'id' if 'session_id' doesn't exist
          session_name: session.session_name,
          created_at: session.created_at,
          last_message_at: session.updated_at || session.last_message_at, // API uses 'updated_at'
          message_count: session.message_count
        })).filter((session: ChatSession) => {
          if (!session.session_id) {
            console.warn('Session missing session_id after normalization:', session);
            return false;
          }
          return true;
        });
        
        console.log('Normalized sessions:', normalizedSessions);
        setSessions(normalizedSessions)
      } else {
        console.error('Failed to load chat sessions - Response not OK:', response.status)
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
    }
  }

  const loadChatHistory = async (sessionId: number) => {
    try {
      setIsLoading(true) // Show loading while fetching history
      console.log('Loading chat history for session:', sessionId)
      
      const response = await fetch(`${API_BASE_URL}/chats/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Chat history response:', data)
        console.log('Loaded messages for session:', sessionId, data.messages)
        
        // IMPORTANT: Clear messages first, then set new ones
        setMessages(data.messages || [])
      } else {
        console.error('Failed to load chat history - Response not OK:', response.status)
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  const createNewChat = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('New chat created:', data)
        
        const newSession: ChatSession = {
          session_id: data.session_id,
          session_name: data.session_name,
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
          message_count: 0
        }
        
        setSessions(prev => [newSession, ...prev])
        setCurrentSessionId(data.session_id)
        setMessages([]) // Clear messages for new chat
        console.log('Created new chat with ID:', data.session_id)
      }
    } catch (error) {
      console.error('Failed to create new chat:', error)
    }
  }

  const deleteChat = async (sessionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${sessionId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSessions(prev => prev.filter(s => s.session_id !== sessionId))
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    // If no current session, create one first
    let sessionId = currentSessionId
    if (!sessionId) {
      try {
        const response = await fetch(`${API_BASE_URL}/chats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        
        if (response.ok) {
          const data = await response.json()
          sessionId = data.session_id
          setCurrentSessionId(sessionId)
          
          const newSession: ChatSession = {
            session_id: data.session_id,
            session_name: data.session_name,
            created_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
            message_count: 0
          }
          setSessions(prev => [newSession, ...prev])
        }
      } catch (error) {
        console.error('Failed to create session for message:', error)
        return
      }
    }

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      message_id: Date.now(),
      session_id: sessionId || 0,
      message: message,
      message_type: 'user',
      created_at: new Date().toISOString(),
      response: null,
      response_time_ms: null
    }

    setMessages(prev => [...prev, tempUserMessage])
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session_id: sessionId
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Message sent successfully:', data)
        
        // FIXED: Instead of adding another message, update the existing one with response
        setMessages(prev => prev.map(msg => 
          msg.message_id === tempUserMessage.message_id 
            ? { ...msg, response: data.response, response_time_ms: data.processing_time_seconds * 1000 }
            : msg
        ))
        
        // Refresh sessions to update message counts
        loadChatSessions()
      } else {
        throw new Error(`Failed to send message: ${response.status}`)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Update the temp message with error response
      setMessages(prev => prev.map(msg => 
        msg.message_id === tempUserMessage.message_id 
          ? { ...msg, response: 'Sorry, I encountered an error. Please try again.', response_time_ms: null }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const selectSession = (sessionId: number) => {
    console.log('selectSession called with:', sessionId, typeof sessionId)
    
    // Validate sessionId
    if (!sessionId || typeof sessionId !== 'number') {
      console.error('Invalid sessionId:', sessionId)
      return
    }
    
    console.log('Selecting session:', sessionId)
    setCurrentSessionId(sessionId)
  }

  // Pink-themed ChatSidebar component
  const ChatSidebar = ({ sessions, currentSessionId, onSelectSession, onNewChat, onDeleteChat, isOpen, onToggle }: any) => (
    <div className={`${isOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden bg-gradient-to-b from-pink-50 to-white border-r border-pink-200`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-pink-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-pink-800">Chat History</h2>
          </div>
          <button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-rose-500 hover:to-pink-600 transition-all duration-200 text-sm font-medium shadow-md"
          >
            + New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <div className="text-center text-pink-500 text-sm mt-8">
              No chats yet
            </div>
          ) : (
            sessions.map((session: ChatSession) => (
              <div
                key={session.session_id}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 group border-b border-pink-200 ${
                  currentSessionId === session.session_id
                    ? 'bg-gradient-to-r from-pink-200 to-rose-200 shadow-sm'
                    : 'hover:bg-pink-100'
                }`}
                onClick={() => onSelectSession(session.session_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-pink-800 truncate">
                      {session.session_name}
                    </h3>
                    <p className="text-xs text-pink-600 mt-1">
                      {session.message_count} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteChat(session.session_id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-pink-300 rounded text-pink-600 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-25 to-white">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        hasActiveSession={currentSessionId !== null}
      />
    </div>
  )
}