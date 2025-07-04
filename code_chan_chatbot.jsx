"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  Settings 
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 p-3">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <span className="text-sm text-muted-foreground ml-2">CodeChan AI is thinking...</span>
  </div>
)

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.type === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`p-2 rounded-full ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div className={`rounded-lg p-3 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</div>
        </div>
      </div>
    </motion.div>
  )
}

const CodeChanChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    type: 'bot',
    content: 'Hello! I\'m CodeChan AI, your competitive programming assistant. Ask me anything!',
    timestamp: new Date()
  }])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchDeepSeekResponse = async (userMessage: string) => {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-54e9587e7f2c49f9a9c27df1fbe9f91d"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are CodeChan, a competitive programming assistant. Be concise, and give real insights for CP learning." },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      })
    })

    const data = await res.json()
    return data.choices[0].message.content
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const reply = await fetchDeepSeekResponse(userMessage.content)
      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: reply,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      setError('Failed to get response from DeepSeek.')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4"
            >
              <Card className="w-96 h-[600px] flex flex-col shadow-2xl border-2">
                <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary-foreground/20 rounded-full">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">CodeChan AI</h3>
                      <p className="text-xs opacity-90">Competitive Programming Assistant</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                          <Settings size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Settings</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setIsExpanded(false)}
                          className="text-primary-foreground hover:bg-primary-foreground/20"
                        >
                          <ChevronDown size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Minimize</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle size={16} />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask anything..."
                      disabled={isTyping || isLoading}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping || isLoading} size="sm">
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-full w-14 h-14 shadow-lg"
            size="lg"
          >
            {isExpanded ? <ChevronDown size={24} /> : <Bot size={24} />}
          </Button>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}

export default CodeChanChatbot
