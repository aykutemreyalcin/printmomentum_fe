import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'

type ToastTone = 'success' | 'error'

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState<ToastTone>('success')

  const showToast = useCallback((next: string, nextTone: ToastTone = 'success') => {
    setMessage(next)
    setTone(nextTone)
    setOpen(true)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={tone === 'error' ? 'error' : 'success'}
          variant="filled"
          onClose={() => setOpen(false)}
          role={tone === 'error' ? 'alert' : 'status'}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
