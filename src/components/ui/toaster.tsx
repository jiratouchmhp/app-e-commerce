'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast, type Toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed right-4 top-4 z-[100] flex max-w-sm flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const isDestructive = toast.variant === 'destructive'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.5 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
      className={cn(
        'group relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        isDestructive
          ? 'border-destructive/50 bg-destructive/10 text-destructive'
          : 'border-border bg-background/95 text-foreground'
      )}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
      >
        {isDestructive ? (
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
        ) : (
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-success" />
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <motion.h3
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="text-sm font-semibold leading-none"
        >
          {toast.title}
        </motion.h3>
        {toast.description && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm opacity-90"
          >
            {toast.description}
          </motion.p>
        )}
      </div>

      {/* Close Button */}
      <motion.button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 rounded-md p-1 opacity-0 transition-opacity hover:bg-background/50 group-hover:opacity-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </motion.button>

      {/* Progress Bar */}
      <motion.div
        className={cn(
          'absolute bottom-0 left-0 h-1 rounded-b-lg',
          isDestructive ? 'bg-destructive' : 'bg-primary'
        )}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 3, ease: 'linear' }}
      />
    </motion.div>
  )
}
