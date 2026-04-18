import { motion } from 'framer-motion';
import { Fish, ShoppingBag, Waves, Zap } from 'lucide-react';
import OceanBackground from './components/auth/OceanBackground';
import Button from './components/ui/Button';

// Typed as a 4-tuple so Framer Motion's Easing type accepts it
const spring = [0.16, 1, 0.3, 1] as [number, number, number, number];

function fadeUp(delay = 0) {
  return {
    initial:    { opacity: 0, y: 28 },
    animate:    { opacity: 1, y: 0  },
    transition: { duration: 0.6, ease: spring, delay },
  } as const;
}

const features = [
  {
    Icon:        Fish,
    iconClass:   'text-cyan',
    title:       'Compatibilidad Reef Safe',
    description: 'Verifica al instante si tus especímenes conviven en armonía. Alertas automáticas de incompatibilidad.',
  },
  {
    Icon:        Zap,
    iconClass:   'text-coral',
    title:       'Calculadora Energética',
    description: 'Calcula el coste mensual exacto de tu acuario con desglose por equipo y precio del kWh.',
  },
  {
    Icon:        ShoppingBag,
    iconClass:   'text-reef-safe',
    title:       'Comparador de Precios',
    description: 'Busca productos en las principales tiendas de acuariofilia y encuentra el mejor precio.',
  },
] as const;

export default function App() {
  return (
    <div className="relative min-h-screen bg-ocean-900 overflow-hidden font-body">
      <OceanBackground />

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Waves className="w-6 h-6 text-cyan" />
          <span className="font-display text-xl font-bold text-cyan tracking-tight">
            Thalassa
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">Iniciar Sesión</Button>
          <Button variant="primary" size="sm">Registrarse</Button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16">

        <motion.div {...fadeUp(0)}>
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-xs font-mono uppercase tracking-widest">
            Gestión Avanzada · Sprint 3
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="font-display text-5xl sm:text-7xl font-extrabold text-text-primary leading-tight max-w-3xl"
        >
          Tu acuario.{' '}
          <span className="text-cyan">Bajo control.</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="mt-6 text-text-secondary text-lg max-w-xl leading-relaxed"
        >
          Gestiona tu acuario marino con inteligencia. Monitoriza compatibilidades
          reef-safe, controla el consumo energético y compara precios en tiempo real.
        </motion.p>

        <motion.div
          {...fadeUp(0.3)}
          className="flex flex-wrap items-center justify-center gap-4 mt-8"
        >
          <Button variant="primary" size="lg">Empezar gratis</Button>
          <Button variant="ghost"   size="lg">Ver demo</Button>
        </motion.div>

        <motion.div
          {...fadeUp(0.4)}
          className="flex items-center gap-3 mt-8"
        >
          <span className="px-3 py-1 rounded-full bg-ocean-700/60 border border-text-muted/30 text-text-secondary text-xs font-mono">
            FREE · 1 acuario
          </span>
          <span className="text-text-muted text-xs">→</span>
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan/20 to-coral/20 border border-cyan/30 text-cyan text-xs font-mono">
            REEFMASTER · Sin límites
          </span>
        </motion.div>
      </section>

      {/* ── Feature cards ───────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {features.map(({ Icon, iconClass, title, description }, i) => (
            <motion.div
              key={title}
              {...fadeUp(0.2 + i * 0.1)}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 24 } }}
              className="rounded-glass p-6 border border-cyan/15 bg-ocean-700/60 backdrop-blur-[20px] shadow-card hover:shadow-glow hover:border-cyan/30 transition-shadow duration-300"
            >
              <Icon className={`w-8 h-8 ${iconClass} mb-4`} />
              <h3 className="font-display font-semibold text-text-primary mb-2">{title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
