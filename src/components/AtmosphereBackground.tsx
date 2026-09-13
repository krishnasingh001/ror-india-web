import { useEffect, useRef, type CSSProperties } from 'react'

/**
 * Pure white canvas + brand grid with a cursor spotlight (fine pointers only).
 * Falls back to a soft static wash on touch / reduced-motion.
 */
export function AtmosphereBackground() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const el = root

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')

    let raf = 0
    let targetX = window.innerWidth * 0.5
    let targetY = window.innerHeight * 0.22
    let currentX = targetX
    let currentY = targetY
    let running = false

    function setVars(x: number, y: number) {
      el.style.setProperty('--mx', `${x.toFixed(1)}px`)
      el.style.setProperty('--my', `${y.toFixed(1)}px`)
    }

    function tick() {
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12
      setVars(currentX, currentY)

      if (Math.abs(targetX - currentX) > 0.2 || Math.abs(targetY - currentY) > 0.2) {
        raf = requestAnimationFrame(tick)
      } else {
        running = false
        setVars(targetX, targetY)
      }
    }

    function onMove(e: PointerEvent) {
      targetX = e.clientX
      targetY = e.clientY
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    function enableInteractive() {
      window.removeEventListener('pointermove', onMove)

      if (reduceMotion.matches || !finePointer.matches) {
        el.dataset.interactive = 'false'
        setVars(window.innerWidth * 0.5, window.innerHeight * 0.22)
        return
      }

      el.dataset.interactive = 'true'
      window.addEventListener('pointermove', onMove, { passive: true })
    }

    enableInteractive()
    reduceMotion.addEventListener('change', enableInteractive)
    finePointer.addEventListener('change', enableInteractive)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      reduceMotion.removeEventListener('change', enableInteractive)
      finePointer.removeEventListener('change', enableInteractive)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="atmosphere-bg"
      aria-hidden="true"
      data-interactive="false"
      style={
        {
          '--mx': '50%',
          '--my': '22%',
        } as CSSProperties
      }
    >
      <div className="atmosphere-grid" />
      <div className="atmosphere-spotlight" />
    </div>
  )
}
