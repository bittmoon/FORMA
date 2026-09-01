import React from 'react';
import { DashboardWidget } from '@/types';
import { getAllRecordsForModule, getModule } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { NavLink } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const TableWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  const { title, module_id, config } = widget;
  const mod = module_id ? getModule(module_id) : undefined;
  const records = module_id ? getAllRecordsForModule(module_id).slice(0, config.limit || 5) : [];
  const fields = mod?.fields?.slice(0, 4) || [];

  return (
    <div className="forma-card p-5 rounded-xl flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-forma-border/50">
        <div>
          <h3 className="text-xs font-semibold text-forma-white font-display uppercase tracking-wider">
            {title}
          </h3>
          {mod && <p className="text-[10px] text-forma-muted mt-0.5">{mod.name} quick view</p>}
        </div>
        {mod && (
          <NavLink
            to={`/app/modules/${mod.id}`}
            className="flex items-center gap-1 text-[11px] text-forma-lime hover:underline font-medium"
          >
            <span>View all</span>
            <ArrowUpRight className="w-3 h-3" />
          </NavLink>
        )}
      </div>

      <div className="mt-3 overflow-x-auto">
        {records.length === 0 ? (
          <p className="text-xs text-forma-muted py-6 text-center italic">No records to display.</p>
        ) : (
          <table className="w-full text-left text-xs text-forma-white border-collapse">
            <thead>
              <tr className="border-b border-forma-border text-[10px] font-mono text-forma-muted uppercase">
                {fields.map((f) => (
                  <th key={f.id} className="pb-2 font-medium">
                    {f.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-forma-border/40">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-forma-surface/40 transition-colors">
                  {fields.map((f) => {
                    const val = r.data[f.slug];
                    return (
                      <td key={f.id} className="py-2.5 pr-2">
                        {f.type === 'currency' ? (
                          <span className="font-mono text-forma-lime font-medium">
                            {formatCurrency(val, f.config.currency_symbol || '$')}
                          </span>
                        ) : f.type === 'select' ? (
                          <Badge variant="slate" size="sm">
                            {String(val || '—')}
                          </Badge>
                        ) : f.type === 'date' ? (
                          <span className="font-mono text-[11px] text-forma-muted">{formatDate(val)}</span>
                        ) : (
                          <span className="truncate block max-w-[140px]">{String(val ?? '—')}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
