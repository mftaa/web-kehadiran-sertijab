import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const FieldLabel = ({ label, required }: { label?: string; required?: boolean }) => {
  if (!label) return null;
  
  return (
    <div className="flex items-center justify-between mb-2">
      <label className="block text-sm font-subhead font-bold text-dark-espresso uppercase tracking-wider">
        {label.replace(/\s*\(REQUIRED\)/i, '').replace(/\s*\(OPTIONAL\)/i, '')}
      </label>
      {required ? (
        <span className="text-[10px] px-2 py-0.5 bg-electric-orange text-white font-bold rounded-full tracking-tighter uppercase animate-pulse">
          Wajib
        </span>
      ) : (
        <span className="text-[10px] px-2 py-0.5 bg-dark-espresso/10 text-dark-espresso/60 font-bold rounded-full tracking-tighter uppercase">
          Opsional
        </span>
      )}
    </div>
  );
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <FieldLabel label={label} required={required} />
        <input
          ref={ref}
          required={required}
          className={cn(
            "text-dark-espresso text-base block w-full p-4 font-body tactile-input placeholder:text-deep-cocoa/40 outline-none rounded-xl",
            error && "border-red-600 focus:border-red-600",
            className
          )}
          {...props}
        />
        {error && <p className="mt-2 text-xs text-red-600 font-bold uppercase tracking-tight">! {error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({ variant = 'primary', className, children, ...props }: ButtonProps) => {
  const variants = {
    primary: "tactile-btn-primary font-subhead font-bold text-lg px-8 py-4 rounded-xl uppercase tracking-widest",
    secondary: "tactile-btn-secondary font-subhead font-bold text-lg px-8 py-4 rounded-xl uppercase tracking-widest",
    danger: "bg-red-600 text-white border-3 border-dark-espresso shadow-[4px_4px_0px_#602600] font-subhead font-bold text-lg px-8 py-4 rounded-xl uppercase tracking-widest active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all",
  };

  return (
    <button className={cn("w-full sm:w-auto text-center flex items-center justify-center gap-2", variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <FieldLabel label={label} required={required} />
        <div className="relative">
          <select
            ref={ref}
            required={required}
            className={cn(
              "text-dark-espresso text-base block w-full p-4 font-body tactile-input appearance-none cursor-pointer outline-none rounded-xl",
              error && "border-red-600",
              className
            )}
            {...props}
          >
            <option value="" className="bg-soft-cream">PILIH...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-soft-cream">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-espresso">
            ▼
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-red-600 font-bold uppercase tracking-tight">! {error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
