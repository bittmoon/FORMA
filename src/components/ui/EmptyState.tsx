import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { IconRenderer } from './IconRenderer';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'Boxes',
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center rounded-xl border border-dashed border-forma-border bg-forma-surface/30',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-forma-card border border-forma-border flex items-center justify-center text-forma-muted mb-4 shadow-sm">
        <IconRenderer name={icon} className="w-6 h-6 text-forma-muted" />
      </div>
      <h3 className="text-base font-semibold text-forma-white font-display">{title}</h3>
      <p className="text-xs text-forma-muted max-w-sm mt-1.5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
