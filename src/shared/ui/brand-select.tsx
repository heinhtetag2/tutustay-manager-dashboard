import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface BrandSelectOption {
  value: string;
  label: React.ReactNode;
}

interface BrandSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: BrandSelectOption[];
  placeholder?: string;
  className?: string;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

export function BrandSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  leftIcon,
  disabled,
  ariaLabel,
}: BrandSelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn(
          'relative flex items-center justify-between gap-2 w-full py-2 bg-white border border-[var(--border-default)] rounded-md text-sm font-normal text-[var(--text-primary)]',
          'hover:bg-white transition-colors',
          'focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]',
          'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
          'data-[placeholder]:text-[var(--text-secondary)]',
          'cursor-pointer text-left',
          leftIcon ? 'pl-9 pr-3' : 'px-3',
          className,
        )}
      >
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none [&>svg]:w-4 [&>svg]:h-4">
            {leftIcon}
          </span>
        )}
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className={cn(
            'z-50 overflow-hidden rounded-md border border-[var(--border-default)] bg-white',
            'min-w-[var(--radix-select-trigger-width)]',
            'shadow-[0_4px_16px_rgba(44,38,39,0.08)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 pr-8 text-sm text-[var(--text-primary)] rounded-md',
                  'cursor-pointer select-none outline-none',
                  'data-[highlighted]:bg-[var(--brand-tint)] data-[highlighted]:text-[var(--brand-primary)]',
                  'data-[state=checked]:bg-[var(--brand-tint)] data-[state=checked]:text-[var(--brand-primary)] data-[state=checked]:font-medium',
                  'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
                )}
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Check className="w-4 h-4 text-[var(--brand-primary)]" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
