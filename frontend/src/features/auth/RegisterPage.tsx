import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { registerSchema, type RegisterFormValues } from '../../lib/schemas/auth.schemas';

const inputClass = `
  w-full bg-[#0D0D0D] text-white placeholder-[#666] text-sm
  border border-[rgba(255,255,255,0.08)] rounded-lg
  pl-10 pr-4 py-3
  focus:outline-none focus:border-[rgba(89,211,255,0.40)]
  transition-colors duration-200
`;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/dashboard';
  const { register: registerUser } = useAuth();
  const [apiError, setApiError] = useState('');
  const [plansOpen, setPlansOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError('');
    try {
      await registerUser(data);
      navigate(nextPath, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg ?? 'Registration failed. Please try again.');
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
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-bold tracking-widest text-white">
            THALASSA
          </Link>
          <p className="mt-2 text-sm text-[#A0A0A0]">Create your free account</p>
        </div>

        {/* Plan badges */}
        <div className="flex gap-2 justify-center mb-2">
          <span className="text-xs text-[#A0A0A0] border border-[rgba(255,255,255,0.08)] rounded-full px-3 py-1">
            FREE · 1 aquarium
          </span>
          <span className="text-xs text-[#59D3FF] border border-[rgba(89,211,255,0.30)] rounded-full px-3 py-1">
            REEFMASTER · $4.99/mo
          </span>
        </div>

        {/* Plan comparison toggle */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setPlansOpen((v) => !v)}
            className="mx-auto flex items-center gap-1 text-xs text-[#59D3FF] hover:underline cursor-pointer"
          >
            {plansOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Comparar planes
          </button>
          <AnimatePresence>
            {plansOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3"
              >
                <table className="w-full text-xs border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.06)]">
                      <th className="text-left px-3 py-2 text-[#666] font-medium">Función</th>
                      <th className="text-center px-3 py-2 text-[#A0A0A0] font-medium">FREE</th>
                      <th className="text-center px-3 py-2 text-[#59D3FF] font-medium">REEFMASTER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {[
                      ['Acuarios',          '1',          'Ilimitados'],
                      ['Parámetros y alertas', '✓',      '✓'],
                      ['Mercado y wishlist',   '✓',      '✓'],
                      ['Asistente IA',      '5/día',     'Ilimitado'],
                      ['Calculadoras premium', '—',      '✓'],
                      ['Exportar CSV',      '—',         '✓'],
                    ].map(([feat, free, reef]) => (
                      <tr key={feat as string}>
                        <td className="px-3 py-2 text-[#A0A0A0]">{feat}</td>
                        <td className="px-3 py-2 text-center text-[#666]">{free}</td>
                        <td className="px-3 py-2 text-center text-[#59D3FF] font-medium">{reef}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-[#A0A0A0] mb-1.5">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                {...register('username')}
                type="text"
                placeholder="reefer_john"
                className={inputClass}
              />
            </div>
            {errors.username ? (
              <p className="mt-1 text-xs text-[#F87171]">{errors.username.message}</p>
            ) : (
              <p className="mt-1 text-xs text-[#555]">Este será tu nombre público en la plataforma, sin espacios</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[#A0A0A0] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-[#F87171]">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-[#A0A0A0] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-[#F87171]">{errors.password.message}</p>
            )}
          </div>

          {/* API error banner */}
          {apiError && (
            <div className="flex items-center gap-2 text-[#F87171] text-sm bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.20)] rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {apiError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#666]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#59D3FF] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
