'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatSidebar } from './ChatSidebar'
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
      const response = await fetch(`${API_BASE_URL}/chats`)
      if (response.ok) {
        const data = await response.json()
        console.log('Loaded sessions:', data.sessions)
        setSessions(data.sessions || [])
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
    console.log('Selecting session:', sessionId)
    setCurrentSessionId(sessionId)
  }

  return (
    <div className="flex h-screen bg-gray-50">
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