'use client';

import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat-sidebar";
import { useState, createContext, useContext } from "react";

// Create a context for chat session management
interface ChatContextType {
  activeSessionId: number | null;
  setActiveSessionId: (id: number | null) => void;
  refreshChatHistory: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatLayout');
  }
  return context;
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSessionSelect = (sessionId: number | null) => {
    setActiveSessionId(sessionId);
    // This will trigger the chat interface to load messages for this session
  };

  const handleNewChat = () => {
    // Reset to no active session initially - the sidebar will set the new session ID
    // after creating it successfully
  };

  const refreshChatHistory = () => {
    // Trigger a refresh of the chat history in sidebar
    setRefreshTrigger(prev => prev + 1);
  };

  const contextValue: ChatContextType = {
    activeSessionId,
    setActiveSessionId,
    refreshChatHistory,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      <SidebarProvider>
        <ChatSidebar
          activeSessionId={activeSessionId}
          onSessionSelect={handleSessionSelect}
          onNewChat={handleNewChat}
          key={refreshTrigger} // This will force re-render when needed
        />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ChatContext.Provider>
  );
}