import { Link } from 'react-router'
import { useCompare } from '../compare/CompareProvider'
import { useI18n } from '../i18n/I18nProvider'
import './CompareBar.css'

export function CompareBar() {
  const { ids, clear } = useCompare()
  const { t } = useI18n()

  if (ids.length === 0) {
    return null
  }

  return (
    <div className="compare-bar" role="region" aria-label={t('compare.title')}>
      <p className="label compare-bar-label">{t('compare.bar', { count: ids.length })}</p>
      <div className="compare-bar-actions">
        {ids.length === 2 ? (
          <Link className="compare-bar-open" to="/compare">
            {t('compare.open')}
          </Link>
        ) : (
          <span className="compare-bar-hint">{t('compare.needTwo')}</span>
        )}
        <button type="button" className="compare-bar-clear" onClick={clear}>
          {t('compare.clear')}
        </button>
      </div>
    </div>
  )
}
