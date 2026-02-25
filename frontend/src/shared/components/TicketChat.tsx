import React, { useEffect, useState, useRef, useCallback } from 'react'
import { TicketChatSocket, ChatMessage, ChatEvent } from '../../services/chatService'

interface Props {
  ticketId: number
  channelType: 'admin_employee'
  currentUserId: number
  currentUserRole: string
}

const TicketChat: React.FC<Props> = ({ ticketId, channelType, currentUserId, currentUserRole }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<{ user_id: number; username: string }[]>([])
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const socketRef = useRef<TicketChatSocket | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout>>()

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    setMessages([])
    setConnected(false)
    setTypingUsers([])
    setReplyTo(null)

    const socket = new TicketChatSocket(ticketId, channelType, {
      onEvent: (event: ChatEvent) => {
        switch (event.type) {
          case 'message_history':
            setMessages(event.messages)
            setTimeout(scrollToBottom, 50)
            break
          case 'new_message':
            setMessages(prev => [...prev, event.message])
            setTimeout(scrollToBottom, 50)
            break
          case 'typing':
            setTypingUsers(prev => {
              const filtered = prev.filter(u => u.user_id !== event.user_id)
              if (event.is_typing) {
                return [...filtered, { user_id: event.user_id, username: event.username }]
              }
              return filtered
            })
            break
          case 'reaction_update':
            setMessages(prev => prev.map(m => {
              if (m.id === event.data.message_id) {
                const newReactions: Record<string, { user_id: number; username: string }[]> = {}
                for (const r of event.data.reactions) {
                  if (!newReactions[r.emoji]) newReactions[r.emoji] = []
                  newReactions[r.emoji].push({ user_id: r.user_id, username: r.username })
                }
                return { ...m, reactions: newReactions }
              }
              return m
            }))
            break
          case 'read_receipt':
            setMessages(prev => prev.map(m => {
              const receipt = event.data.find((d: any) => d.message_id === m.id)
              if (receipt) {
                const already = m.read_by.some(r => r.user_id === receipt.user_id)
                if (!already) return { ...m, read_by: [...m.read_by, receipt] }
              }
              return m
            }))
            break
          case 'force_disconnect':
            setConnected(false)
            break
        }
      },
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
    })

    socketRef.current = socket
    return () => { socket.disconnect() }
  }, [ticketId, channelType, scrollToBottom])

  // Mark unread messages as read
  useEffect(() => {
    if (!connected || messages.length === 0) return
    const unread = messages
      .filter(m => m.id != null && m.sender_id !== currentUserId && !m.read_by.some(r => r.user_id === currentUserId))
      .map(m => m.id!)
    if (unread.length > 0) {
      socketRef.current?.markRead(unread)
    }
  }, [messages, connected, currentUserId])

  const handleSend = () => {
    if (!input.trim() || !connected) return
    socketRef.current?.sendMessage(input.trim(), replyTo?.id ?? undefined)
    setInput('')
    setReplyTo(null)
    // Stop typing
    socketRef.current?.sendTyping(false)
    clearTimeout(typingTimer.current)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    // Send typing indicator
    socketRef.current?.sendTyping(true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socketRef.current?.sendTyping(false)
    }, 2000)
  }

  const handleReact = (msgId: number | null, emoji: string) => {
    if (msgId != null) socketRef.current?.react(msgId, emoji)
  }

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } catch { return '' }
  }

  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      {/* Connection status */}
      <div style={{ padding: '4px 10px', fontSize: 11, background: connected ? '#dcfce7' : '#fef3c7', color: connected ? '#15803d' : '#92400e', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
        {connected ? 'Connected' : 'Connecting...'}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} style={{ padding: 12, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 20 }}>No messages yet</div>
        )}
        {messages.map((m, idx) => {
          const isMe = m.sender_id === currentUserId
          const isSystem = m.is_system_message
          const showSender = !isMe && (idx === 0 || messages[idx - 1].sender_id !== m.sender_id || messages[idx - 1].is_system_message)

          if (isSystem) {
            return (
              <div key={m.id ?? `sys-${idx}`} style={{ textAlign: 'center', margin: '8px 0' }}>
                <span style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: '4px 12px', borderRadius: 12, display: 'inline-block' }}>
                  {m.content}
                </span>
              </div>
            )
          }

          return (
            <div key={m.id ?? idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
              {showSender && (
                <span style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2, marginLeft: isMe ? 0 : 4, marginRight: isMe ? 4 : 0 }}>
                  {m.sender_username} ({m.sender_role})
                </span>
              )}
              {/* Reply reference */}
              {m.reply_to && (
                <div style={{ fontSize: 11, color: '#6b7280', background: '#f9fafb', borderLeft: '3px solid #d1d5db', padding: '2px 8px', borderRadius: 4, marginBottom: 2, maxWidth: 260 }}>
                  <strong>{m.reply_to.sender_username}:</strong> {m.reply_to.content}
                </div>
              )}
              <div
                style={{
                  background: isMe ? '#2563eb' : '#f3f4f6',
                  color: isMe ? '#fff' : '#1f2937',
                  padding: '8px 12px',
                  borderRadius: 12,
                  borderTopRightRadius: isMe ? 4 : 12,
                  borderTopLeftRadius: isMe ? 12 : 4,
                  maxWidth: '75%',
                  wordBreak: 'break-word',
                  fontSize: 14,
                  position: 'relative',
                }}
              >
                {m.content}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, gap: 8 }}>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{formatTime(m.created_at)}</span>
                  {isMe && m.read_by.length > 0 && (
                    <span style={{ fontSize: 10, opacity: 0.7 }}>✓✓</span>
                  )}
                </div>
              </div>
              {/* Reactions */}
              {Object.keys(m.reactions).length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 2, flexWrap: 'wrap' }}>
                  {Object.entries(m.reactions).map(([emoji, users]) => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(m.id, emoji)}
                      style={{
                        background: users.some(u => u.user_id === currentUserId) ? '#dbeafe' : '#f3f4f6',
                        border: users.some(u => u.user_id === currentUserId) ? '1px solid #93c5fd' : '1px solid #e5e7eb',
                        borderRadius: 12, padding: '1px 6px', fontSize: 12, cursor: 'pointer',
                      }}
                      title={users.map(u => u.username).join(', ')}
                    >
                      {emoji} {users.length}
                    </button>
                  ))}
                </div>
              )}
              {/* Quick react + reply */}
              {!isMe && m.id != null && (
                <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                  {quickEmojis.map(emoji => (
                    <button key={emoji} onClick={() => handleReact(m.id, emoji)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '0 2px', opacity: 0.5 }} title={emoji}>{emoji}</button>
                  ))}
                  <button onClick={() => setReplyTo(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#6b7280', padding: '0 4px' }} title="Reply">↩</button>
                </div>
              )}
            </div>
          )
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 4 }}>
            {typingUsers.map(u => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
      </div>

      {/* Reply bar */}
      {replyTo && (
        <div style={{ padding: '6px 12px', background: '#eff6ff', borderTop: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#1d4ed8' }}>
          <span>Replying to <strong>{replyTo.sender_username}</strong>: {replyTo.content.slice(0, 60)}{replyTo.content.length > 60 ? '...' : ''}</span>
          <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280' }}>&times;</button>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: 8, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={connected ? 'Type a message...' : 'Connecting...'}
          disabled={!connected}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' }}
        />
        <button
          onClick={handleSend}
          disabled={!connected || !input.trim()}
          style={{
            padding: '8px 16px', borderRadius: 20, background: connected && input.trim() ? '#2563eb' : '#93c5fd',
            color: '#fff', border: 'none', cursor: connected && input.trim() ? 'pointer' : 'default', fontWeight: 600, fontSize: 13,
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default TicketChat
