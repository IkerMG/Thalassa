import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useAquariumStore } from '../../store/aquariumStore';
import { chatApi } from '../../api/chatApi';
import { aquariumApi } from '../../api/aquariumApi';
import type { ChatErrorCode } from '../../types/chat';
import ChatHeader from './components/ChatHeader';
import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';

const AI_ERROR_MESSAGES: Record<ChatErrorCode, string> = {
  GEMINI_ERROR: 'El asistente tuvo un problema interno. Inténtalo de nuevo.',
  GEMINI_UNAVAILABLE: 'El asistente no está disponible en este momento.',
  INVALID_REQUEST: 'Mensaje no válido. Ajusta tu pregunta e inténtalo de nuevo.',
};

export default function ChatDrawer() {
  const isChatOpen = useUIStore((s) => s.isChatOpen);
  const closeChat = useUIStore((s) => s.closeChat);
  const messages = useUIStore((s) => s.messages);
  const appendMessage = useUIStore((s) => s.appendMessage);

  const user = useAuthStore((s) => s.user);
  const { aquariums, setAquariums } = useAquariumStore();

  const [input, setInput] = useState('');
  const [selectedAquariumId, setSelectedAquariumId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(5);
  const [rateLimited, setRateLimited] = useState(false);

  // Load usage when drawer opens for the first time
  useEffect(() => {
    if (!isChatOpen) return;
    chatApi.getUsage().then((u) => {
      setUsed(u.used);
      setLimit(u.limit);
      if (u.limit !== -1 && u.used >= u.limit) setRateLimited(true);
    }).catch(() => {});
  }, [isChatOpen]);

  // Load aquariums if store is empty
  useEffect(() => {
    if (aquariums.length === 0) {
      aquariumApi.list().then(setAquariums).catch(() => {});
    }
  }, [aquariums.length, setAquariums]);

  // Escape key closes the drawer
  useEffect(() => {
    if (!isChatOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeChat();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen, closeChat]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    appendMessage({ id: `${Date.now()}-${role}`, role, content, timestamp: new Date() });
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
        addMessage('assistant', AI_ERROR_MESSAGES[res.errorCode] ?? 'Error desconocido.');
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
        addMessage('assistant', 'Has alcanzado el límite diario de mensajes. Vuelve mañana o actualiza a ReefMaster.');
      } else {
        addMessage('assistant', 'No se pudo conectar con el asistente. Comprueba tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFree = user?.plan === 'FREE';

  return (
    <AnimatePresence>
      {isChatOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeChat}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full md:w-[380px] bg-[#0A0A0A] border-l border-[rgba(255,255,255,0.08)] z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <ChatHeader
              onClose={closeChat}
              aquariums={aquariums}
              selectedAquariumId={selectedAquariumId}
              onAquariumChange={setSelectedAquariumId}
              used={used}
              limit={isFree ? limit : -1}
            />

            <ChatMessageList
              messages={messages}
              isTyping={isTyping}
              onSuggestionClick={setInput}
            />

            {/* Rate limit banner */}
            {rateLimited && (
              <div className="mx-4 mb-2 bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.18)] rounded-xl px-4 py-3 shrink-0">
                <p className="text-[#F87171] text-xs leading-relaxed">
                  {isFree
                    ? 'Has alcanzado el límite diario del plan FREE (5 mensajes). Vuelve mañana o actualiza a ReefMaster.'
                    : 'Límite de mensajes alcanzado.'}
                </p>
              </div>
            )}

            <ChatInput
              value={input}
              onChange={setInput}
              onSend={() => void handleSend()}
              disabled={rateLimited}
              isLoading={isLoading}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
