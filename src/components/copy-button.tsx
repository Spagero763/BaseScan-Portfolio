'use client';

import { Copy, Check } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/use-copy-clipboard';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export function CopyButton({ text, className, size = 'icon' }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn('h-8 w-8', className)}
      onClick={() => copy(text)}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">Copy to clipboard</span>
    </Button>
  );
}

interface AddressCopyProps {
  address: string;
  truncate?: boolean;
  className?: string;
}

export function AddressCopy({ address, truncate = true, className }: AddressCopyProps) {
  const displayAddress = truncate
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="font-mono text-sm">{displayAddress}</span>
      <CopyButton text={address} />
    </div>
  );
}
