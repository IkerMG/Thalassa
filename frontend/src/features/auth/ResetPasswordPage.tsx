import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { toast } from '../../lib/toast';
import Button from '../../components/ui/Button';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-[#F87171] text-sm">
            Enlace de reseteo inválido o expirado.
          </p>
          <Link to="/forgot-password" className="text-[#59D3FF] text-sm hover:underline">
            Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!PASSWORD_REGEX.test(newPassword)) {
      setValidationError('Mínimo 8 caracteres con al menos una letra y un número.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      toast.success('Contraseña actualizada. Ya puedes iniciar sesión.');
      navigate('/login', { replace: true });
    } catch {
      toast.error('El enlace es inválido o ha expirado. Solicita uno nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full bg-[#0D0D0D] text-white placeholder-[#666] text-sm
    border border-[rgba(255,255,255,0.08)] rounded-lg
    pl-10 pr-4 py-3
    focus:outline-none focus:border-[rgba(89,211,255,0.40)]
    transition-colors duration-200
  `;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-bold tracking-widest text-white">
            THALASSA
          </Link>
          <p className="mt-2 text-sm text-[#A0A0A0]">Establece tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A0A0A0] mb-1.5">
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mín. 8 chars, letra y número"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A0A0A0] mb-1.5">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 text-[#F87171] text-sm bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.20)] rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {validationError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full mt-2"
          >
            Guardar contraseña
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#666]">
          <Link to="/login" className="text-[#59D3FF] hover:underline">
            Volver al login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
