import React, { useMemo } from 'react';
import { DashboardWidget } from '@/types';
import { getAllRecordsForModule } from '@/lib/storage';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export const StatWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  const { title, module_id, config } = widget;

  const records = useMemo(() => {
    return module_id ? getAllRecordsForModule(module_id) : [];
  }, [module_id]);

  const calculatedValue = useMemo(() => {
    if (!module_id) return '0';
    const { aggregate = 'count', metric_field } = config;

    if (aggregate === 'count') {
      return records.length.toLocaleString();
    }

    if (metric_field) {
      const numbers = records
        .map((r) => Number(r.data[metric_field]))
        .filter((n) => !isNaN(n) && n !== null);

      if (numbers.length === 0) return '$0.00';

      const sum = numbers.reduce((acc, curr) => acc + curr, 0);

      if (aggregate === 'sum') {
        return formatCurrency(sum);
      }
      if (aggregate === 'avg') {
        return formatCurrency(sum / numbers.length);
      }
    }

    return records.length.toLocaleString();
  }, [records, module_id, config]);

  const iconName = config.icon || 'TrendingUp';
  const accentColor = config.color || '#C7F36B';

  return (
    <div className="forma-card p-5 rounded-xl flex flex-col justify-between relative overflow-hidden group">
      {/* Subtle background glow */}
      <div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-10 blur-xl pointer-events-none transition-opacity group-hover:opacity-20"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-forma-muted">
          {title}
        </span>
        <div
          className="w-7 h-7 rounded-lg bg-forma-surface border border-forma-border flex items-center justify-center text-xs"
          style={{ color: accentColor }}
        >
          <IconRenderer name={iconName} className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-bold font-display text-forma-white tracking-tight">
          {calculatedValue}
        </div>
        {config.subtitle && (
          <p className="text-[11px] text-forma-subtle mt-1 flex items-center gap-1">
            <span>{config.subtitle}</span>
          </p>
        )}
      </div>
    </div>
  );
};
