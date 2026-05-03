import { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import type { ChatMessage } from '../../../types/chat';

const SUGGESTIONS = [
  '¿Cuáles son los parámetros ideales para un arrecife?',
  '¿Qué peces son compatibles con los corales blandos?',
];

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-7 h-7 rounded-full bg-[rgba(89,211,255,0.10)] border border-[rgba(89,211,255,0.20)] flex items-center justify-center mr-2 shrink-0 mt-1">
        <Bot size={13} className="text-[#59D3FF]" />
      </div>
      <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#59D3FF] opacity-50 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[rgba(89,211,255,0.10)] border border-[rgba(89,211,255,0.20)] flex items-center justify-center mr-2 shrink-0 mt-1">
          <Bot size={13} className="text-[#59D3FF]" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-[#59D3FF] text-black font-medium rounded-br-sm'
            : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#E0E0E0] rounded-bl-sm'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSuggestionClick: (text: string) => void;
}

export default function ChatMessageList({ messages, isTyping, onSuggestionClick }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(89,211,255,0.08)] border border-[rgba(89,211,255,0.15)] flex items-center justify-center">
            <Bot size={26} className="text-[#59D3FF]" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm mb-1">Hola, soy Thalassa AI</p>
            <p className="text-[#555] text-xs max-w-[260px] leading-relaxed">
              Pregúntame sobre parámetros de agua, compatibilidad de especies o cualquier duda sobre tu acuario.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSuggestionClick(s)}
                className="text-left text-xs text-[#888] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 hover:border-[rgba(89,211,255,0.30)] hover:text-white transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isTyping && <TypingIndicator />}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
