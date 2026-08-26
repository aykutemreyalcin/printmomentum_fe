import { CopyButton } from './CopyButton'
import { useI18n } from '../i18n/I18nProvider'
import './TagPack.css'

type Props = {
  tags: string[]
}

export function TagPack({ tags }: Props) {
  const { t } = useI18n()

  if (tags.length === 0) {
    return <p className="label">{t('tags.none')}</p>
  }

  return (
    <div className="tag-pack">
      <div className="tag-pack-head">
        <span className="label">{t('tags.count', { count: tags.length })}</span>
        <CopyButton text={tags.join(', ')} label={t('copy.tagsAll')} />
      </div>
      <ul className="tag-pack-list">
        {tags.map((tag) => (
          <li key={tag} className="tag-chip">
            <span>{tag}</span>
            <CopyButton text={tag} label={t('copy.tag', { tag })} />
          </li>
        ))}
      </ul>
    </div>
  )
}
