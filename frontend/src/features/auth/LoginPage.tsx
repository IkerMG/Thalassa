import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import { loginSchema, type LoginFormValues } from '../../lib/schemas/auth.schemas';

const inputClass = `
  w-full bg-[#0D0D0D] text-white placeholder-[#666] text-sm
  border border-[rgba(255,255,255,0.08)] rounded-lg
  pl-10 pr-4 py-3
  focus:outline-none focus:border-[rgba(89,211,255,0.40)]
  transition-colors duration-200
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError('');
    try {
      await login(data);
      navigate('/dashboard', { replace: true });
    } catch {
      setApiError('Invalid email or password.');
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
          <p className="mt-2 text-sm text-[#A0A0A0]">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
            Sign In
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-[#666]">
          <Link to="/forgot-password" className="text-[#59D3FF] hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-[#666]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#59D3FF] hover:underline">
            Sign up free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
