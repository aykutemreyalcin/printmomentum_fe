import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Props = {
  children: ReactNode
  className?: string
  delay?: number
}

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(() => reducedMotion() || typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const node = ref.current
    if (!node || seen) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [seen])

  return (
    <div
      ref={ref}
      className={['reveal', seen && 'is-in', className].filter(Boolean).join(' ')}
      style={{ '--d': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}
