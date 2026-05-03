import { Send } from 'lucide-react';
import Button from '../../../components/ui/Button';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export default function ChatInput({ value, onChange, onSend, disabled, isLoading }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="px-4 pb-4 pt-3 border-t border-[rgba(255,255,255,0.08)] shrink-0">
      <div className="flex gap-2 items-end">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Límite diario alcanzado…' : 'Escribe tu pregunta…'}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 text-sm text-white outline-none resize-none focus:border-[rgba(89,211,255,0.40)] transition-colors placeholder:text-[#3A3A3A] disabled:opacity-40 disabled:cursor-not-allowed leading-relaxed"
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        <Button
          variant="primary"
          size="md"
          onClick={onSend}
          isLoading={isLoading}
          disabled={!value.trim() || disabled}
          className="shrink-0 !px-4 !py-3"
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
