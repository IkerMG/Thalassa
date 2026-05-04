import confetti from 'canvas-confetti';

export function fireUpgradeConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#0ea5e9', '#06b6d4', '#22d3ee', '#7dd3fc', '#ffffff'],
  });
}
