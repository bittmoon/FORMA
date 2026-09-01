import React from 'react';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import { listWorkflows, getDashboardForWorkspace, getAllRecordsForModule } from '@/lib/storage';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Boxes,
  LayoutDashboard,
  Workflow,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BuilderOverview: React.FC = () => {
  const { modules, activeWorkspaceId, activeWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const workflows = listWorkflows(activeWorkspaceId);
  const { widgets } = getDashboardForWorkspace(activeWorkspaceId);

  // Total records across all modules
  const totalRecordsCount = modules.reduce((acc, m) => {
    return acc + getAllRecordsForModule(m.id).length;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="forma-card p-4 rounded-xl border border-forma-border">
          <div className="flex items-center justify-between text-forma-muted">
            <span className="text-xs font-mono uppercase">Custom Modules</span>
            <Boxes className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-forma-white mt-2">
            {modules.length}
          </div>
          <p className="text-[11px] text-forma-subtle mt-1">Configured business entities</p>
        </div>

        <div className="forma-card p-4 rounded-xl border border-forma-border">
          <div className="flex items-center justify-between text-forma-muted">
            <span className="text-xs font-mono uppercase">Total Records</span>
            <Database className="w-4 h-4 text-forma-lime" />
          </div>
          <div className="text-2xl font-bold font-display text-forma-white mt-2">
            {totalRecordsCount}
          </div>
          <p className="text-[11px] text-forma-subtle mt-1">Live persisted entries</p>
        </div>

        <div className="forma-card p-4 rounded-xl border border-forma-border">
          <div className="flex items-center justify-between text-forma-muted">
            <span className="text-xs font-mono uppercase">Automations</span>
            <Workflow className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-forma-white mt-2">
            {workflows.length}
          </div>
          <p className="text-[11px] text-forma-subtle mt-1">Active trigger-action rules</p>
        </div>

        <div className="forma-card p-4 rounded-xl border border-forma-border">
          <div className="flex items-center justify-between text-forma-muted">
            <span className="text-xs font-mono uppercase">Dashboard Widgets</span>
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-display text-forma-white mt-2">
            {widgets.length}
          </div>
          <p className="text-[11px] text-forma-subtle mt-1">Command center analytics</p>
        </div>
      </div>

      {/* Visual System Architecture Diagram / Canvas */}
      <div className="forma-panel p-6 rounded-2xl border border-forma-border relative overflow-hidden bg-forma-grid">
        <div className="flex items-center justify-between pb-4 border-b border-forma-border/60">
          <div>
            <h3 className="text-sm font-bold text-forma-white font-display uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-forma-lime" />
              <span>OS Building Blocks & Entity Schema</span>
            </h3>
            <p className="text-xs text-forma-muted mt-0.5">
              Live blueprint of modules and their configured field schemas in{' '}
              {activeWorkspace?.name}.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/builder/modules')}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Module</span>
          </Button>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {modules.map((mod) => {
            const recordsCount = getAllRecordsForModule(mod.id).length;
            const fields = mod.fields || [];

            return (
              <div
                key={mod.id}
                onClick={() => navigate('/app/builder/modules')}
                className="forma-card p-4 rounded-xl border border-forma-border hover:border-forma-lime/60 hover:shadow-lime-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg bg-forma-surface border border-forma-border flex items-center justify-center text-forma-lime group-hover:border-forma-lime transition-colors"
                      style={{ borderColor: mod.color ? `${mod.color}40` : undefined }}
                    >
                      <IconRenderer name={mod.icon || 'Boxes'} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-forma-white font-display group-hover:text-forma-lime transition-colors">
                        {mod.name}
                      </h4>
                      <span className="text-[10px] font-mono text-forma-subtle">
                        slug: {mod.slug}
                      </span>
                    </div>
                  </div>

                  <Badge variant="slate" size="sm" className="font-mono text-[10px]">
                    {recordsCount} recs
                  </Badge>
                </div>

                <p className="text-xs text-forma-muted mt-2.5 line-clamp-2">
                  {mod.description || 'Custom business module'}
                </p>

                {/* Fields summary pills */}
                <div className="mt-3 pt-3 border-t border-forma-border/50 flex items-center gap-1.5 flex-wrap">
                  {fields.slice(0, 4).map((f) => (
                    <span
                      key={f.id}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-forma-surface text-forma-muted border border-forma-border"
                    >
                      {f.name} ({f.type})
                    </span>
                  ))}
                  {fields.length > 4 && (
                    <span className="text-[10px] font-mono text-forma-subtle">
                      +{fields.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/app/builder/dashboard')}
          className="forma-card p-5 rounded-xl border border-forma-border hover:border-forma-borderHover cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-forma-white font-display group-hover:text-amber-400 transition-colors">
            Dashboard Builder
          </h4>
          <p className="text-xs text-forma-muted mt-1">
            Arrange stat counters, charts, tables, and live feed widgets for your team.
          </p>
        </div>

        <div
          onClick={() => navigate('/app/builder/workflows')}
          className="forma-card p-5 rounded-xl border border-forma-border hover:border-forma-borderHover cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
            <Workflow className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-forma-white font-display group-hover:text-emerald-400 transition-colors">
            Automated Workflows
          </h4>
          <p className="text-xs text-forma-muted mt-1">
            Connect modules with "When something happens, do this action" triggers.
          </p>
        </div>

        <div
          onClick={() => navigate('/app/builder/team')}
          className="forma-card p-5 rounded-xl border border-forma-border hover:border-forma-borderHover cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
            <Boxes className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-forma-white font-display group-hover:text-purple-400 transition-colors">
            Team & Permissions
          </h4>
          <p className="text-xs text-forma-muted mt-1">
            Grant Owner, Admin, or Employee access levels per business module.
          </p>
        </div>
      </div>
    </div>
  );
};
