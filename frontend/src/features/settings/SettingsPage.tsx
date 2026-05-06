import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Zap, Globe, Lock, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile } from '../../hooks/mutations/useUpdateProfile';
import { useChangePassword } from '../../hooks/mutations/useChangePassword';
import { useUserProfile } from '../../hooks/queries/useUserProfile';
import { toast } from '../../lib/toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ImageUploader from '../../components/shared/ImageUploader';

// ── Schemas ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  displayName: z.string().max(50).optional(),
});

const preferencesSchema = z.object({
  electricityPriceKwh: z.coerce
    .number({ invalid_type_error: 'Debe ser un número' })
    .min(0.01, 'Mínimo €0.01/kWh')
    .max(9.99, 'Máximo €9.99/kWh')
    .nullable()
    .optional(),
  temperatureUnit: z.enum(['C', 'F']).default('C'),
  volumeUnit: z.enum(['L', 'GAL']).default('L'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Campo requerido'),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres').max(64),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PreferencesFormValues = z.infer<typeof preferencesSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

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

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <Icon size={16} className="text-[#59D3FF]" />
        <span className="text-sm font-medium text-white uppercase tracking-wide">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ── Profile section ───────────────────────────────────────────────────────────

function ProfileSection() {
  const { t } = useTranslation('settings');
  const { data: profile } = useUserProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: updateAvatar, isPending: isAvatarPending } = useUpdateProfile();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } =
    useForm<ProfileFormValues>({
      resolver: zodResolver(profileSchema),
    });

  useEffect(() => {
    if (profile?.displayName) reset({ displayName: profile.displayName });
    setAvatarUrl(profile?.avatarUrl ?? null);
  }, [profile, reset]);

  const handleAvatarChange = useCallback((url: string | null) => {
    setAvatarUrl(url);
    updateAvatar(
      { avatarUrl: url ?? '' },
      {
        onSuccess: (updated) => {
          toast.success('Avatar actualizado');
          updateUser({ avatarUrl: updated.avatarUrl ?? null });
        },
        onError: () => toast.error('No se pudo actualizar el avatar'),
      }
    );
  }, [updateAvatar, updateUser]);

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile(
      { displayName: values.displayName ?? undefined },
      {
        onSuccess: (updated) => {
          toast.success(t('profile.saveSuccess'));
          if (updated.displayName) updateUser({ username: updated.displayName });
        },
        onError: () => toast.error(t('profile.saveError')),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <ImageUploader
        value={avatarUrl}
        onChange={handleAvatarChange}
        folder="avatars"
        label="Foto de perfil"
      />
      {isAvatarPending && (
        <p className="text-xs text-white/40">Guardando avatar…</p>
      )}
      <Input
        label={t('profile.displayName')}
        placeholder={t('profile.displayNamePlaceholder')}
        {...register('displayName')}
        error={errors.displayName?.message}
      />
      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="md" disabled={isPending || !isDirty}>
          {isPending ? t('profile.saving') : t('profile.save')}
        </Button>
      </div>
    </form>
  );
}

// ── Preferences section ───────────────────────────────────────────────────────

const LOCALES = ['en', 'de', 'es'] as const;
type Locale = (typeof LOCALES)[number];

function PreferencesSection() {
  const { t, i18n } = useTranslation('settings');
  const { data: profile } = useUserProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const updateUser = useAuthStore((s) => s.updateUser);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isDirty } } =
    useForm<PreferencesFormValues>({
      resolver: zodResolver(preferencesSchema),
      defaultValues: { temperatureUnit: 'C', volumeUnit: 'L' },
    });

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

  const handleLocaleChange = (locale: Locale) => {
    i18n.changeLanguage(locale);
    updateProfile({ locale });
  };

  const onSubmit = (values: PreferencesFormValues) => {
    updateProfile(
      {
        electricityPriceKwh: values.electricityPriceKwh ?? null,
        temperatureUnit: values.temperatureUnit,
        volumeUnit: values.volumeUnit,
      },
      {
        onSuccess: () => {
          toast.success(t('profile.saveSuccess'));
          updateUser({
            kwhPrice: values.electricityPriceKwh ?? undefined,
            temperatureUnit: values.temperatureUnit,
            volumeUnit: values.volumeUnit,
          });
        },
        onError: () => toast.error(t('profile.saveError')),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 mb-0.5">
          <Zap size={13} className="text-[#59D3FF]" />
          <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
            {t('preferences.electricityPrice')}
          </label>
        </div>
        <Input
          type="number"
          step="0.0001"
          min={0.01}
          max={9.99}
          placeholder={t('preferences.electricityPricePlaceholder')}
          {...register('electricityPriceKwh')}
          error={errors.electricityPriceKwh?.message}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
          {t('preferences.temperatureUnit')}
        </label>
        <ToggleGroup
          value={tempUnit}
          onChange={(v) => setValue('temperatureUnit', v, { shouldDirty: true })}
          options={[{ value: 'C', label: 'Celsius (°C)' }, { value: 'F', label: 'Fahrenheit (°F)' }]}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
          {t('preferences.volumeUnit')}
        </label>
        <ToggleGroup
          value={volUnit}
          onChange={(v) => setValue('volumeUnit', v, { shouldDirty: true })}
          options={[{ value: 'L', label: 'Litros (L)' }, { value: 'GAL', label: 'Galones (gal)' }]}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wide">
          {t('preferences.language')}
        </label>
        <div className="flex gap-2">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => handleLocaleChange(locale)}
              disabled={isPending}
              className={[
                'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                i18n.language === locale
                  ? 'bg-[rgba(89,211,255,0.12)] text-[#59D3FF] border border-[rgba(89,211,255,0.35)]'
                  : 'text-[#666] border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.20)]',
                isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
              {locale.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" variant="primary" size="md" disabled={isPending || !isDirty}>
          {isPending ? t('profile.saving') : t('profile.save')}
        </Button>
      </div>
    </form>
  );
}

// ── Security section ──────────────────────────────────────────────────────────

function SecuritySection() {
  const { t } = useTranslation('settings');
  const { mutate: changePassword, isPending } = useChangePassword();
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, reset, setError, formState: { errors } } =
    useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = (values: PasswordFormValues) => {
    setShowSuccess(false);
    changePassword(values, {
      onSuccess: () => {
        reset();
        setShowSuccess(true);
        toast.success(t('security.changeSuccess'));
      },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        if (message === 'INVALID_CURRENT_PASSWORD') {
          setError('currentPassword', { message: t('security.changeError') });
        } else {
          toast.error(t('security.changeErrorGeneric'));
        }
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label={t('security.currentPassword')}
        type="password"
        {...register('currentPassword')}
        error={errors.currentPassword?.message}
      />
      <Input
        label={t('security.newPassword')}
        type="password"
        placeholder={t('security.newPasswordPlaceholder')}
        {...register('newPassword')}
        error={errors.newPassword?.message}
      />
      {showSuccess && (
        <p className="text-xs text-emerald-400">{t('security.changeSuccess')}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="md" disabled={isPending}>
          {isPending ? t('security.changing') : t('security.changePassword')}
        </Button>
      </div>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();

  return (
    <div className="min-h-full p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="text-[#555] hover:text-white transition-colors cursor-pointer"
          aria-label="Volver al perfil"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings size={22} className="text-[#59D3FF]" />
            {t('title')}
          </h1>
          <p className="text-sm text-[#A0A0A0] mt-0.5">{t('subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <Section icon={UserIcon} title={t('profile.sectionTitle')}>
          <ProfileSection />
        </Section>

        <Section icon={Globe} title={t('preferences.sectionTitle')}>
          <PreferencesSection />
        </Section>

        <Section icon={Lock} title={t('security.sectionTitle')}>
          <SecuritySection />
        </Section>
      </div>
    </div>
  );
}
