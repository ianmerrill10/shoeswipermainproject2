import React, { forwardRef, useState } from 'react';
import { FaEye, FaEyeSlash, FaSearch } from 'react-icons/fa';

export type InputVariant = 'default' | 'filled';
export type InputType = 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg',
};

const variantStyles: Record<InputVariant, string> = {
  default: 'bg-zinc-900 border border-zinc-700 focus:border-purple-500',
  filled: 'bg-zinc-800 border border-transparent focus:border-purple-500',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'default',
      leftIcon,
      rightIcon,
      fullWidth = false,
      inputSize = 'md',
      type = 'text',
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === 'password';
    const isSearch = type === 'search';
    const inputType = isPassword && showPassword ? 'text' : type;

    const hasError = Boolean(error);

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zinc-300 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {/* Left Icon or Search Icon */}
          {(leftIcon || isSearch) && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {leftIcon || <FaSearch size={16} />}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={`
              w-full rounded-lg text-white placeholder-zinc-500
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-purple-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              ${variantStyles[variant]}
              ${sizeStyles[inputSize]}
              ${leftIcon || isSearch ? 'pl-10' : ''}
              ${rightIcon || isPassword ? 'pr-10' : ''}
              ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {(rightIcon || isPassword) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              ) : (
                <span className="text-zinc-500">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <p
            id={hasError ? `${inputId}-error` : `${inputId}-helper`}
            className={`mt-1.5 text-sm ${hasError ? 'text-red-400' : 'text-zinc-500'}`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
