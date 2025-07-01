// 'use client'

// import { useState } from 'react'
// import { ChatSession } from '../components/types/chat'
// import { formatDistanceToNow } from 'date-fns'

// interface ChatSidebarProps {
//   sessions: ChatSession[]
//   currentSessionId: number | null
//   onSelectSession: (sessionId: number) => void
//   onNewChat: () => void
//   onDeleteChat: (sessionId: number) => void
//   isOpen: boolean
//   onToggle: () => void
// }

// export function ChatSidebar({
//   sessions,
//   currentSessionId,
//   onSelectSession,
//   onNewChat,
//   onDeleteChat,
//   isOpen
// }: ChatSidebarProps) {
//   const [hoveredSession, setHoveredSession] = useState<number | null>(null)

//   if (!isOpen) return null

//   return (
//     <div className="w-64 bg-gradient-to-b from-pink-50 via-pink-25 to-white border-r border-pink-200 flex flex-col shadow-lg">
//       {/* Header */}
//       <div className="p-4 border-b border-pink-200 bg-gradient-to-r from-pink-100 to-rose-100">
//         <div className="flex items-center mb-4">
//           <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mr-3">
//             <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
//               <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
//             </svg>
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-pink-800">Chat History</h2>
//             <p className="text-xs text-pink-600">Your conversations</p>
//           </div>
//         </div>
        
//         <button
//           onClick={onNewChat}
//           className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
//         >
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           <span className="font-medium">New Chat</span>
//         </button>
//       </div>

//       {/* Chat Sessions */}
//       <div className="flex-1 overflow-y-auto">
//         {sessions.length === 0 ? (
//           <div className="p-6 text-center">
//             <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
//               <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//               </svg>
//             </div>
//             <p className="text-pink-500 text-sm font-medium">No conversations yet</p>
//             <p className="text-pink-400 text-xs mt-1">Start a new chat to begin</p>
//           </div>
//         ) : (
//           <div className="p-3 space-y-2">
//             {sessions.map((session) => {
//               // Debug logging to see what we're getting
//               console.log('Session data:', session);
              
//               // Make sure we have a valid session_id
//               if (!session.session_id) {
//                 console.warn('Session missing session_id:', session);
//                 return null;
//               }

//               return (
//                 <div
//                   key={session.session_id}
//                   className={`relative group rounded-xl p-3 cursor-pointer transition-all duration-200 ${
//                     currentSessionId === session.session_id
//                       ? 'bg-gradient-to-r from-pink-200 to-rose-200 shadow-md border border-pink-300'
//                       : 'hover:bg-pink-100 hover:shadow-sm border border-transparent hover:border-pink-200'
//                   }`}
//                   onClick={() => {
//                     console.log('Clicking session with ID:', session.session_id);
//                     onSelectSession(session.session_id);
//                   }}
//                   onMouseEnter={() => setHoveredSession(session.session_id)}
//                   onMouseLeave={() => setHoveredSession(null)}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center mb-2">
//                         <div className="w-2 h-2 bg-pink-400 rounded-full mr-2"></div>
//                         <div className="font-semibold text-sm truncate text-pink-800">
//                           {session.session_name || `Chat ${session.session_id}`}
//                         </div>
//                       </div>
                      
//                       <div className="text-xs text-pink-600 mb-1">
//                         {session.last_message_at && !isNaN(new Date(session.last_message_at).getTime()) ? (
//                           formatDistanceToNow(new Date(session.last_message_at), { addSuffix: true })
//                         ) : (
//                           "No messages yet"
//                         )}
//                       </div>

//                       {session.message_count > 0 && (
//                         <div className="flex items-center">
//                           <svg className="w-3 h-3 text-pink-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                           </svg>
//                           <span className="text-xs text-pink-500">
//                             {session.message_count} messages
//                           </span>
//                         </div>
//                       )}
//                     </div>
                    
//                     {hoveredSession === session.session_id && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           onDeleteChat(session.session_id)
//                         }}
//                         className="ml-2 p-2 hover:bg-pink-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
//                         title="Delete chat"
//                       >
//                         <svg className="w-4 h-4 text-pink-600 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                         </svg>
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="p-4 border-t border-pink-200 bg-gradient-to-r from-pink-50 to-white">
//         <div className="flex items-center justify-center">
//           <div className="w-4 h-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full mr-2"></div>
//           <div className="text-xs text-pink-600 font-medium">
//             Pregnancy Assistant v2.2
//           </div>
//         </div>
//         <div className="text-center mt-1">
//           <span className="text-xs text-pink-500">Caring for you & baby</span>
//         </div>
//       </div>
//     </div>
//   )
// }