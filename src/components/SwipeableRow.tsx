import { useState, useRef } from 'react'

const REVEAL_WIDTH = 140
const SNAP_THRESHOLD = 48

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

export function SwipeableRow({
  children,
  onEdit,
  onDelete,
}: {
  children: React.ReactNode
  onEdit: () => void
  onDelete: () => void
}) {
  const [offset, setOffset] = useState(0)
  const startX = useRef(0)
  const startOffset = useRef(0)
  const dragging = useRef(false)

  const isOpen = offset < 0

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    startOffset.current = offset
    dragging.current = false
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current
    if (Math.abs(dx) > 5) dragging.current = true
    setOffset(Math.max(-REVEAL_WIDTH, Math.min(0, startOffset.current + dx)))
  }

  function onTouchEnd() {
    dragging.current = false
    setOffset(offset < -SNAP_THRESHOLD ? -REVEAL_WIDTH : 0)
  }

  function close() { setOffset(0) }

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons revealed on swipe-left */}
      <div className="absolute right-0 inset-y-0 flex" style={{ width: REVEAL_WIDTH }}>
        <button
          onClick={() => { close(); onEdit() }}
          className="flex-1 bg-violet-500 active:bg-violet-600 text-white flex flex-col items-center justify-center gap-1"
        >
          <EditIcon />
          <span className="text-xs font-semibold">Sửa</span>
        </button>
        <button
          onClick={() => { close(); onDelete() }}
          className="flex-1 bg-red-500 active:bg-red-600 text-white flex flex-col items-center justify-center gap-1"
        >
          <TrashIcon />
          <span className="text-xs font-semibold">Xoá</span>
        </button>
      </div>

      {/* Sliding content */}
      <div
        className="relative"
        style={{
          backgroundColor: '#f9fafb',
          transform: `translateX(${offset}px)`,
          transition: dragging.current ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
        {/* Transparent overlay captures tap to close when open */}
        {isOpen && <div className="absolute inset-0 z-10" onClick={close} />}
      </div>
    </div>
  )
}
