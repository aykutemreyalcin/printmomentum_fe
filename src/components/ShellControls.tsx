import { useI18n } from '../i18n/I18nProvider'
import { useThemeMode } from '../theme/ThemeModeProvider'
import './ShellControls.css'

export function ShellControls() {
  const { locale, setLocale, t } = useI18n()
  const { mode, toggle } = useThemeMode()

  return (
    <div className="shell-controls">
      <div className="shell-lang" role="group" aria-label={t('prefs.language')}>
        <button type="button" className={locale === 'tr' ? 'is-on' : undefined} onClick={() => setLocale('tr')}>
          TR
        </button>
        <button type="button" className={locale === 'en' ? 'is-on' : undefined} onClick={() => setLocale('en')}>
          EN
        </button>
      </div>
      <button type="button" className="shell-theme" onClick={toggle} aria-label={t('prefs.theme')}>
        {mode === 'dark' ? t('prefs.light') : t('prefs.dark')}
      </button>
    </div>
  )
}
