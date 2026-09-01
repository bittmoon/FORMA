import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import { Button } from '@/components/ui/Button';
import {
  Boxes,
  LayoutDashboard,
  Workflow,
  Users,
  Palette,
  ArrowLeft,
  Sparkles,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const BuilderLayout: React.FC = () => {
  const { setMode, activeWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const navItems = [
    { to: '/app/builder', label: 'Architecture Canvas', icon: Layers, end: true },
    { to: '/app/builder/modules', label: 'Modules & Fields', icon: Boxes },
    { to: '/app/builder/dashboard', label: 'Dashboard Builder', icon: LayoutDashboard },
    { to: '/app/builder/workflows', label: 'Workflows & Triggers', icon: Workflow },
    { to: '/app/builder/team', label: 'Team & Permissions', icon: Users },
    { to: '/app/builder/branding', label: 'Branding & Theme', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      {/* Builder Top Bar */}
      <div className="p-4 rounded-xl bg-forma-surface border border-forma-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-forma-lime text-forma-obsidian flex items-center justify-center font-bold font-mono shadow-lime-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-forma-white font-display">
                FORMA Architect Studio
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forma-limeDim text-forma-lime font-semibold border border-forma-lime/30">
                LIVE BUILDER
              </span>
            </div>
            <p className="text-[11px] text-forma-muted">
              Configure modules, dynamic fields, automated workflows, and dashboard layout for{' '}
              <strong className="text-forma-white">{activeWorkspace?.name}</strong>.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMode('business');
            navigate('/app/dashboard');
          }}
          className="text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Business Mode</span>
        </Button>
      </div>

      {/* Builder Segmented Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-forma-border scrollbar-none">
        {navItems.map((item) => {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-forma-card text-forma-white border border-forma-border font-semibold shadow-xs text-forma-lime'
                    : 'text-forma-muted hover:text-forma-white hover:bg-forma-surface'
                )
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Nested Route View */}
      <div className="min-h-[500px]">
        <Outlet />
      </div>
    </div>
  );
};
