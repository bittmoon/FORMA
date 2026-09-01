import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Workspace, Module, TemplateDefinition } from '@/types';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { applyWorkspaceAccentColor } from '@/lib/utils';

// Local storage layer (offline / zero-config)
import {
  listWorkspaces as localListWorkspaces,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
  getWorkspace as localGetWorkspace,
  updateWorkspace as localUpdateWorkspace,
  createWorkspaceFromTemplate as localCreateWorkspaceFromTemplate,
  listModules as localListModules,
  storageEvents,
} from '@/lib/storage';

// Supabase layer (when configured)
import {
  sbListWorkspaces,
  sbGetWorkspace,
  sbUpdateWorkspace,
  sbCreateWorkspaceFromTemplate,
  sbListModules,
} from '@/lib/supabase-db';

export type AppMode = 'business' | 'builder';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string;
  modules: Module[];
  mode: AppMode;
  isLoading: boolean;
  setMode: (mode: AppMode) => void;
  switchWorkspace: (workspaceId: string) => void;
  createNewWorkspace: (name: string, type: string, size: string, template: TemplateDefinition) => Promise<Workspace>;
  updateActiveWorkspace: (updates: Partial<Workspace>) => Promise<void>;
  refreshData: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWsId] = useState<string>('');
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [mode, setMode] = useState<AppMode>('business');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && user) {
        // ── SUPABASE MODE ──────────────────────────────────────────
        let wsList: Workspace[] = [];
        try {
          wsList = await sbListWorkspaces(user.id);
        } catch (err) {
          console.warn('Supabase sbListWorkspaces failed, falling back to local storage:', err);
        }

        // If no cloud workspaces exist yet, fallback to local workspaces so demo data is always accessible
        if (wsList.length === 0) {
          wsList = localListWorkspaces();
        }

        setWorkspaces(wsList);

        let activeId = getActiveWorkspaceId(); // persisted preference
        if (!activeId || !wsList.find((w) => w.id === activeId)) {
          activeId = wsList[0]?.id ?? '';
          if (activeId) setActiveWorkspaceId(activeId);
        }
        setActiveWsId(activeId);

        const current = wsList.find((w) => w.id === activeId) ?? null;
        setActiveWorkspace(current);
        if (current?.accent_color) {
          applyWorkspaceAccentColor(current.accent_color);
        }

        if (activeId) {
          let mods: Module[] = [];
          try {
            mods = await sbListModules(activeId);
          } catch (err) {
            console.warn('Supabase sbListModules failed, falling back to local storage:', err);
          }
          if (mods.length === 0) {
            mods = localListModules(activeId);
          }
          setModules(mods);
        } else {
          setModules([]);
        }
      } else {
        // ── LOCAL STORAGE MODE ────────────────────────────────────
        const wsList = localListWorkspaces();
        setWorkspaces(wsList);

        let activeId = getActiveWorkspaceId();
        if (!activeId && wsList.length > 0) {
          activeId = wsList[0].id;
          setActiveWorkspaceId(activeId);
        }
        setActiveWsId(activeId);

        const current = wsList.find((w) => w.id === activeId) ?? null;
        setActiveWorkspace(current);
        if (current?.accent_color) {
          applyWorkspaceAccentColor(current.accent_color);
        }

        if (activeId) {
          setModules(localListModules(activeId));
        } else {
          setModules([]);
        }
      }
    } catch (err) {
      console.error('WorkspaceContext: loadData failed', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();

    if (!isSupabaseConfigured) {
      // Local storage events for reactivity
      const unsub = storageEvents.subscribe('*', () => loadData());
      return () => unsub();
    }
  }, [loadData]);

  // Apply workspace accent color dynamically across the entire app
  useEffect(() => {
    applyWorkspaceAccentColor(activeWorkspace?.accent_color);
  }, [activeWorkspace?.accent_color]);

  const switchWorkspace = useCallback(async (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    setActiveWsId(workspaceId);

    if (isSupabaseConfigured) {
      let ws: Workspace | null = null;
      try {
        ws = await sbGetWorkspace(workspaceId);
      } catch (e) {
        console.warn('sbGetWorkspace error:', e);
      }
      if (!ws) {
        ws = localGetWorkspace(workspaceId) ?? null;
      }
      setActiveWorkspace(ws);
      if (ws?.accent_color) applyWorkspaceAccentColor(ws.accent_color);

      if (workspaceId) {
        let mods: Module[] = [];
        try {
          mods = await sbListModules(workspaceId);
        } catch (e) {
          console.warn('sbListModules error:', e);
        }
        if (mods.length === 0) {
          mods = localListModules(workspaceId);
        }
        setModules(mods);
      }
    } else {
      const ws = localGetWorkspace(workspaceId) ?? null;
      setActiveWorkspace(ws);
      if (ws?.accent_color) applyWorkspaceAccentColor(ws.accent_color);
      if (workspaceId) setModules(localListModules(workspaceId));
    }
  }, []);

  const createNewWorkspace = useCallback(async (
    name: string,
    type: string,
    size: string,
    template: TemplateDefinition
  ): Promise<Workspace> => {
    let newWs: Workspace;

    if (isSupabaseConfigured && user) {
      newWs = await sbCreateWorkspaceFromTemplate(
        user.id,
        user.email,
        user.name,
        name,
        type,
        size,
        template
      );
    } else {
      newWs = localCreateWorkspaceFromTemplate(name, type, size, template);
    }

    await loadData();
    await switchWorkspace(newWs.id);
    return newWs;
  }, [user, loadData, switchWorkspace]);

  const updateActiveWorkspace = useCallback(async (updates: Partial<Workspace>) => {
    if (!activeWorkspaceId) return;

    if (updates.accent_color) {
      applyWorkspaceAccentColor(updates.accent_color);
    }

    if (isSupabaseConfigured) {
      const updated = await sbUpdateWorkspace(activeWorkspaceId, updates);
      setActiveWorkspace(updated);
    } else {
      const updated = localUpdateWorkspace(activeWorkspaceId, updates);
      setActiveWorkspace(updated);
    }
    await loadData();
  }, [activeWorkspaceId, loadData]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        activeWorkspaceId,
        modules,
        mode,
        isLoading,
        setMode,
        switchWorkspace,
        createNewWorkspace,
        updateActiveWorkspace,
        refreshData: loadData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
