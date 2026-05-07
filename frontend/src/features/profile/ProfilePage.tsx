import { useNavigate, Link } from 'react-router-dom';
import { User, Crown, Mail, Globe, Settings, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile } from '../../hooks/mutations/useUpdateProfile';
import { useUserProfile } from '../../hooks/queries/useUserProfile';

// ── Language selectors ────────────────────────────────────────────────────────

const LOCALES = ['en', 'de', 'es'] as const;
type Locale = (typeof LOCALES)[number];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { t, i18n } = useTranslation('profile');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useUserProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  if (!user) return null;

  const avatarUrl = profile?.avatarUrl ?? user.avatarUrl ?? null;

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
          <div className="w-14 h-14 rounded-full overflow-hidden bg-[rgba(89,211,255,0.08)] border border-[rgba(89,211,255,0.20)] flex items-center justify-center flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <User size={24} className="text-[#59D3FF]" />
            )}
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
              onClick={() => navigate('/dashboard/checkout')}
              className="
                w-full flex items-center justify-center gap-2
                px-5 py-3 rounded-xl
                bg-gradient-to-r from-amber-400 to-orange-500
                text-white font-bold text-sm tracking-wide
                shadow-lg shadow-orange-500/30
                hover:brightness-110 hover:shadow-orange-500/50
                active:scale-[0.98]
                transition-all duration-150 cursor-pointer
              "
            >
              <Crown size={16} />
              {t('plan.upgradeButton')}
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

      {/* Settings shortcut */}
      <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings size={16} className="text-[#59D3FF]" />
            <span className="text-sm font-medium text-white">{t('settings.title')}</span>
          </div>
          <Link
            to="/dashboard/profile/settings"
            className="flex items-center gap-1.5 text-xs text-[#59D3FF] hover:underline"
          >
            Editar ajustes
            <ArrowRight size={13} />
          </Link>
        </div>
        <p className="text-xs text-[#555] mt-2 ml-7">
          Nombre visible, precio de la electricidad, unidades, idioma, contraseña.
        </p>
      </div>
    </div>
  );
}
