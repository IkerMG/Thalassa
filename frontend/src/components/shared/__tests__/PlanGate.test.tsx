import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PlanGate from '../PlanGate';
import { useAuthStore } from '../../../store/authStore';

const baseUser = {
  id: 1,
  email: 'test@thalassa.com',
  username: 'Test',
};

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ token: null, refreshToken: null, user: null, isAuthenticated: false });
});

function renderGate(plan: 'FREE' | 'REEFMASTER') {
  useAuthStore.setState({ user: { ...baseUser, plan }, isAuthenticated: plan === 'REEFMASTER' });
  return render(
    <MemoryRouter>
      <PlanGate feature="calculator_energy">
        <div>Premium Content</div>
      </PlanGate>
    </MemoryRouter>
  );
}

describe('PlanGate — FREE plan', () => {
  it('shows the feature label and upgrade CTA', () => {
    renderGate('FREE');
    expect(screen.getByText('Energy Calculator')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /upgrade to reefmaster/i })).toBeInTheDocument();
  });

  it('renders children in blurred/locked state (still in DOM)', () => {
    renderGate('FREE');
    expect(screen.getByText('Premium Content')).toBeInTheDocument();
  });
});

describe('PlanGate — REEFMASTER plan', () => {
  it('renders children directly without lock overlay', () => {
    renderGate('REEFMASTER');
    expect(screen.getByText('Premium Content')).toBeInTheDocument();
  });

  it('does not show the upgrade CTA', () => {
    renderGate('REEFMASTER');
    expect(screen.queryByText(/upgrade to reefmaster/i)).not.toBeInTheDocument();
  });
});
