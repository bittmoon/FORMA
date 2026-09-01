import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import { IconRenderer } from '@/components/ui/IconRenderer';
import {
  LayoutDashboard,
  Boxes,
  Plus,
  Sliders,
  Workflow,
  Users,
  Palette,
  ArrowLeft,
  Settings,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { modules, mode, setMode } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-forma-surface border-r border-forma-border flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 select-none shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-forma-border/70 flex items-center justify-between">
        <NavLink to="/app/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-forma-card border border-forma-border group-hover:border-forma-lime flex items-center justify-center transition-colors">
            <div className="w-3.5 h-3.5 bg-forma-lime rounded-xs rotate-45 transform group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm tracking-wider text-forma-white">
                FORMA
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-forma-lime" />
            </div>
            <span className="text-[10px] text-forma-muted tracking-tight block">
              Business OS
            </span>
          </div>
        </NavLink>

        {mode === 'builder' && (
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-forma-lime text-forma-obsidian font-bold">
            BUILDER
          </span>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {mode === 'business' ? (
          /* ================= BUSINESS MODE NAVIGATION ================= */
          <>
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-forma-subtle">
                Overview
              </div>
              <NavLink
                to="/app/dashboard"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-forma-card text-forma-white border border-forma-border font-semibold shadow-xs'
                      : 'text-forma-muted hover:text-forma-white hover:bg-forma-card/50'
                  )
                }
              >
                <LayoutDashboard className="w-4 h-4 text-forma-lime" />
                <span>Command Center</span>
              </NavLink>
            </div>

            {/* Dynamic Modules Navigation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-forma-subtle">
                <span>Modules ({modules.length})</span>
                <button
                  onClick={() => {
                    setMode('builder');
                    navigate('/app/builder/modules');
                  }}
                  title="Add new module in Builder"
                  className="text-forma-muted hover:text-forma-lime transition-colors p-0.5 rounded cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {modules.length === 0 ? (
                <div className="px-3 py-4 text-center border border-dashed border-forma-border rounded-lg">
                  <p className="text-[11px] text-forma-muted">No modules yet.</p>
                  <button
                    onClick={() => {
                      setMode('builder');
                      navigate('/app/builder/modules');
                    }}
                    className="mt-2 text-xs font-medium text-forma-lime hover:underline cursor-pointer"
                  >
                    + Add your first module
                  </button>
                </div>
              ) : (
                modules.map((mod) => {
                  const isActive = location.pathname === `/app/modules/${mod.id}`;
                  return (
                    <NavLink
                      key={mod.id}
                      to={`/app/modules/${mod.id}`}
                      className={cn(
                        'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group',
                        isActive
                          ? 'bg-forma-card text-forma-white border border-forma-border font-semibold shadow-xs'
                          : 'text-forma-muted hover:text-forma-white hover:bg-forma-card/50'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <IconRenderer
                          name={mod.icon || 'Boxes'}
                          className={cn(
                            'w-4 h-4 transition-colors',
                            isActive ? 'text-forma-lime' : 'text-forma-muted group-hover:text-forma-white'
                          )}
                        />
                        <span className="truncate">{mod.name}</span>
                      </div>
                      {mod.fields && mod.fields.length > 0 && (
                        <span className="text-[10px] font-mono text-forma-subtle group-hover:text-forma-muted">
                          {mod.fields.length}f
                        </span>
                      )}
                    </NavLink>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* ================= BUILDER MODE NAVIGATION ================= */
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-forma-lime flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OS Architect</span>
            </div>

            <NavLink
              to="/app/builder"
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-forma-card text-forma-white border border-forma-border font-semibold'
                    : 'text-forma-muted hover:text-forma-white hover:bg-forma-card/50'
                )
              }
            >
              <Boxes className="w-4 h-4 text-forma-lime" />
              <span>Architecture Canvas</span>
            </NavLink>

            <NavLink
              to="/app/builder/modules"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-forma-card text-forma-white border border-forma-border font-semibold'
                    : 'text-forma-muted hover:text-forma-white hover:bg-forma-card/50'
                )
              }
            >
              <Boxes className="w-4 h-4 text-sky-400" />
              <span>Modules & Fields</span>
            </NavLink>

            <NavLink
              to="/app/builder/dashboard"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-forma-card text-forma-white border border-forma-border font-semibold'
                    : 'text-forma-muted hover:text-forma-white hover:bg-forma-card/50'
                )
              }
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Dashboard Builder</span>
            </NavLink>

            <NavLink
              to="/app/builder/workflows"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-forma-card text-forma-white border border-forma-border font-semibold'
                    : 'text-forma-muted hover:text-forma-white hover:bg-forma-card/50'
                )
              }
            >
              <Workflow className="w-4 h-4 text-emerald-400" />
              <span>Workflows & Triggers</span>
            </NavLink>

            <NavLink
              to="/app/builder/team"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-forma-card text-forma-white border border-forma-border font-semibold'
                    : 'text-forma-muted hover:text-forma-white hover:bg-forma-card/50'
                )
              }
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Team & Permissions</span>
            </NavLink>

            <NavLink
              to="/app/builder/branding"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-forma-card text-forma-white border border-forma-border font-semibold'
                    : 'text-forma-muted hover:text-forma-white hover:bg-forma-card/50'
                )
              }
            >
              <Palette className="w-4 h-4 text-rose-400" />
              <span>Branding & Themes</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-forma-border/70 space-y-2">
        {mode === 'builder' ? (
          <button
            onClick={() => {
              setMode('business');
              navigate('/app/dashboard');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-forma-lime text-forma-obsidian text-xs font-bold hover:bg-forma-limeHover transition-colors cursor-pointer shadow-lime-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Business Mode</span>
          </button>
        ) : (
          <>
            <NavLink
              to="/app/settings"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-forma-card text-forma-white border border-forma-border'
                    : 'text-forma-muted hover:text-forma-white hover:bg-forma-card/50'
                )
              }
            >
              <Settings className="w-4 h-4" />
              <span>Workspace Settings</span>
            </NavLink>

            <button
              onClick={() => {
                setMode('builder');
                navigate('/app/builder');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-forma-card/80 border border-forma-border/80 hover:border-forma-lime/50 text-xs font-medium text-forma-white transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-forma-lime" />
                <span>Open OS Builder</span>
              </div>
              <span className="text-[10px] text-forma-lime font-mono group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
};
