'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Heart, Baby, MessageCircle, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Container from "@/components/shared/container";

// Types
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface ChatResponse {
  status: string;
  response: string;
  processing_time_seconds: number;
  parameters_used?: {
    top_k: number;
    similarity_threshold: number;
  };
}



interface SystemStats {
  knowledge_base_stats: {
    total_chunks: number;
    embedding_dimension: number;
    embedding_model: string;
    database_connected: boolean;
  };
}

export default function ChatBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your pregnancy advisor assistant. I'm here to help answer your questions about pregnancy, provide guidance, and support you through this wonderful journey. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
      status: 'sent'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Base URL - adjust this to match your Flask backend
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check system health on component mount
  useEffect(() => {
    checkSystemHealth();
    fetchSystemStats();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      setIsConnected(response.ok && data.status === 'healthy');
      setConnectionError(response.ok ? null : data.error || 'System not healthy');
    } catch (error) {
      setIsConnected(false);
      setConnectionError('Unable to connect to the server. Please make sure the backend is running.');
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (response.ok) {
        const data = await response.json();
        setSystemStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      content: messageContent,
      isUser: true,
      timestamp: new Date(),
      status: 'sent'
    };

    const botMessage: Message = {
      id: Date.now().toString() + '_bot',
      content: '',
      isUser: false,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          top_k: 3,
          similarity_threshold: 0.1
        }),
      });

      const data: ChatResponse = await response.json();

      if (response.ok && data.status === 'success') {
        setMessages(prev => prev.map(msg => 
          msg.id === botMessage.id 
            ? { ...msg, content: data.response, status: 'sent' }
            : msg
        ));
      } else {
        throw new Error(data.response || 'Failed to get response');
      }
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMessage.id 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error while processing your message. Please try again.', 
              status: 'error' 
            }
          : msg
      ));
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="h-3 w-3 animate-spin text-gray-400" />;
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Container title="Pregnancy Advisor ChatBot">
      <div className="max-w-4xl mx-auto h-screen flex flex-col bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-pink-100 p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-full">
                <Baby className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  Pregnancy Advisor
                  <Heart className="h-5 w-5 text-pink-500" />
                </h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`flex items-center gap-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                  {systemStats && (
                    <span className="text-gray-600">
                      📚 {systemStats.knowledge_base_stats.total_chunks} knowledge chunks
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Connection Error */}
          {connectionError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{connectionError}</span>
              <button 
                onClick={checkSystemHealth}
                className="ml-auto text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/50 to-pink-50/30">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  message.isUser
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-pink-100'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content || (message.status === 'sending' && 'Thinking...')}
                </div>
                <div className={`flex items-center justify-between mt-2 pt-2 border-t ${
                  message.isUser ? 'border-white/20' : 'border-gray-100'
                }`}>
                  <span className={`text-xs ${
                    message.isUser ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </span>
                  {getStatusIcon(message.status)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="bg-white border-t border-pink-100 p-4 rounded-b-lg">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isConnected ? "Ask me anything about pregnancy..." : "Please wait, connecting..."}
                disabled={isLoading || !isConnected}
                className="w-full px-4 py-3 pr-12 border border-pink-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400 bg-pink-50/30"
              />
              <MessageCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-400" />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim() || !isConnected}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          
          {/* Quick Tips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "What should I eat during pregnancy?",
              "Exercise during pregnancy",
              "Common pregnancy symptoms",
              "Prenatal vitamins guide"
            ].map((tip, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(tip)}
                disabled={isLoading || !isConnected}
                className="px-3 py-1 text-xs bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tip}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </Container>
  );
}