export interface ChatSession {
  session_id: number
  session_name: string
  created_at: string
  last_message_at: string
  message_count: number
}

export interface Message {
  message_id: number
  session_id: number
  message: string
  message_type: 'user' | 'assistant'
  created_at: string
  response: string | null
  response_time_ms: number | null
}