import { useEffect, useRef, useState } from 'react';
import { Send, Bot, ArrowLeft, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAquariumStore } from '../../store/aquariumStore';
import { aquariumApi } from '../../api/aquariumApi';
import { chatApi } from '../../api/chatApi';
import type { ChatMessage, ChatErrorCode } from '../../types/chat';
import Button from '../../components/ui/Button';

const AI_ERROR_MESSAGES: Record<ChatErrorCode, string> = {
  GEMINI_ERROR: 'El asistente tuvo un problema interno. Inténtalo de nuevo.',
  GEMINI_UNAVAILABLE: 'El asistente no está disponible en este momento.',
  INVALID_REQUEST: 'Mensaje no válido. Ajusta tu pregunta e inténtalo de nuevo.',
};

const SUGGESTIONS = [
  '¿Cuáles son los parámetros ideales para un arrecife?',
  '¿Qué peces son compatibles con los corales blandos?',
];

// ── Sub-components ────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="w-7 h-7 rounded-full bg-[rgba(89,211,255,0.10)] border border-[rgba(89,211,255,0.20)] flex items-center justify-center mr-2 flex-shrink-0 mt-1">
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
        <div className="w-7 h-7 rounded-full bg-[rgba(89,211,255,0.10)] border border-[rgba(89,211,255,0.20)] flex items-center justify-center mr-2 flex-shrink-0 mt-1">
          <Bot size={13} className="text-[#59D3FF]" />
        </div>
      )}
      <div
        className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
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

// ── Main view ─────────────────────────────────────────────────────────────────

export default function ChatView() {
  const user = useAuthStore((s) => s.user);
  const { aquariums, setAquariums } = useAquariumStore();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedAquariumId, setSelectedAquariumId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(5);
  const [rateLimited, setRateLimited] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const isFree = user?.plan === 'FREE';

  // Load usage once on mount
  useEffect(() => {
    chatApi
      .getUsage()
      .then((u) => {
        setUsed(u.used);
        setLimit(u.limit);
        if (u.limit !== -1 && u.used >= u.limit) setRateLimited(true);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load aquariums if store is empty
  useEffect(() => {
    if (aquariums.length === 0) {
      aquariumApi.list().then(setAquariums).catch(() => {});
    }
  }, [aquariums.length, setAquariums]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${role}`, role, content, timestamp: new Date() },
    ]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading || rateLimited) return;

    setInput('');
    addMessage('user', text);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const res = await chatApi.sendMessage({
        message: text,
        aquariumId: selectedAquariumId !== '' ? selectedAquariumId : null,
      });
      setIsTyping(false);

      if (res.errorCode) {
        addMessage(
          'assistant',
          AI_ERROR_MESSAGES[res.errorCode] ?? 'Error desconocido del asistente.',
        );
      } else {
        addMessage('assistant', res.reply);
        const newUsed = used + 1;
        setUsed(newUsed);
        if (limit !== -1 && newUsed >= limit) setRateLimited(true);
      }
    } catch (err: unknown) {
      setIsTyping(false);
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        setRateLimited(true);
        addMessage(
          'assistant',
          'Has alcanzado el límite diario de mensajes. Vuelve mañana o actualiza a ReefMaster.',
        );
      } else {
        addMessage(
          'assistant',
          'No se pudo conectar con el asistente. Comprueba tu conexión e inténtalo de nuevo.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const remaining = limit === -1 ? null : Math.max(0, limit - used);

  return (
    <div className="min-h-full flex flex-col max-w-3xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#555] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-[rgba(89,211,255,0.08)] border border-[rgba(89,211,255,0.20)] flex items-center justify-center">
            <Bot size={18} className="text-[#59D3FF]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Thalassa AI</h1>
            <p className="text-xs text-[#555]">Asistente de acuariofilia marina</p>
          </div>
        </div>

        {isFree && remaining !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#555]">
              {remaining}/{limit}
            </span>
            <div className="w-14 h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#59D3FF] rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, (remaining / limit) * 100)}%` }}
              />
            </div>
            <button className="flex items-center gap-1 text-xs text-[#59D3FF] border border-[rgba(89,211,255,0.25)] rounded-md px-2.5 py-1 hover:bg-[rgba(89,211,255,0.06)] transition-colors">
              <Crown size={11} />
              Premium
            </button>
          </div>
        )}
      </div>

      {/* Aquarium context selector */}
      {aquariums.length > 0 && (
        <div className="mb-4">
          <select
            value={selectedAquariumId}
            onChange={(e) =>
              setSelectedAquariumId(e.target.value ? Number(e.target.value) : '')
            }
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors cursor-pointer"
          >
            <option value="">Sin contexto de acuario</option>
            {aquariums.map((aq) => (
              <option key={aq.id} value={aq.id}>
                {aq.name} · {aq.liters} L
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages area */}
      <div
        className="flex-1 bg-black border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 overflow-y-auto mb-4"
        style={{ minHeight: '420px', maxHeight: '580px' }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 py-10">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(89,211,255,0.08)] border border-[rgba(89,211,255,0.15)] flex items-center justify-center">
              <Bot size={26} className="text-[#59D3FF]" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm mb-1">Hola, soy Thalassa AI</p>
              <p className="text-[#555] text-xs max-w-[300px] leading-relaxed">
                Pregúntame sobre parámetros de agua, compatibilidad de especies, equipamiento marino
                o cualquier duda sobre tu acuario.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left text-xs text-[#888] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 hover:border-[rgba(89,211,255,0.30)] hover:text-white transition-colors"
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

      {/* Rate limit banner */}
      {rateLimited && (
        <div className="mb-3 bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.18)] rounded-xl px-4 py-3">
          <p className="text-[#F87171] text-xs leading-relaxed">
            {isFree
              ? 'Has alcanzado el límite diario del plan FREE (5 mensajes). Vuelve mañana o actualiza a ReefMaster para mensajes ilimitados.'
              : 'Límite de mensajes alcanzado.'}
          </p>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={rateLimited ? 'Límite diario alcanzado…' : 'Escribe tu pregunta…'}
          disabled={rateLimited}
          rows={1}
          className="flex-1 bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white outline-none resize-none focus:border-[rgba(89,211,255,0.40)] transition-colors placeholder:text-[#3A3A3A] disabled:opacity-40 disabled:cursor-not-allowed leading-relaxed"
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        <Button
          variant="primary"
          size="md"
          onClick={() => void handleSend()}
          isLoading={isLoading}
          disabled={!input.trim() || rateLimited}
          className="flex-shrink-0 !px-4 !py-3"
        >
          {!isLoading && <Send size={15} />}
        </Button>
      </div>
      <p className="text-[#333] text-xs mt-2 text-center">
        Enter · enviar &nbsp;·&nbsp; Shift+Enter · nueva línea
      </p>
    </div>
  );
}
