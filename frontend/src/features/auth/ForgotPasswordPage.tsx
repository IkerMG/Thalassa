import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { toast } from '../../lib/toast';
import Button from '../../components/ui/Button';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => navigate('/login', { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [sent, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success('Si el email existe, recibirás un enlace de recuperación.');
      setSent(true);
    } catch {
      toast.error('No se pudo procesar la solicitud. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="mt-2 text-sm text-[#A0A0A0]">Recupera tu contraseña</p>
        </div>

        {sent ? (
          <div className="text-center space-y-3">
            <p className="text-sm text-[#A0A0A0]">
              Revisa tu bandeja de entrada. Redirigiendo al login…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A0A0A0] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="
                    w-full bg-[#0D0D0D] text-white placeholder-[#666] text-sm
                    border border-[rgba(255,255,255,0.08)] rounded-lg
                    pl-10 pr-4 py-3
                    focus:outline-none focus:border-[rgba(89,211,255,0.40)]
                    transition-colors duration-200
                  "
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-2"
            >
              Enviar enlace
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#666]">
          <Link to="/login" className="text-[#59D3FF] hover:underline">
            Volver al login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
