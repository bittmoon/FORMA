/**
 * Backend-neutral operations used by the Builder. Keeping this selection here
 * prevents configuration from accidentally being saved only in localStorage
 * when a workspace is running on Supabase.
 */
import { Dashboard, DashboardWidget, Field, Module, WorkflowExecution, WorkflowRule } from '@/types';
import { isSupabaseConfigured } from './supabase';
import * as local from './storage';
import * as remote from './supabase-db';

export async function saveModule(workspaceId: string, data: Pick<Module, 'name' | 'icon' | 'color' | 'description'>, id?: string) {
  return isSupabaseConfigured
    ? id ? remote.sbUpdateModule(id, data) : remote.sbCreateModule(workspaceId, data.name, data.icon, data.color || '#C7F36B', data.description)
    : id ? local.updateModule(id, data) : local.createModule(workspaceId, data);
}

export async function removeModule(id: string) {
  return isSupabaseConfigured ? remote.sbDeleteModule(id) : local.deleteModule(id);
}

export async function saveField(moduleId: string, data: Pick<Field, 'name' | 'type' | 'config' | 'required'>, position: number, id?: string) {
  return isSupabaseConfigured
    ? id ? remote.sbUpdateField(id, data) : remote.sbCreateField(moduleId, data.name, data.type, data.config, data.required, position)
    : id ? local.updateField(id, data) : local.createField(moduleId, data);
}

export async function removeField(id: string) {
  return isSupabaseConfigured ? remote.sbDeleteField(id) : local.deleteField(id);
}

export async function reorderBuilderFields(moduleId: string, ids: string[]) {
  return isSupabaseConfigured ? remote.sbReorderFields(moduleId, ids) : local.reorderFields(moduleId, ids);
}

export async function listBuilderWorkflows(workspaceId: string) {
  return isSupabaseConfigured ? remote.sbListWorkflows(workspaceId) : local.listWorkflows(workspaceId);
}

export async function saveWorkflow(workspaceId: string, data: Omit<WorkflowRule, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>, id?: string) {
  return isSupabaseConfigured
    ? id ? remote.sbUpdateWorkflow(id, data) : remote.sbCreateWorkflow(workspaceId, { ...data, workspace_id: workspaceId })
    : id ? local.updateWorkflow(id, data) : local.createWorkflow(workspaceId, data);
}

export async function removeWorkflow(id: string) {
  return isSupabaseConfigured ? remote.sbDeleteWorkflow(id) : local.deleteWorkflow(id);
}

export async function listBuilderWorkflowExecutions(workspaceId: string): Promise<WorkflowExecution[]> {
  return isSupabaseConfigured
    ? remote.sbListWorkflowExecutions(workspaceId)
    : local.listWorkflowExecutions(workspaceId);
}

export async function getBuilderDashboard(workspaceId: string): Promise<{ dashboard: Dashboard; widgets: DashboardWidget[] }> {
  if (!isSupabaseConfigured) return local.getDashboardForWorkspace(workspaceId);
  const result = await remote.sbGetDashboard(workspaceId);
  if (result.dashboard) return { dashboard: result.dashboard, widgets: result.widgets };
  const dashboard = await remote.sbCreateDashboard(workspaceId, 'Business Command Center');
  return { dashboard, widgets: [] };
}

export async function createBuilderWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id' | 'dashboard_id'>) {
  return isSupabaseConfigured
    ? remote.sbCreateWidget(dashboardId, { ...widget, dashboard_id: dashboardId })
    : local.addDashboardWidget(dashboardId, widget);
}

export async function updateBuilderWidget(id: string, updates: Partial<DashboardWidget>) {
  return isSupabaseConfigured ? remote.sbUpdateWidget(id, updates) : local.updateDashboardWidget(id, updates);
}

export async function removeBuilderWidget(id: string) {
  return isSupabaseConfigured ? remote.sbDeleteWidget(id) : local.deleteDashboardWidget(id);
}
