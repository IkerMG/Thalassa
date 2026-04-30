import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureException: (e: Error) => void } }).Sentry) {
      (window as unknown as { Sentry: { captureException: (e: Error) => void } }).Sentry.captureException(error);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center flex flex-col items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-[#1A0A0A] flex items-center justify-center">
            <span className="text-2xl">⚠</span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-lg font-semibold">Algo salió mal</h1>
            <p className="text-[#A0A0A0] text-sm leading-relaxed">
              Se produjo un error inesperado. Puedes intentar recargar la página
              o volver al inicio.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 rounded border border-[rgba(255,255,255,0.12)] text-white text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
            >
              Recargar
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="flex-1 px-4 py-2 rounded bg-[#59D3FF] text-[#0A0F1E] text-sm font-medium hover:bg-[#7DDEFF] transition-colors cursor-pointer"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }
}
