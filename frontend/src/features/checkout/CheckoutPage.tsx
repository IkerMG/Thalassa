import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, CheckCircle2, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useSimulateUpgrade } from '../../hooks/mutations/useSimulateUpgrade';
import { fireUpgradeConfetti } from '../../lib/confetti';
import Button from '../../components/ui/Button';

// ── Card formatting helpers ───────────────────────────────────────────────────

function formatCardNumber(v: string): string {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(v: string): string {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function isCardNumberValid(v: string): boolean {
  const digits = v.replace(/\D/g, '');
  return digits.length === 16 && !/^0+$/.test(digits);
}

function isExpiryValid(v: string): boolean {
  const m = v.replace(/\D/g, '').slice(0, 4);
  if (m.length < 4) return false;
  const month = parseInt(m.slice(0, 2), 10);
  return month >= 1 && month <= 12;
}

function isCvvValid(v: string): boolean {
  return /^\d{3}$/.test(v);
}

// ── Form types ────────────────────────────────────────────────────────────────

interface CheckoutFormValues {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

// ── Plan summary ──────────────────────────────────────────────────────────────

function PlanSummary() {
  const { t } = useTranslation('checkout');
  const features: string[] = t('plan.features', { returnObjects: true }) as string[];

  return (
    <div className="bg-black border border-[rgba(89,211,255,0.25)] rounded-2xl p-6 shadow-[0_0_30px_rgba(89,211,255,0.06)]">
      <div className="flex items-center gap-2 mb-1">
        <Crown size={16} className="text-[#59D3FF]" />
        <span className="text-sm font-semibold text-[#59D3FF]">{t('plan.name')}</span>
      </div>
      <p className="text-2xl font-bold text-white mb-5">{t('plan.price')}</p>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-[#A0A0A0]">
            <CheckCircle2 size={13} className="text-[#59D3FF] shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Checkout form ─────────────────────────────────────────────────────────────

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation('checkout');
  const { mutate: upgrade, isPending } = useSimulateUpgrade();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const { register, handleSubmit, formState: { errors }, setError } =
    useForm<CheckoutFormValues>({ defaultValues: { cardHolder: '', cvv: '' } });

  const validate = (): boolean => {
    let ok = true;
    if (!isCardNumberValid(cardNumber)) {
      setError('cardNumber', { message: t('form.cardInvalid') });
      ok = false;
    }
    if (!isExpiryValid(expiry)) {
      setError('expiry', { message: t('form.expiryInvalid') });
      ok = false;
    }
    return ok;
  };

  const onSubmit = (values: CheckoutFormValues) => {
    if (!validate()) return;
    if (!isCvvValid(values.cvv)) {
      setError('cvv', { message: t('form.cvvInvalid') });
      return;
    }
    upgrade(undefined, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {/* Card number */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
          {t('form.cardNumber')}
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder={t('form.cardNumberPlaceholder')}
          className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444] outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors font-mono tracking-widest"
        />
        {errors.cardNumber && (
          <p className="text-xs text-red-400 mt-0.5">{errors.cardNumber.message}</p>
        )}
      </div>

      {/* Cardholder */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
          {t('form.cardHolder')}
        </label>
        <input
          type="text"
          placeholder={t('form.cardHolderPlaceholder')}
          {...register('cardHolder', { required: true })}
          className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444] outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors"
        />
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            {t('form.expiry')}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder={t('form.expiryPlaceholder')}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444] outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors font-mono"
          />
          {errors.expiry && (
            <p className="text-xs text-red-400 mt-0.5">{errors.expiry.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            {t('form.cvv')}
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={3}
            placeholder={t('form.cvvPlaceholder')}
            {...register('cvv')}
            className="bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-3 text-sm text-white placeholder-[#444] outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors font-mono"
          />
          {errors.cvv && (
            <p className="text-xs text-red-400 mt-0.5">{errors.cvv.message}</p>
          )}
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-[10px] text-[#444]">
        <Lock size={11} />
        <span>{t('demo')}</span>
      </div>

      <Button type="submit" variant="primary" size="lg" disabled={isPending} className="w-full">
        {isPending ? t('form.submitting') : t('form.submit')}
      </Button>
    </form>
  );
}

// ── Success state ─────────────────────────────────────────────────────────────

function SuccessView() {
  const { t } = useTranslation('checkout');
  const navigate = useNavigate();

  return (
    <div className="text-center flex flex-col items-center gap-5 py-12">
      <div className="w-20 h-20 rounded-full bg-[rgba(89,211,255,0.08)] border border-[rgba(89,211,255,0.25)] flex items-center justify-center">
        <Crown size={32} className="text-[#59D3FF]" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('success.title')}</h2>
        <p className="text-sm text-[#A0A0A0] max-w-xs">{t('success.message')}</p>
      </div>
      <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
        {t('success.cta')}
      </Button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { t } = useTranslation('checkout');
  const [done, setDone] = useState(false);

  const handleSuccess = () => {
    fireUpgradeConfetti();
    setDone(true);
  };

  return (
    <div className="min-h-full p-6 max-w-2xl mx-auto">
      {!done && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Crown size={22} className="text-[#59D3FF]" />
              {t('title')}
            </h1>
            <p className="text-sm text-[#A0A0A0] mt-1">{t('subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <PlanSummary />
            <CheckoutForm onSuccess={handleSuccess} />
          </div>
        </>
      )}
      {done && <SuccessView />}
    </div>
  );
}
