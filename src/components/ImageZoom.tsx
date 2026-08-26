import { useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import './ImageZoom.css'

type Props = {
  src: string
  alt?: string
  zoomScale?: number
}

export function ImageZoom({ src, alt = '', zoomScale = 2 }: Props) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const box = containerRef.current?.getBoundingClientRect()
    if (!box) return
    setPosition({
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    })
  }

  const preview: CSSProperties = {
    backgroundImage: `url(${src})`,
    backgroundSize: `${zoomScale * 100}%`,
    backgroundPosition: `${position.x}% ${position.y}%`,
  }

  return (
    <>
      <div
        ref={containerRef}
        className="image-zoom"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onMouseMove={onMove}
      >
        <img src={src} alt={alt} width={48} height={48} />
      </div>
      {open
        ? createPortal(<div className="image-zoom-pop" style={preview} />, document.body)
        : null}
    </>
  )
}
