import { useRef, useState } from 'react';
import { ImageIcon, Link, Upload, X } from 'lucide-react';
import { useUploadImage } from '../../hooks/mutations/useUploadImage';
import type { UploadFolder } from '../../api/uploadApi';
import Spinner from '../ui/Spinner';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_LABEL = 'JPEG · PNG · WebP · máx. 5 MB';

interface ImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: UploadFolder;
  label?: string;
}

export default function ImageUploader({ value, onChange, folder, label }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useUploadImage();

  // ── File handling ──────────────────────────────────────────────────────────

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo no permitido. Usa JPEG, PNG o WebP.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'El archivo supera el límite de 5 MB.';
    }
    return null;
  }

  async function handleFile(file: File) {
    const error = validateFile(file);
    if (error) {
      setLocalError(error);
      return;
    }
    setLocalError(null);
    const result = await mutateAsync({ file, folder });
    onChange(result.url);
  }

  // ── Drag & drop events ─────────────────────────────────────────────────────

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  // ── URL mode ───────────────────────────────────────────────────────────────

  function confirmUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setShowUrlInput(false);
    setUrlInput('');
    setLocalError(null);
  }

  function cancelUrl() {
    setShowUrlInput(false);
    setUrlInput('');
  }

  // ── Clear image ────────────────────────────────────────────────────────────

  function clearImage() {
    onChange(null);
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-white/70">{label}</span>
      )}

      {/* ── Preview state ──────────────────────────────────────────────────── */}
      {value && !isPending && (
        <div
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <img
            src={value}
            alt="Preview"
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium text-white">Imagen cargada</span>
            <span className="truncate text-xs text-white/40">{value}</span>
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="ml-auto shrink-0 rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Quitar imagen"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Upload zone (shown when no value and not in URL mode) ───────────── */}
      {!value && !showUrlInput && (
        <div
          role="button"
          tabIndex={0}
          className={[
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-7 text-center transition-all duration-200 outline-none',
            isDragging
              ? 'border-[#59D3FF]/60 bg-[#59D3FF]/5'
              : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
          ].join(' ')}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !isPending && fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && !isPending && fileInputRef.current?.click()}
        >
          {isPending ? (
            <>
              <Spinner size={24} />
              <span className="text-sm text-white/60">Subiendo imagen...</span>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                {isDragging ? (
                  <Upload size={20} className="text-[#59D3FF]" />
                ) : (
                  <ImageIcon size={20} className="text-white/40" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-white/70">
                  Arrastra una imagen o{' '}
                  <span className="text-[#59D3FF]">haz clic para seleccionar</span>
                </span>
                <span className="text-xs text-white/30">{ALLOWED_LABEL}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── URL input mode ──────────────────────────────────────────────────── */}
      {!value && showUrlInput && (
        <div className="flex flex-col gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmUrl()}
            placeholder="https://ejemplo.com/imagen.jpg"
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-[#0D0D0D] px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#59D3FF]/50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmUrl}
              disabled={!urlInput.trim()}
              className="flex-1 rounded-md bg-[#59D3FF] py-1.5 text-sm font-medium text-black transition-opacity disabled:opacity-40"
            >
              Confirmar URL
            </button>
            <button
              type="button"
              onClick={cancelUrl}
              className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── "Paste URL" toggle (only in zone mode with no value) ────────────── */}
      {!value && !showUrlInput && !isPending && (
        <button
          type="button"
          onClick={() => setShowUrlInput(true)}
          className="flex items-center gap-1.5 self-start text-xs text-white/40 transition-colors hover:text-white/70"
        >
          <Link size={12} />
          Pegar URL de imagen
        </button>
      )}

      {/* ── Validation error ────────────────────────────────────────────────── */}
      {localError && (
        <span className="text-xs text-[#F87171]">{localError}</span>
      )}

      {/* ── Hidden file input ────────────────────────────────────────────────── */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
