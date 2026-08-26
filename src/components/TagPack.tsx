import { CopyButton } from './CopyButton'
import './TagPack.css'

type Props = {
  tags: string[]
}

export function TagPack({ tags }: Props) {
  if (tags.length === 0) {
    return <p className="label">No tags on this listing.</p>
  }

  return (
    <div className="tag-pack">
      <div className="tag-pack-head">
        <span className="label">{tags.length} of 13 tags</span>
        <CopyButton text={tags.join(', ')} label="Copy all tags" />
      </div>
      <ul className="tag-pack-list">
        {tags.map((tag) => (
          <li key={tag} className="tag-chip">
            <span>{tag}</span>
            <CopyButton text={tag} label={`Copy tag ${tag}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
