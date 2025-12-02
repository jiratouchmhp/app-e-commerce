'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
      if (props.onBlur) props.onBlur(e)
    }

    const showFloatingLabel = label && (isFocused || hasValue || props.value)

    if (!label) {
      // Standard input without floating label
      return (
        <motion.input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
      )
    }

    return (
      <div className="relative">
        <motion.input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-lg border border-input bg-background px-3 pt-5 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          whileFocus={{ scale: 1.01 }}
          placeholder={isFocused ? props.placeholder : ''}
          {...props}
        />
        
        {/* Floating Label */}
        <motion.label
          htmlFor={props.id}
          className={cn(
            'absolute left-3 text-sm pointer-events-none transition-all duration-200',
            showFloatingLabel
              ? 'top-1.5 text-xs text-muted-foreground'
              : 'top-3.5 text-sm text-muted-foreground',
            error && showFloatingLabel && 'text-destructive'
          )}
          animate={{
            y: showFloatingLabel ? -8 : 0,
            scale: showFloatingLabel ? 0.85 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
