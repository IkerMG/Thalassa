import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Bot, ShoppingBag, Zap, Shield, Tag, Calculator } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut', delay },
});

const gridContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const gridItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

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
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <video
        src={`${import.meta.env.BASE_URL}assets/hero-bg.mp4`}
        autoPlay
        loop
        muted
        playsInline
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }}
      />
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: -1 }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_60%,rgba(89,211,255,0.06),transparent)]" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center pt-16">
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

// ── Section 1: MetricsStrip ────────────────────────────────────────────────
const metrics = [
  { value: '1.200+', label: 'Acuarios Gestionados', sub: 'en sistemas de arrecife, solo peces y mixtos' },
  { value: '48.000+', label: 'Parámetros Registrados', sub: 'pH, salinidad, nitrato, alcalinidad y más' },
  { value: '3.500+', label: 'Especies en la Base de Datos', sub: 'con datos de compatibilidad y cuidado' },
];

function MetricsStrip() {
  return (
    <section className="bg-black border-y border-[rgba(255,255,255,0.06)] py-14">
      <div className="max-w-5xl mx-auto px-6">
        <motion.p
          {...fadeUp(0)}
          className="text-center text-xs font-mono tracking-widest uppercase text-[#A0A0A0] mb-10"
        >
          Confiado por la comunidad reefera
        </motion.p>
        <div className="flex flex-col sm:flex-row divide-y divide-[rgba(255,255,255,0.06)] sm:divide-y-0 sm:divide-x sm:divide-[rgba(255,255,255,0.06)]">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              {...fadeUp(i * 0.12)}
              className="flex-1 text-center px-8 py-8 sm:py-0"
            >
              <div className="text-5xl font-mono font-medium text-[#59D3FF] mb-2">{m.value}</div>
              <div className="text-sm text-white font-medium mb-1">{m.label}</div>
              <div className="text-xs text-[#666]">{m.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 2: FeatureShowcase ─────────────────────────────────────────────
function FeatureShowcase() {
  return (
    <section id="features" className="bg-black py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-4">Diseñado para reefers de verdad.</h2>
          <p className="text-[#A0A0A0] max-w-md mx-auto">
            No es una app genérica. Cada función existe porque un problema real del hobby lo exigía.
          </p>
        </motion.div>

        {/* Hero feature card — full width */}
        <motion.div
          {...fadeUp(0.1)}
          className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-6 md:p-8 mb-4 hover:border-[rgba(255,255,255,0.15)] transition-all duration-200"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Text */}
            <div>
              <div className="w-10 h-10 rounded-lg bg-[rgba(89,211,255,0.08)] flex items-center justify-center mb-5">
                <BarChart3 size={22} className="text-[#59D3FF]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Inteligencia de Parámetros</h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                Registra pH, salinidad, alcalinidad, nitrato y más de 8 parámetros. Los gráficos
                interactivos revelan tendencias antes de que se conviertan en problemas.
              </p>
            </div>
            {/* Sparkline mockup */}
            <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-5 space-y-4" aria-hidden="true">
              {[
                { label: 'pH', value: '8,2', points: '0,18 20,16 40,17 60,14 80,15 100,13 120,14' },
                { label: 'Alc.', value: '9,1 dKH', points: '0,20 20,19 40,18 60,17 80,15 100,13 120,12' },
                { label: 'NO₃', value: '5 ppm', points: '0,22 20,21 40,19 60,17 80,15 100,13 120,11' },
              ].map(({ label, value, points }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-16 shrink-0">
                    <div className="text-xs text-[#A0A0A0]">{label}</div>
                    <div className="text-xs font-mono text-[#34D399]">{value}</div>
                  </div>
                  <div className="flex-1">
                    <svg viewBox="0 0 120 24" className="w-full h-5" role="img">
                      <polyline
                        points={points}
                        stroke="#59D3FF"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="text-[#34D399] text-[10px]">●</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Three smaller cards */}
        <motion.div
          variants={gridContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Market */}
          <motion.div
            variants={gridItem}
            className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-6 hover:border-[rgba(255,255,255,0.15)] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-[rgba(89,211,255,0.08)] flex items-center justify-center mb-4">
              <ShoppingBag size={20} className="text-[#59D3FF]" />
            </div>
            <h3 className="text-white font-semibold mb-2">Mercado en Tiempo Real</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed mb-4">
              Compara precios de múltiples tiendas especializadas. Ve el mejor precio antes de comprar, no después.
            </p>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3 space-y-1.5" aria-hidden="true">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#59D3FF]">89,99 €</span>
                <span className="text-[#666]">Tienda A</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#A0A0A0]">97,50 €</span>
                <span className="text-[#666]">Tienda B</span>
              </div>
            </div>
          </motion.div>

          {/* AI */}
          <motion.div
            variants={gridItem}
            className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-6 hover:border-[rgba(255,255,255,0.15)] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-[rgba(89,211,255,0.08)] flex items-center justify-center mb-4">
              <Bot size={20} className="text-[#59D3FF]" />
            </div>
            <h3 className="text-white font-semibold mb-2">Asesor IA de Arrecife</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Impulsado por Llama 3.3 70B. Pregunta cualquier cosa sobre tu acuario —
              compatibilidad, dosificación, equipos.
            </p>
          </motion.div>

          {/* Calculators */}
          <motion.div
            variants={gridItem}
            className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-6 hover:border-[rgba(255,255,255,0.15)] transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-[rgba(89,211,255,0.08)] flex items-center justify-center mb-4">
              <Calculator size={20} className="text-[#59D3FF]" />
            </div>
            <h3 className="text-white font-semibold mb-2">Calculadoras Inteligentes</h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed">
              Estimación de costes energéticos y dosificación de precisión. Sabe cuánto cuesta
              tu arrecife antes de que llegue la factura.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Section 3: DashboardPreview ────────────────────────────────────────────
function DashboardPreview() {
  return (
    <section className="bg-black py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <p className="text-xs font-mono tracking-widest uppercase text-[#59D3FF] mb-4">
            Vista Previa del Producto
          </p>
          <h2 className="text-3xl font-bold text-white mb-4">Tu arrecife completo, en un panel.</h2>
          <p className="text-[#A0A0A0] max-w-md mx-auto">
            Todo lo que importa de tu acuario de un vistazo. Parámetros, animales, equipos —
            organizado, no abrumador.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.15)}
          className="relative border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden shadow-[0_-1px_0_rgba(89,211,255,0.15),0_0_60px_rgba(89,211,255,0.04)]"
        >
          <div className="bg-[#080808] p-5">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[rgba(255,255,255,0.06)]">
              <span className="text-xs font-bold tracking-widest text-white">THALASSA</span>
              <div className="w-7 h-7 rounded-md bg-[rgba(89,211,255,0.08)] flex items-center justify-center">
                <Bot size={14} className="text-[#59D3FF]" />
              </div>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { label: 'Acuarios', value: '3' },
                { label: 'Animales', value: '24' },
                { label: 'Equipos', value: '11' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-black border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 flex items-center gap-2"
                >
                  <span className="text-xs font-mono font-medium text-[#59D3FF]">{s.value}</span>
                  <span className="text-xs text-[#A0A0A0]">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Aquarium cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1 — all healthy */}
              <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">Arrecife Principal 250L</span>
                  <span className="text-[10px] font-mono text-[#59D3FF] border border-[rgba(89,211,255,0.25)] rounded px-2 py-0.5">
                    ARRECIFE
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { p: 'pH', v: '8,2', warn: false },
                    { p: 'Alc.', v: '9,1 dKH', warn: false },
                    { p: 'NO₃', v: '5 ppm', warn: false },
                  ].map(({ p, v, warn }) => (
                    <div key={p} className="flex items-center justify-between text-xs">
                      <span className="text-[#666]">{p}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[#A0A0A0]">{v}</span>
                        <span className={`text-[10px] ${warn ? 'text-[#FBBF24]' : 'text-[#34D399]'}`}>●</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2 — warning state */}
              <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">Nano Laguna 60L</span>
                  <span className="text-[10px] font-mono text-[#A0A0A0] border border-[rgba(255,255,255,0.12)] rounded px-2 py-0.5">
                    MIXTO
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { p: 'pH', v: '8,0', warn: false },
                    { p: 'Alc.', v: '8,4 dKH', warn: true },
                    { p: 'NO₃', v: '12 ppm', warn: true },
                  ].map(({ p, v, warn }) => (
                    <div key={p} className="flex items-center justify-between text-xs">
                      <span className="text-[#666]">{p}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono ${warn ? 'text-[#FBBF24]' : 'text-[#A0A0A0]'}`}>{v}</span>
                        <span className={`text-[10px] ${warn ? 'text-[#FBBF24]' : 'text-[#34D399]'}`}>●</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Fade overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}

// ── Section 4: ThreePillars ────────────────────────────────────────────────
const pillars = [
  {
    icon: <Shield size={20} className="text-[#34D399]" />,
    iconBg: 'bg-[rgba(52,211,153,0.08)]',
    borderHover: 'hover:border-[rgba(52,211,153,0.30)]',
    title: 'Tus animales viven más.',
    body: 'Comprobaciones de compatibilidad, alertas de parámetros y una IA que detecta problemas antes que tú. Menos errores, menos pérdidas.',
    proof: '3.500+ especies · datos de compatibilidad',
    proofColor: 'text-[#34D399]',
  },
  {
    icon: <Tag size={20} className="text-[#59D3FF]" />,
    iconBg: 'bg-[rgba(89,211,255,0.08)]',
    borderHover: 'hover:border-[rgba(89,211,255,0.30)]',
    title: 'Deja de pagar de más.',
    body: 'Nuestro sistema compara precios en tiempo real de tiendas especializadas. Ves el mejor precio antes de comprar, no después.',
    proof: 'Tienda A · Tienda B · datos en vivo',
    proofColor: 'text-[#59D3FF]',
  },
  {
    icon: <Zap size={20} className="text-[#FBBF24]" />,
    iconBg: 'bg-[rgba(251,191,36,0.08)]',
    borderHover: 'hover:border-[rgba(251,191,36,0.30)]',
    title: 'Sabe lo que cuesta tu arrecife.',
    body: 'Introduce el consumo de tu equipo y tu tarifa eléctrica y obtén una previsión mensual de costes. Sin sorpresas en la factura.',
    proof: 'Calculadora kWh · estimaciones mensuales',
    proofColor: 'text-[#FBBF24]',
  },
];

function ThreePillars() {
  return (
    <section id="about" className="bg-black border-t border-[rgba(255,255,255,0.06)] py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-4">¿Por qué es diferente?</h2>
          <p className="text-[#A0A0A0] max-w-md mx-auto">
            Thalassa no es un tracker de parámetros más. Está construido sobre tres pilares que
            cambian cómo cuidas tu arrecife.
          </p>
        </motion.div>

        <motion.div
          variants={gridContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {pillars.map((p) => (
            <motion.div
              key={p.title}
              variants={gridItem}
              className={`flex flex-col bg-black border border-[rgba(255,255,255,0.08)] rounded-xl p-7 ${p.borderHover} transition-all duration-200`}
            >
              <div className={`w-10 h-10 rounded-lg ${p.iconBg} flex items-center justify-center mb-5`}>
                {p.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">{p.title}</h3>
              <p className="text-sm text-[#A0A0A0] leading-relaxed flex-1">{p.body}</p>
              <div className="border-t border-[rgba(255,255,255,0.06)] mt-6 pt-4">
                <span className={`text-xs font-mono ${p.proofColor}`}>{p.proof}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Section 5: AISpotlight ─────────────────────────────────────────────────
function AISpotlight() {
  return (
    <section className="bg-black border-t border-[rgba(255,255,255,0.06)] py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-mono tracking-widest uppercase text-[#59D3FF] mb-5">
              Asesor IA · Impulsado por Llama 3.3 70B
            </p>
            <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
              El experto que siempre está disponible.
            </h2>
            <p className="text-[#A0A0A0] leading-relaxed mb-6">
              Tu asesor IA conoce tu acuario — su volumen, parámetros actuales y lista de animales.
              Ya sea que planifiques un nuevo coral, diagnostiques una variación de parámetros o
              calcules una dosificación, obtienes una respuesta específica, no genérica.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Compatibilidad de animales entre 3.500+ especies',
                'Análisis de tendencias de parámetros en lenguaje claro',
                'Recomendaciones de dosificación y equipos',
              ].map((item) => (
                <li
                  key={item}
                  className="border-l-2 border-[rgba(89,211,255,0.30)] pl-3 text-sm text-[#A0A0A0] leading-relaxed"
                >
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button variant="premium" size="md">Pruébalo gratis</Button>
            </Link>
          </motion.div>

          {/* Mock chat panel */}
          <motion.div {...fadeUp(0.15)} aria-hidden="true">
            <div className="bg-[#080808] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-2">
                <Bot size={14} className="text-[#59D3FF]" />
                <span className="text-sm font-medium text-white">Asesor IA</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                  <span className="text-xs text-[#34D399]">en línea</span>
                </span>
              </div>

              {/* Bubbles */}
              <div className="p-4 space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-[rgba(89,211,255,0.08)] border border-[rgba(89,211,255,0.15)] rounded-xl rounded-tr-sm px-4 py-2.5 text-sm text-white">
                    ¿Es seguro un Ángel Llama con mi stocking actual?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[90%] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl rounded-tl-sm px-4 py-2.5 text-sm text-[#A0A0A0] leading-relaxed">
                    En base a tu{' '}
                    <span className="text-[#59D3FF]">Arrecife Principal 250L</span>
                    , el Ángel Llama es compatible. Vigila la agresividad hacia el Dottyback
                    Orquídea — introdúcelo el último.
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-[rgba(89,211,255,0.08)] border border-[rgba(89,211,255,0.15)] rounded-xl rounded-tr-sm px-4 py-2.5 text-sm text-white">
                    ¿Cuánto me cuesta el equipo al mes?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[90%] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl rounded-tl-sm px-4 py-3">
                    <div className="text-[#59D3FF] font-mono text-base font-medium mb-1">
                      ~42,30 €/mes
                    </div>
                    <div className="text-[#666] text-xs">
                      Basado en 385 W · 0,18 €/kWh · 30 días
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Soft plan pre-sell */}
        <motion.div
          {...fadeUp(0.25)}
          className="mt-14 pt-6 border-t border-[rgba(255,255,255,0.06)] text-center"
        >
          <p className="text-sm font-mono text-[#A0A0A0]">
            Gratis: 5 conversaciones/día ·{' '}
            <span className="text-[#59D3FF]">ReefMaster: ilimitado</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────────────────────
function Pricing() {
  const navigate = useNavigate();
  const isLoggedIn = !!useAuthStore((s) => s.user);

  const handleReefMaster = () => {
    navigate(isLoggedIn ? '/dashboard/checkout' : '/register?next=/dashboard/checkout');
  };

  return (
    <section id="pricing" className="bg-black py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
        </motion.div>

        <motion.div
          variants={gridContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto"
        >
          {/* FREE */}
          <motion.div
            variants={gridItem}
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
            variants={gridItem}
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
            <Button variant="primary" size="md" className="w-full" onClick={handleReefMaster}>
              Go ReefMaster
            </Button>
          </motion.div>
        </motion.div>
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
      <MetricsStrip />
      <FeatureShowcase />
      <DashboardPreview />
      <ThreePillars />
      <AISpotlight />
      <Pricing />
      <CTAFinal />
      <Footer />
    </>
  );
}
