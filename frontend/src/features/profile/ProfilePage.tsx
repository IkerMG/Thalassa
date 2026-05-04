import { useEffect } from 'react';
import { User, Crown, Mail, Globe, Settings, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile } from '../../hooks/mutations/useUpdateProfile';
import { useSimulateUpgrade } from '../../hooks/mutations/useSimulateUpgrade';
import { useUserProfile } from '../../hooks/queries/useUserProfile';
import { toast } from '../../lib/toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// ── Settings form schema ──────────────────────────────────────────────────────

const settingsSchema = z.object({
  electricityPriceKwh: z.coerce
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0.01, 'Mínimo €0.01/kWh')
    .max(9.99, 'Máximo €9.99/kWh')
    .nullable()
    .optional(),
  temperatureUnit: z.enum(['C', 'F']).default('C'),
  volumeUnit: z.enum(['L', 'GAL']).default('L'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

// ── ToggleGroup ───────────────────────────────────────────────────────────────

function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
  disabled,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={[
            'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
            value === opt.value
              ? 'bg-[rgba(89,211,255,0.12)] text-[#59D3FF] border border-[rgba(89,211,255,0.35)]'
              : 'text-[#666] border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.20)]',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Settings form ─────────────────────────────────────────────────────────────

function SettingsForm() {
  const { data: profile, isLoading } = useUserProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const updateUser = useAuthStore((s) => s.updateUser);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      electricityPriceKwh: undefined,
      temperatureUnit: 'C',
      volumeUnit: 'L',
    },
  });

  // Sync form with fetched profile
  useEffect(() => {
    if (!profile) return;
    reset({
      electricityPriceKwh: profile.electricityPriceKwh ?? undefined,
      temperatureUnit: (profile.temperatureUnit as 'C' | 'F') ?? 'C',
      volumeUnit: (profile.volumeUnit as 'L' | 'GAL') ?? 'L',
    });
  }, [profile, reset]);

  const tempUnit = watch('temperatureUnit');
  const volUnit = watch('volumeUnit');

  const onSubmit = (values: SettingsFormValues) => {
    updateProfile(
      {
        electricityPriceKwh: values.electricityPriceKwh ?? null,
        temperatureUnit: values.temperatureUnit,
        volumeUnit: values.volumeUnit,
      },
      {
        onSuccess: () => {
          toast.success('Configuración guardada.');
          updateUser({
            kwhPrice: values.electricityPriceKwh ?? undefined,
            temperatureUnit: values.temperatureUnit,
            volumeUnit: values.volumeUnit,
          });
        },
        onError: () => {
          toast.error('No se pudo guardar la configuración.');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-4 w-40 bg-[rgba(255,255,255,0.06)] rounded" />
        <div className="h-12 bg-[rgba(255,255,255,0.04)] rounded-lg" />
        <div className="h-4 w-32 bg-[rgba(255,255,255,0.06)] rounded" />
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-[rgba(255,255,255,0.04)] rounded-lg" />
          <div className="flex-1 h-10 bg-[rgba(255,255,255,0.04)] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 mb-0.5">
          <Zap size={13} className="text-[#59D3FF]" />
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            Precio electricidad (€/kWh)
          </label>
        </div>
        <Input
          type="number"
          step="0.0001"
          min={0.01}
          max={9.99}
          placeholder="Ej. 0.2800"
          {...register('electricityPriceKwh')}
          error={errors.electricityPriceKwh?.message}
        />
        <p className="text-[#444] text-[11px]">
          Se usa para calcular el coste mensual de los equipos.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
          Temperatura
        </label>
        <ToggleGroup
          value={tempUnit}
          onChange={(v) => setValue('temperatureUnit', v, { shouldDirty: true })}
          options={[
            { value: 'C', label: 'Celsius (°C)' },
            { value: 'F', label: 'Fahrenheit (°F)' },
          ]}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
          Volumen
        </label>
        <ToggleGroup
          value={volUnit}
          onChange={(v) => setValue('volumeUnit', v, { shouldDirty: true })}
          options={[
            { value: 'L', label: 'Litros (L)' },
            { value: 'GAL', label: 'Galones (gal)' },
          ]}
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isPending || !isDirty}
        >
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}

// ── Language selectors ────────────────────────────────────────────────────────

const LOCALES = ['en', 'de', 'es'] as const;
type Locale = (typeof LOCALES)[number];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { t, i18n } = useTranslation('profile');
  const user = useAuthStore((s) => s.user);
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: simulateUpgrade, isPending: isUpgrading } = useSimulateUpgrade();

  if (!user) return null;

  const isReefMaster = user.plan === 'REEFMASTER';

  const handleLocaleChange = (locale: Locale) => {
    i18n.changeLanguage(locale);
    updateProfile({ locale });
  };

  return (
    <div className="min-h-full p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">{t('title')}</h1>

      {/* User card */}
      <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[rgba(89,211,255,0.08)] border border-[rgba(89,211,255,0.20)] flex items-center justify-center flex-shrink-0">
            <User size={24} className="text-[#59D3FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-lg leading-tight">{user.username}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail size={12} className="text-[#555]" />
              <p className="text-[#555] text-sm truncate">{user.email}</p>
            </div>
          </div>
          <span
            className={[
              'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border',
              isReefMaster
                ? 'text-[#59D3FF] border-[rgba(89,211,255,0.35)] bg-[rgba(89,211,255,0.08)]'
                : 'text-[#666] border-[rgba(255,255,255,0.10)]',
            ].join(' ')}
          >
            {isReefMaster && <Crown size={11} />}
            {user.plan}
          </span>
        </div>

        {/* Reef Master upgrade CTA — only shown on FREE plan */}
        {!isReefMaster && (
          <div className="mt-5 pt-5 border-t border-[rgba(255,255,255,0.06)]">
            <button
              disabled={isUpgrading}
              onClick={() =>
                simulateUpgrade(undefined, {
                  onSuccess: () => toast.success(t('plan.upgradeSuccess')),
                  onError:   () => toast.error('Error al actualizar el plan. Inténtalo de nuevo.'),
                })
              }
              className="
                w-full flex items-center justify-center gap-2
                px-5 py-3 rounded-xl
                bg-gradient-to-r from-amber-400 to-orange-500
                text-white font-bold text-sm tracking-wide
                shadow-lg shadow-orange-500/30
                hover:brightness-110 hover:shadow-orange-500/50
                active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                transition-all duration-150 cursor-pointer
              "
            >
              <Crown size={16} />
              {isUpgrading ? 'Actualizando…' : t('plan.upgradeButton')}
            </button>
          </div>
        )}
      </div>

      {/* Language selector */}
      <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <Globe size={16} className="text-[#59D3FF]" />
          <span className="text-sm font-medium text-white">{t('language.label')}</span>
        </div>
        <div className="flex gap-2">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              disabled={isPending}
              className={[
                'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                i18n.language === locale
                  ? 'bg-[rgba(89,211,255,0.12)] text-[#59D3FF] border border-[rgba(89,211,255,0.35)]'
                  : 'text-[#666] border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.20)]',
                isPending ? 'opacity-50' : '',
              ].join(' ')}
            >
              {t(`language.${locale}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Settings size={16} className="text-[#59D3FF]" />
          <span className="text-sm font-medium text-white">{t('settings.title')}</span>
        </div>
        <SettingsForm />
      </div>
    </div>
  );
}
