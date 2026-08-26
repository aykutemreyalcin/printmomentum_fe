import { Link } from 'react-router'
import { usePageTitle } from '../hooks/usePageTitle'
import { useI18n } from '../i18n/I18nProvider'
import './NotFoundPage.css'

export function NotFoundPage() {
  usePageTitle('title.notFound')
  const { t } = useI18n()
  return (
    <div className="not-found">
      <p className="label">{t('detail.error404')}</p>
      <h2>{t('notFound.copy')}</h2>
      <Link to="/" className="label not-found-back">
        {t('detail.back')}
      </Link>
    </div>
  )
}
