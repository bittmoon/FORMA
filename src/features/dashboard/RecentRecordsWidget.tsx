import React from 'react';
import { DashboardWidget } from '@/types';
import { getAllRecordsForModule, getModule } from '@/lib/storage';
import { formatDateTime } from '@/lib/utils';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const RecentRecordsWidget: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  const { title, module_id, config } = widget;
  const mod = module_id ? getModule(module_id) : undefined;
  const records = module_id ? getAllRecordsForModule(module_id).slice(0, config.limit || 4) : [];

  return (
    <div className="forma-card p-5 rounded-xl flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-forma-border/50">
        <div>
          <h3 className="text-xs font-semibold text-forma-white font-display uppercase tracking-wider">
            {title}
          </h3>
          {mod && <p className="text-[10px] text-forma-muted mt-0.5">Live stream</p>}
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        {records.length === 0 ? (
          <p className="text-xs text-forma-muted py-6 text-center italic">No records yet.</p>
        ) : (
          records.map((r) => {
            const primaryName =
              r.data.name ||
              r.data.title ||
              r.data.full_name ||
              r.data.company_name ||
              `Record #${r.id.slice(-4)}`;
            const secondary = r.data.status || r.data.stage || r.data.email || r.data.amount;

            return (
              <div
                key={r.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-forma-surface border border-forma-border hover:border-forma-borderHover transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-6 h-6 rounded bg-forma-card border border-forma-border flex items-center justify-center text-forma-lime text-xs">
                    <IconRenderer name={mod?.icon || 'Boxes'} className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-medium text-forma-white block truncate">
                      {String(primaryName)}
                    </span>
                    <span className="text-[10px] text-forma-muted block font-mono">
                      {formatDateTime(r.created_at)}
                    </span>
                  </div>
                </div>
                {secondary && (
                  <span className="text-[11px] font-mono font-medium text-forma-lime px-2 py-0.5 rounded bg-forma-limeDim">
                    {String(secondary)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {mod && (
        <div className="pt-3 mt-3 border-t border-forma-border/40">
          <NavLink
            to={`/app/modules/${mod.id}`}
            className="flex items-center justify-between text-xs text-forma-muted hover:text-forma-white transition-colors"
          >
            <span>Open {mod.name} database</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      )}
    </div>
  );
};
