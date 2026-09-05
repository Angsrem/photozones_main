'use client';

import { formatPhoneInput, isPhoneValid } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function PhoneInput({
  value,
  onChange,
  className,
  placeholder = '+7 (___) ___-__-__',
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
}) {
  const display = value ? formatPhoneInput(value) : '';
  return (
    <Input
      id={id}
      inputMode="tel"
      type="tel"
      value={display}
      placeholder={placeholder}
      className={cn('h-12 text-base', className)}
      onChange={(e) => {
        onChange(formatPhoneInput(e.target.value));
      }}
    />
  );
}

export { isPhoneValid };
