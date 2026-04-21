import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ username, email, password });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Registration failed. Please try again.');
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
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="text-2xl font-bold tracking-widest text-white">
            THALASSA
          </Link>
          <p className="mt-2 text-sm text-[#A0A0A0]">Create your free account</p>
        </div>

        {/* Plan badges */}
        <div className="flex gap-2 justify-center mb-8">
          <span className="text-xs text-[#A0A0A0] border border-[rgba(255,255,255,0.08)] rounded-full px-3 py-1">
            FREE · 1 aquarium
          </span>
          <span className="text-xs text-[#59D3FF] border border-[rgba(89,211,255,0.30)] rounded-full px-3 py-1">
            REEFMASTER · $4.99/mo
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-[#A0A0A0] mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="reefer_john"
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

          {/* Email */}
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

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-[#A0A0A0] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-[#F87171] text-sm bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.20)] rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
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
