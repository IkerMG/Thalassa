import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Waves, BarChart3, Bot, ShoppingBag } from 'lucide-react';
import Button from '../../components/ui/Button';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut', delay },
});

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-lg font-bold tracking-widest text-white">THALASSA</span>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#A0A0A0]">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link to="/register"><Button variant="primary" size="sm">Sign up</Button></Link>
        </div>
      </div>
    </header>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Subtle radial glow from center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_60%,rgba(89,211,255,0.06),transparent)]" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center pt-16">
        <motion.div {...fadeUp(0)}>
          <span className="inline-flex items-center gap-2 text-xs text-[#59D3FF] border border-[rgba(89,211,255,0.25)] rounded-full px-4 py-1.5 mb-8">
            <Waves size={12} />
            Marine Aquarium Management
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6"
        >
          Your reef,{' '}
          <span className="text-[#59D3FF]">perfected.</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="text-lg text-[#A0A0A0] max-w-xl mx-auto mb-10 leading-relaxed"
        >
          The all-in-one management platform for marine aquarists. Track, optimize,
          and master your reef ecosystem.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register"><Button variant="primary" size="lg">Get Started Free</Button></Link>
          <a href="#features"><Button variant="secondary" size="lg">See How It Works</Button></a>
        </motion.div>
      </div>
    </section>
  );
}

// ── Social Proof ───────────────────────────────────────────────────────────
const stats = [
  { value: '1,200+', label: 'Aquariums Managed' },
  { value: '48,000+', label: 'Parameters Tracked' },
  { value: '3,500+', label: 'Species in Database' },
];

function SocialProof() {
  return (
    <section className="bg-black border-y border-[rgba(255,255,255,0.06)] py-16">
      <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-12">
        {stats.map((s, i) => (
          <motion.div key={s.label} {...fadeUp(i * 0.1)} className="text-center">
            <div className="text-4xl font-mono font-medium text-[#59D3FF] mb-1">{s.value}</div>
            <div className="text-sm text-[#A0A0A0]">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Features ───────────────────────────────────────────────────────────────
const features = [
  {
    icon: <BarChart3 size={22} className="text-[#59D3FF]" />,
    title: 'Track',
    desc: 'Log water parameters, track livestock, monitor equipment — all in one place.',
  },
  {
    icon: <Waves size={22} className="text-[#59D3FF]" />,
    title: 'Analyze',
    desc: 'Interactive charts show parameter trends. Know when your reef needs attention.',
  },
  {
    icon: <ShoppingBag size={22} className="text-[#59D3FF]" />,
    title: 'Discover',
    desc: 'Browse the marketplace for equipment and livestock from top retailers.',
  },
  {
    icon: <Bot size={22} className="text-[#59D3FF]" />,
    title: 'Optimize',
    desc: 'Dosing calculator, energy tracker, and AI-powered advice — all in one tool.',
  },
];

function Features() {
  return (
    <section id="features" className="bg-black py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-[#A0A0A0] max-w-md mx-auto">
            Built by reefers, for reefers. Every feature designed around the real needs of
            marine hobbyists.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp(i * 0.08)}
              className="
                bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-6
                hover:border-[rgba(255,255,255,0.15)] transition-all duration-200
              "
            >
              <div className="w-10 h-10 rounded-lg bg-[rgba(89,211,255,0.08)] flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing" className="bg-black py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {/* FREE */}
          <motion.div
            {...fadeUp(0.05)}
            className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-7"
          >
            <div className="text-sm text-[#A0A0A0] mb-1">Free</div>
            <div className="text-3xl font-bold text-white mb-6">$0</div>
            <ul className="space-y-3 text-sm text-[#A0A0A0] mb-8">
              {['1 aquarium', '5 AI chats/day', 'Parameter tracking', 'Market access'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-[#34D399]">✓</span> {f}
                </li>
              ))}
              {['Energy calculator', 'Dosing calculator'].map((f) => (
                <li key={f} className="flex items-center gap-2 opacity-40">
                  <span>✗</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block w-full">
              <Button variant="secondary" size="md" className="w-full">Start Free</Button>
            </Link>
          </motion.div>

          {/* REEFMASTER */}
          <motion.div
            {...fadeUp(0.1)}
            className="
              bg-black border border-[rgba(89,211,255,0.40)] rounded-xl p-7 relative
              shadow-[0_0_30px_rgba(89,211,255,0.08)]
            "
          >
            <span className="absolute top-4 right-4 text-[10px] font-mono text-[#59D3FF] border border-[rgba(89,211,255,0.30)] rounded px-2 py-0.5">
              RECOMMENDED
            </span>
            <div className="text-sm text-[#59D3FF] mb-1">ReefMaster</div>
            <div className="text-3xl font-bold text-white mb-6">$4.99<span className="text-base font-normal text-[#A0A0A0]">/mo</span></div>
            <ul className="space-y-3 text-sm text-[#A0A0A0] mb-8">
              {['Unlimited aquariums', 'Unlimited AI', 'Parameter tracking', 'Market access', 'Energy calculator', 'Dosing calculator'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-[#34D399]">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block w-full">
              <Button variant="primary" size="md" className="w-full">Go ReefMaster</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── CTA Final ──────────────────────────────────────────────────────────────
function CTAFinal() {
  return (
    <section className="bg-black border-t border-[rgba(255,255,255,0.06)] py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <motion.h2 {...fadeUp(0)} className="text-3xl font-bold text-white mb-4">
          Join the next generation of reef keeping.
        </motion.h2>
        <motion.p {...fadeUp(0.1)} className="text-[#A0A0A0] mb-8">
          Start managing your aquarium today — completely free.
        </motion.p>
        <motion.div {...fadeUp(0.2)}>
          <Link to="/register">
            <Button variant="primary" size="lg">Create Your Account</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-black border-t border-[rgba(255,255,255,0.06)] py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm font-bold tracking-widest text-white">THALASSA</span>
        <p className="text-xs text-[#666]">© 2026 Thalassa. All rights reserved.</p>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <Pricing />
      <CTAFinal />
      <Footer />
    </>
  );
}
