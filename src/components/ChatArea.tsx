'use client'

import { useState, useRef, useEffect } from 'react'
import { Message } from '../components/types/chat'
import { Baby, Heart } from 'lucide-react'

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (message: string) => void
  onToggleSidebar: () => void
  hasActiveSession: boolean
}

export function ChatArea({
  messages,
  isLoading,
  onSendMessage,
  onToggleSidebar,
  hasActiveSession
}: ChatAreaProps) {
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue)
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-pink-100 border-b border-pink-200 px-4 py-3 flex items-center">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-pink-200 rounded-lg transition-colors mr-3 text-pink-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-pink-600 p-2 rounded-full">
                <Baby className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  Pregnancy Advisor
                  <Heart className="h-5 w-5 text-pink-500" />
                </h1>
              </div>
            </div>
          </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-pink-25 to-white">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-pink-800 mb-3">
                Welcome to your Pregnancy Assistant
              </h2>
              <p className="text-pink-600">
                Ask me anything about pregnancy, prenatal care, or expectant motherhood. I'm here to help with guidance and support.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-4">
            {messages.map((message) => (
              <div key={message.message_id} className="mb-8">
                {/* User Message */}
                <div className="flex justify-end mb-4">
                  <div className="bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl px-5 py-3 max-w-xs lg:max-w-md shadow-md">
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>

                {/* Assistant Response */}
                {message.response && (
                  <div className="flex justify-start">
                    <div className="bg-pink-50 border border-pink-200 rounded-xl px-5 py-3 max-w-xs lg:max-w-md shadow-sm">
                      <p className="whitespace-pre-wrap text-pink-900">{message.response}</p>
                      {message.response_time_ms && (
                        <div className="text-xs text-pink-500 mt-2">
                          Responded in {(message.response_time_ms / 1000).toFixed(2)}s
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Message */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-pink-50 border border-pink-200 rounded-xl px-5 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-pink-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-gradient-to-r from-pink-50 to-white border-t border-pink-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about pregnancy, prenatal care, or any concerns you have..."
                className="w-full px-4 py-3 border border-pink-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none max-h-32 bg-white shadow-sm"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-gradient-to-r from-rose-400 to-pink-500 text-white p-3 rounded-xl hover:from-rose-500 hover:to-pink-600 disabled:from-pink-200 disabled:to-pink-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}