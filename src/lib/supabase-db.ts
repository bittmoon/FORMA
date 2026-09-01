/**
 * FORMA — Supabase Data Layer
 * Async equivalents of all storage.ts functions, backed by Supabase PostgreSQL.
 * Only used when isSupabaseConfigured === true.
 */

import { supabase } from './supabase';
import {
  Workspace,
  WorkspaceMember,
  Module,
  Field,
  FormaRecord,
  Dashboard,
  DashboardWidget,
  WorkflowRule,
  WorkflowExecution,
  ActivityLog,
  TemplateDefinition,
} from '@/types';
import { generateId, slugify } from './utils';

// ---------------------------------------------------------------------------
// WORKSPACES
// ---------------------------------------------------------------------------

export async function sbListWorkspaces(userId: string): Promise<Workspace[]> {
  if (!supabase) return [];
  // Get workspace IDs where user is a member
  const { data: memberRows } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId);

  if (!memberRows?.length) return [];
  const wsIds = memberRows.map((r) => r.workspace_id);

  const { data } = await supabase
    .from('workspaces')
    .select('*')
    .in('id', wsIds)
    .order('created_at', { ascending: true });

  return (data || []).map(mapWorkspace);
}

export async function sbGetWorkspace(workspaceId: string): Promise<Workspace | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();
  return data ? mapWorkspace(data) : null;
}

export async function sbCreateWorkspace(
  name: string,
  businessType: string,
  teamSize: string,
  owner?: { email: string; name: string }
): Promise<Workspace> {
  if (!supabase) throw new Error('Supabase not configured');
  const slug = slugify(name) + '_' + Date.now();
  if (owner) {
    const { data, error } = await supabase.rpc('create_workspace_with_owner', {
      workspace_name: name,
      workspace_slug: slug,
      workspace_business_type: businessType,
      workspace_team_size: teamSize,
      owner_email: owner.email,
      owner_name: owner.name,
    });
    if (error) throw error;
    return mapWorkspace(data);
  }
  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      name,
      slug,
      business_type: businessType,
      team_size: teamSize,
    })
    .select()
    .single();
  if (error) throw error;
  return mapWorkspace(data);
}

export async function sbUpdateWorkspace(
  workspaceId: string,
  updates: Partial<Workspace>
): Promise<Workspace> {
  if (!supabase) throw new Error('Supabase not configured');
  const payload: Record<string, any> = {};
  if (updates.name) payload.name = updates.name;
  if (updates.logo_url !== undefined) payload.logo_url = updates.logo_url;
  if (updates.accent_color) payload.accent_color = updates.accent_color;
  if (updates.currency) payload.currency = updates.currency;
  if (updates.timezone) payload.timezone = updates.timezone;
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('workspaces')
    .update(payload)
    .eq('id', workspaceId)
    .select()
    .single();
  if (error) throw error;
  return mapWorkspace(data);
}

// ---------------------------------------------------------------------------
// WORKSPACE MEMBERS
// ---------------------------------------------------------------------------

export async function sbAddWorkspaceMember(
  workspaceId: string,
  userId: string,
  email: string,
  name: string,
  role: 'owner' | 'admin' | 'employee' = 'owner'
): Promise<void> {
  if (!supabase) return;
  await supabase.from('workspace_members').upsert({
    workspace_id: workspaceId,
    user_id: userId,
    email,
    name,
    role,
  });
}

export async function sbListWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId);
  return (data || []).map(mapMember);
}

// ---------------------------------------------------------------------------
// MODULES
// ---------------------------------------------------------------------------

export async function sbListModules(workspaceId: string): Promise<Module[]> {
  if (!supabase) return [];
  // Fetch modules + their fields in one go
  const { data } = await supabase
    .from('modules')
    .select('*, fields(*)')
    .eq('workspace_id', workspaceId)
    .order('position', { ascending: true });

  return (data || []).map(mapModule);
}

export async function sbCreateModule(
  workspaceId: string,
  name: string,
  icon: string,
  color: string,
  description?: string
): Promise<Module> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('modules')
    .insert({
      workspace_id: workspaceId,
      name,
      slug: slugify(name),
      icon,
      color,
      description: description || '',
    })
    .select('*, fields(*)')
    .single();
  if (error) throw error;
  return mapModule(data);
}

export async function sbUpdateModule(
  moduleId: string,
  updates: Partial<Module>
): Promise<Module> {
  if (!supabase) throw new Error('Supabase not configured');
  const payload: Record<string, any> = {};
  if (updates.name) { payload.name = updates.name; payload.slug = slugify(updates.name); }
  if (updates.icon) payload.icon = updates.icon;
  if (updates.color) payload.color = updates.color;
  if (updates.description !== undefined) payload.description = updates.description;
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('modules')
    .update(payload)
    .eq('id', moduleId)
    .select('*, fields(*)')
    .single();
  if (error) throw error;
  return mapModule(data);
}

export async function sbDeleteModule(moduleId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('modules').delete().eq('id', moduleId);
}

// ---------------------------------------------------------------------------
// FIELDS
// ---------------------------------------------------------------------------

export async function sbCreateField(
  moduleId: string,
  name: string,
  type: string,
  config: Record<string, any>,
  required: boolean,
  position: number
): Promise<Field> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('fields')
    .insert({
      module_id: moduleId,
      name,
      slug: slugify(name),
      type,
      config,
      required,
      position,
    })
    .select()
    .single();
  if (error) throw error;
  return mapField(data);
}

export async function sbUpdateField(
  fieldId: string,
  updates: Partial<Field>
): Promise<Field> {
  if (!supabase) throw new Error('Supabase not configured');
  const payload: Record<string, any> = {};
  if (updates.name) payload.name = updates.name;
  if (updates.type) payload.type = updates.type;
  if (updates.config) payload.config = updates.config;
  if (updates.required !== undefined) payload.required = updates.required;
  if (updates.position !== undefined) payload.position = updates.position;

  const { data, error } = await supabase
    .from('fields')
    .update(payload)
    .eq('id', fieldId)
    .select()
    .single();
  if (error) throw error;
  return mapField(data);
}

export async function sbDeleteField(fieldId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('fields').delete().eq('id', fieldId);
  if (error) throw error;
}

export async function sbReorderFields(moduleId: string, orderedFieldIds: string[]): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  const client = supabase;
  const updates = orderedFieldIds.map((id, position) =>
    client.from('fields').update({ position }).eq('id', id).eq('module_id', moduleId)
  );
  const results = await Promise.all(updates);
  const failure = results.find(({ error }) => error)?.error;
  if (failure) throw failure;
}

// ---------------------------------------------------------------------------
// RECORDS
// ---------------------------------------------------------------------------

export interface ListRecordsOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
}

export interface ListRecordsResult {
  records: FormaRecord[];
  totalCount: number;
  totalPages: number;
}

export async function sbListRecords(
  moduleId: string,
  opts: ListRecordsOptions = {}
): Promise<ListRecordsResult> {
  if (!supabase) return { records: [], totalCount: 0, totalPages: 0 };

  const { page = 1, pageSize = 10 } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('records')
    .select('*', { count: 'exact' })
    .eq('module_id', moduleId);

  // Text search using Postgres JSONB containment
  if (opts.search) {
    query = query.ilike('data::text', `%${opts.search}%`);
  }

  // Apply filter conditions (filter on JSONB keys)
  if (opts.filters) {
    for (const [key, val] of Object.entries(opts.filters)) {
      if (val !== '' && val !== undefined && val !== null) {
        query = query.contains('data', { [key]: val });
      }
    }
  }

  // Sorting
  if (opts.sortBy) {
    // We can only sort on top-level columns; for JSONB we sort by created_at as fallback
    query = query.order('created_at', { ascending: opts.sortOrder !== 'desc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) { console.error('sbListRecords error:', error); return { records: [], totalCount: 0, totalPages: 0 }; }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const records = (data || []).map(mapRecord);

  return { records, totalCount, totalPages };
}

export async function sbCreateRecord(
  moduleId: string,
  workspaceId: string,
  userId: string,
  data: Record<string, any>
): Promise<FormaRecord> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: row, error } = await supabase
    .from('records')
    .insert({ module_id: moduleId, workspace_id: workspaceId, created_by: userId, data })
    .select()
    .single();
  if (error) throw error;
  return mapRecord(row);
}

export async function sbUpdateRecord(
  recordId: string,
  data: Record<string, any>
): Promise<FormaRecord> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: row, error } = await supabase
    .from('records')
    .update({ data, updated_at: new Date().toISOString() })
    .eq('id', recordId)
    .select()
    .single();
  if (error) throw error;
  return mapRecord(row);
}

export async function sbDeleteRecord(recordId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('records').delete().eq('id', recordId);
}

// ---------------------------------------------------------------------------
// DASHBOARDS & WIDGETS
// ---------------------------------------------------------------------------

export async function sbGetDashboard(
  workspaceId: string
): Promise<{ dashboard: Dashboard | null; widgets: DashboardWidget[] }> {
  if (!supabase) return { dashboard: null, widgets: [] };

  const { data: dashboards } = await supabase
    .from('dashboards')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_default', true)
    .limit(1);

  if (!dashboards?.length) return { dashboard: null, widgets: [] };
  const dash = dashboards[0];

  const { data: widgets } = await supabase
    .from('dashboard_widgets')
    .select('*')
    .eq('dashboard_id', dash.id)
    .order('position_y', { ascending: true });

  return {
    dashboard: mapDashboard(dash),
    widgets: (widgets || []).map(mapWidget),
  };
}

export async function sbCreateDashboard(workspaceId: string, name: string): Promise<Dashboard> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('dashboards')
    .insert({ workspace_id: workspaceId, name, is_default: true })
    .select()
    .single();
  if (error) throw error;
  return mapDashboard(data);
}

export async function sbCreateWidget(
  dashboardId: string,
  widget: Omit<DashboardWidget, 'id'>
): Promise<DashboardWidget> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .insert({
      dashboard_id: dashboardId,
      title: widget.title,
      type: widget.type,
      module_id: widget.module_id || null,
      config: widget.config || {},
      width: widget.width || 6,
      height: widget.height || 4,
    })
    .select()
    .single();
  if (error) throw error;
  return mapWidget(data);
}

export async function sbDeleteWidget(widgetId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('dashboard_widgets').delete().eq('id', widgetId);
  if (error) throw error;
}

export async function sbUpdateWidget(
  widgetId: string,
  updates: Partial<DashboardWidget>
): Promise<DashboardWidget> {
  if (!supabase) throw new Error('Supabase not configured');
  const { id: _id, dashboard_id: _dashboardId, created_at: _createdAt, ...payload } = updates;
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .update(payload)
    .eq('id', widgetId)
    .select()
    .single();
  if (error) throw error;
  return mapWidget(data);
}

// ---------------------------------------------------------------------------
// WORKFLOWS
// ---------------------------------------------------------------------------

export async function sbListWorkflows(workspaceId: string): Promise<WorkflowRule[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('workflows')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });
  return (data || []).map(mapWorkflow);
}

export async function sbCreateWorkflow(
  workspaceId: string,
  workflow: Omit<WorkflowRule, 'id' | 'created_at' | 'updated_at'>
): Promise<WorkflowRule> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('workflows')
    .insert({
      workspace_id: workspaceId,
      name: workflow.name,
      description: workflow.description,
      is_active: workflow.is_active,
      trigger_module_id: workflow.trigger_module_id,
      trigger_type: workflow.trigger_type,
      conditions: workflow.conditions,
      actions: workflow.actions,
    })
    .select()
    .single();
  if (error) throw error;
  return mapWorkflow(data);
}

export async function sbUpdateWorkflow(
  workflowId: string,
  updates: Partial<WorkflowRule>
): Promise<WorkflowRule> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('workflows')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', workflowId)
    .select()
    .single();
  if (error) throw error;
  return mapWorkflow(data);
}

export async function sbDeleteWorkflow(workflowId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('workflows').delete().eq('id', workflowId);
  if (error) throw error;
}

export async function sbListWorkflowExecutions(
  workspaceId: string,
  limit = 20
): Promise<WorkflowExecution[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(mapWorkflowExecution);
}

// ---------------------------------------------------------------------------
// ACTIVITY LOGS
// ---------------------------------------------------------------------------

export async function sbLogActivity(
  workspaceId: string,
  userName: string,
  action: string,
  entityType: string,
  entityName: string
): Promise<void> {
  if (!supabase) return;
  await supabase.from('activity_logs').insert({
    workspace_id: workspaceId,
    user_name: userName,
    action,
    entity_type: entityType,
    entity_name: entityName,
  });
}

export async function sbListActivityLogs(
  workspaceId: string,
  limit = 20
): Promise<ActivityLog[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('timestamp', { ascending: false })
    .limit(limit);
  return (data || []).map(mapActivity);
}

// ---------------------------------------------------------------------------
// TEMPLATE SEEDING (create full workspace from TemplateDefinition in Supabase)
// ---------------------------------------------------------------------------

export async function sbCreateWorkspaceFromTemplate(
  userId: string,
  userEmail: string,
  userName: string,
  name: string,
  businessType: string,
  teamSize: string,
  template: TemplateDefinition
): Promise<Workspace> {
  if (!supabase) throw new Error('Supabase not configured');

  // 1. Create workspace
  const ws = await sbCreateWorkspace(name, businessType, teamSize, { email: userEmail, name: userName });

  // 3. Create a default dashboard
  const dashboard = await sbCreateDashboard(ws.id, 'Main Dashboard');

  // 4. Seed modules and fields from template
  const moduleIdMap: Record<string, string> = {}; // local template id -> supabase id

  for (let mi = 0; mi < template.modules.length; mi++) {
    const tmpl = template.modules[mi];

    // Create module
    const mod = await sbCreateModule(
      ws.id,
      tmpl.name,
      tmpl.icon,
      tmpl.color,
      tmpl.description
    );
    moduleIdMap[tmpl.id || tmpl.slug] = mod.id;

    // Create fields
    for (let fi = 0; fi < (tmpl.fields || []).length; fi++) {
      const f = tmpl.fields[fi];
      await sbCreateField(mod.id, f.name, f.type, f.config || {}, f.required || false, fi);
    }
  }

  // 5. Seed dashboard widgets
  if (template.dashboard_widgets) {
    for (let wi = 0; wi < template.dashboard_widgets.length; wi++) {
      const w = template.dashboard_widgets[wi];
      const supabaseModuleId = w.module_id ? moduleIdMap[w.module_id] : undefined;
      await sbCreateWidget(dashboard.id, {
        title: w.title,
        type: w.type,
        module_id: supabaseModuleId,
        config: w.config || {},
        width: w.width || 6,
        height: w.height || 4,
        position_x: 0,
        position_y: wi,
        dashboard_id: dashboard.id,
      });
    }
  }

  // 6. Log activity
  await sbLogActivity(ws.id, userName, 'created workspace', 'workspace', ws.name);

  return ws;
}

// ---------------------------------------------------------------------------
// ROW MAPPERS (DB row → TypeScript types)
// ---------------------------------------------------------------------------

function mapWorkspace(row: any): Workspace {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo_url: row.logo_url,
    business_type: row.business_type,
    team_size: row.team_size,
    accent_color: row.accent_color || '#C7F36B',
    currency: row.currency || 'USD',
    timezone: row.timezone || 'UTC',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapMember(row: any): WorkspaceMember {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    user_id: row.user_id,
    email: row.email,
    name: row.name,
    role: row.role,
    joined_at: row.joined_at,
  };
}

function mapModule(row: any): Module {
  const fields: Field[] = (row.fields || []).map(mapField).sort(
    (a: Field, b: Field) => (a.position ?? 0) - (b.position ?? 0)
  );
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    name: row.name,
    slug: row.slug,
    icon: row.icon || 'Boxes',
    description: row.description || '',
    color: row.color || '#C7F36B',
    position: row.position ?? 0,
    fields,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapField(row: any): Field {
  return {
    id: row.id,
    module_id: row.module_id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    config: row.config || {},
    position: row.position ?? 0,
    required: row.required || false,
    created_at: row.created_at,
  };
}

function mapRecord(row: any): FormaRecord {
  return {
    id: row.id,
    module_id: row.module_id,
    workspace_id: row.workspace_id,
    data: row.data || {},
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapDashboard(row: any): Dashboard {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    name: row.name,
    is_default: row.is_default,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapWidget(row: any): DashboardWidget {
  return {
    id: row.id,
    dashboard_id: row.dashboard_id,
    title: row.title,
    type: row.type,
    module_id: row.module_id,
    config: row.config || {},
    position_x: row.position_x ?? 0,
    position_y: row.position_y ?? 0,
    width: row.width ?? 6,
    height: row.height ?? 4,
    created_at: row.created_at,
  };
}

function mapWorkflow(row: any): WorkflowRule {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    name: row.name,
    description: row.description || '',
    is_active: row.is_active ?? true,
    trigger_module_id: row.trigger_module_id,
    trigger_type: row.trigger_type,
    conditions: row.conditions || [],
    actions: row.actions || [],
    execution_count: row.execution_count ?? 0,
    last_triggered_at: row.last_triggered_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapWorkflowExecution(row: any): WorkflowExecution {
  return {
    id: row.id,
    workflow_id: row.workflow_id,
    workspace_id: row.workspace_id,
    source_record_id: row.source_record_id || undefined,
    status: row.status,
    error_message: row.error_message || undefined,
    started_at: row.started_at,
    completed_at: row.completed_at || undefined,
  };
}

function mapActivity(row: any): ActivityLog {
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    user_name: row.user_name,
    action: row.action,
    entity_type: row.entity_type,
    entity_name: row.entity_name,
    timestamp: row.timestamp,
  };
}
