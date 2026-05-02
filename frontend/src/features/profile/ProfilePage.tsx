import { User, Crown, Mail, Globe, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile } from '../../hooks/mutations/useUpdateProfile';

const LOCALES = ['en', 'de', 'es'] as const;
type Locale = (typeof LOCALES)[number];

export default function ProfilePage() {
  const { t, i18n } = useTranslation('profile');
  const user = useAuthStore((s) => s.user);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

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

      {/* Settings — coming soon */}
      <div className="bg-black border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
          <Settings size={20} className="text-[#555]" />
        </div>
        <p className="text-[#555] text-sm">{t('settings.comingSoonText')}</p>
        <span className="text-[10px] font-mono tracking-widest text-[#59D3FF] border border-[rgba(89,211,255,0.25)] rounded-full px-3 py-1">
          {t('comingSoon', { ns: 'common' })}
        </span>
      </div>
    </div>
  );
}
