import React, { useState } from 'react';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Layers,
  Sparkles,
  ChevronDown,
  Plus,
  LogOut,
  Sliders,
  Store,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC<{ onOpenNewWorkspace: () => void }> = ({ onOpenNewWorkspace }) => {
  const { workspaces, activeWorkspace, activeWorkspaceId, switchWorkspace, mode, setMode } = useWorkspace();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <header className="h-14 bg-forma-obsidian/95 border-b border-forma-border/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Left: Workspace Selector */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsWsDropdownOpen(!isWsDropdownOpen)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-forma-surface border border-forma-border hover:border-forma-borderHover text-left transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 rounded bg-forma-card border border-forma-border flex items-center justify-center text-[10px] font-bold text-forma-lime font-mono">
              {activeWorkspace?.name?.charAt(0) || 'F'}
            </div>
            <div className="max-w-[140px] sm:max-w-[180px] truncate">
              <span className="text-xs font-semibold text-forma-white block truncate">
                {activeWorkspace?.name || 'My Business OS'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-forma-muted" />
          </button>

          {/* Workspace Dropdown */}
          {isWsDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsWsDropdownOpen(false)} />
              <div className="absolute left-0 mt-1.5 w-64 bg-forma-card border border-forma-border rounded-xl shadow-elevated z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 text-[11px] font-mono text-forma-muted uppercase tracking-wider border-b border-forma-border/50">
                  Your Workspaces
                </div>
                <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        switchWorkspace(ws.id);
                        setIsWsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs text-forma-white hover:bg-forma-surface transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-5 h-5 rounded bg-forma-surface border border-forma-border flex items-center justify-center text-[10px] font-mono text-forma-lime">
                          {ws.name.charAt(0)}
                        </div>
                        <span className="truncate">{ws.name}</span>
                      </div>
                      {ws.id === activeWorkspaceId && <Check className="w-3.5 h-3.5 text-forma-lime" />}
                    </button>
                  ))}
                </div>
                <div className="pt-1.5 border-t border-forma-border/50">
                  <button
                    onClick={() => {
                      setIsWsDropdownOpen(false);
                      onOpenNewWorkspace();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-forma-lime hover:bg-forma-limeDim transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Business OS</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Business Type Badge */}
        {activeWorkspace && (
          <Badge variant="slate" size="sm" className="hidden md:inline-flex">
            {activeWorkspace.business_type}
          </Badge>
        )}
      </div>

      {/* Center: Dual Mode Switcher (Business Mode vs Builder Mode) */}
      <div className="flex items-center bg-forma-surface/90 border border-forma-border p-0.5 rounded-lg shadow-inner">
        <button
          onClick={() => {
            setMode('business');
            navigate('/app/dashboard');
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
            mode === 'business'
              ? 'bg-forma-elevated text-forma-white border border-forma-border/80 shadow-sm font-semibold'
              : 'text-forma-muted hover:text-forma-white'
          }`}
        >
          <Store className={`w-3.5 h-3.5 ${mode === 'business' ? 'text-forma-lime' : 'text-forma-muted'}`} />
          <span>Business Mode</span>
        </button>

        <button
          onClick={() => {
            setMode('builder');
            navigate('/app/builder');
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
            mode === 'builder'
              ? 'bg-forma-lime text-forma-obsidian font-bold shadow-lime-sm'
              : 'text-forma-muted hover:text-forma-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Builder Mode</span>
          {mode !== 'builder' && (
            <span className="w-1.5 h-1.5 rounded-full bg-forma-lime animate-pulse" />
          )}
        </button>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-3">
        {mode === 'business' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMode('builder');
              navigate('/app/builder/modules');
            }}
            className="hidden sm:inline-flex text-xs text-forma-lime border-forma-lime/30 hover:border-forma-lime/60 bg-forma-limeDim/50"
          >
            <Layers className="w-3.5 h-3.5 text-forma-lime" />
            <span>Customize OS</span>
          </Button>
        )}

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="w-8 h-8 rounded-lg bg-forma-surface border border-forma-border hover:border-forma-borderHover flex items-center justify-center text-xs font-semibold text-forma-white transition-colors cursor-pointer overflow-hidden"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.charAt(0) || 'U'}</span>
            )}
          </button>

          {isUserDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-52 bg-forma-card border border-forma-border rounded-xl shadow-elevated z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-forma-border/50">
                  <p className="text-xs font-semibold text-forma-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-forma-muted truncate font-mono">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      navigate('/app/settings');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-forma-white hover:bg-forma-surface transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-forma-muted" />
                    <span>Workspace Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      navigate('/onboarding');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-forma-white hover:bg-forma-surface transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-forma-lime" />
                    <span>Run Onboarding Wizard</span>
                  </button>
                </div>
                <div className="pt-1 border-t border-forma-border/50">
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
