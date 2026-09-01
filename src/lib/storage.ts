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
  TemplateDefinition
} from '@/types';
import { generateId, slugify, applyWorkspaceAccentColor } from './utils';
import { TEMPLATE_PRESETS } from '@/features/templates/templatePresets';

const STORAGE_KEYS = {
  WORKSPACES: 'forma_workspaces_v1',
  MEMBERS: 'forma_workspace_members_v1',
  MODULES: 'forma_modules_v1',
  FIELDS: 'forma_fields_v1',
  RECORDS: 'forma_records_v1',
  DASHBOARDS: 'forma_dashboards_v1',
  WIDGETS: 'forma_dashboard_widgets_v1',
  WORKFLOWS: 'forma_workflows_v1',
  WORKFLOW_EXECUTIONS: 'forma_workflow_executions_v1',
  ACTIVITIES: 'forma_activities_v1',
  CURRENT_WS: 'forma_active_workspace_id_v1',
};

// Simple event-based reactive dispatcher for cross-component cache sync
class StorageEventEmitter {
  private listeners: Map<string, Set<() => void>> = new Map();

  subscribe(key: string, callback: () => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  notify(key: string) {
    this.listeners.get(key)?.forEach((cb) => cb());
    this.listeners.get('*')?.forEach((cb) => cb());
  }
}

export const storageEvents = new StorageEventEmitter();

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    storageEvents.notify(key);
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// -------------------------------------------------------------
// WORKSPACES & TEMPLATE SEEDING ENGINE
// -------------------------------------------------------------

export function listWorkspaces(): Workspace[] {
  let list = getStored<Workspace[]>(STORAGE_KEYS.WORKSPACES, []);
  if (list.length === 0) {
    // Automatically seed a premier starting workspace from Freelancer & Studio OS template
    const defaultWs = createWorkspaceFromTemplate(
      'KRONOS Design Studio',
      'Studio / Agency',
      '1-5',
      TEMPLATE_PRESETS[0]
    );
    list = [defaultWs];
  }
  return list;
}

export function ensureDemoWorkspace(): Workspace {
  let list = getStored<Workspace[]>(STORAGE_KEYS.WORKSPACES, []);
  let demoWs = list.find((w) => w.name.includes('KRONOS') || w.name.includes('Studio') || w.name.includes('Freelancer'));

  // If no workspace exists or if records are empty, create or reseed a rich demo workspace
  const allRecords = getStored<FormaRecord[]>(STORAGE_KEYS.RECORDS, []);
  if (!demoWs || allRecords.length === 0) {
    demoWs = createWorkspaceFromTemplate(
      'KRONOS Design Studio',
      'Studio / Agency',
      '1-5',
      TEMPLATE_PRESETS[0]
    );
  }

  setActiveWorkspaceId(demoWs.id);
  applyWorkspaceAccentColor(demoWs.accent_color || '#C7F36B');
  return demoWs;
}

export function getActiveWorkspaceId(): string {
  const current = localStorage.getItem(STORAGE_KEYS.CURRENT_WS);
  if (current) return current;
  const workspaces = listWorkspaces();
  if (workspaces.length > 0) {
    setActiveWorkspaceId(workspaces[0].id);
    return workspaces[0].id;
  }
  return '';
}

export function setActiveWorkspaceId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_WS, id);
  storageEvents.notify(STORAGE_KEYS.CURRENT_WS);
}

export function getWorkspace(id: string): Workspace | undefined {
  const list = listWorkspaces();
  return list.find((w) => w.id === id);
}

export function updateWorkspace(id: string, updates: Partial<Workspace>): Workspace {
  const list = listWorkspaces();
  const index = list.findIndex((w) => w.id === id);
  if (index === -1) throw new Error('Workspace not found');

  const updated: Workspace = {
    ...list[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  list[index] = updated;
  setStored(STORAGE_KEYS.WORKSPACES, list);
  return updated;
}

export function createWorkspaceFromTemplate(
  name: string,
  business_type: string,
  team_size: string,
  template: TemplateDefinition
): Workspace {
  const wsId = generateId();
  const wsSlug = slugify(name) + '-' + Math.floor(1000 + Math.random() * 9000);

  const workspace: Workspace = {
    id: wsId,
    name,
    slug: wsSlug,
    business_type,
    team_size,
    accent_color: '#C7F36B',
    currency: '$',
    timezone: 'UTC-5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Save Workspace
  const allWorkspaces = getStored<Workspace[]>(STORAGE_KEYS.WORKSPACES, []);
  allWorkspaces.push(workspace);
  setStored(STORAGE_KEYS.WORKSPACES, allWorkspaces);

  // 2. Save Owner Member
  const allMembers = getStored<WorkspaceMember[]>(STORAGE_KEYS.MEMBERS, []);
  allMembers.push({
    id: generateId(),
    workspace_id: wsId,
    user_id: 'user_owner',
    name: 'Business Owner',
    email: 'owner@forma.dev',
    role: 'owner',
    joined_at: new Date().toISOString(),
  });
  setStored(STORAGE_KEYS.MEMBERS, allMembers);

  // 3. Instantiate Modules and Fields
  const allModules = getStored<Module[]>(STORAGE_KEYS.MODULES, []);
  const allFields = getStored<Field[]>(STORAGE_KEYS.FIELDS, []);
  const allRecords = getStored<FormaRecord[]>(STORAGE_KEYS.RECORDS, []);

  const moduleSlugToIdMap = new Map<string, string>();

  template.modules.forEach((modDef, idx) => {
    const modId = generateId();
    moduleSlugToIdMap.set(modDef.slug, modId);

    const newModule: Module = {
      id: modId,
      workspace_id: wsId,
      name: modDef.name,
      slug: modDef.slug,
      icon: modDef.icon,
      description: modDef.description,
      color: modDef.color,
      position: idx,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    allModules.push(newModule);

    // Fields
    modDef.fields.forEach((fDef, fIdx) => {
      const fieldId = generateId();
      const newField: Field = {
        id: fieldId,
        module_id: modId,
        name: fDef.name,
        slug: fDef.slug,
        type: fDef.type,
        config: fDef.config,
        position: fIdx,
        required: fDef.required,
        created_at: new Date().toISOString(),
      };
      allFields.push(newField);
    });

    // Seed records if provided
    if (modDef.seed_records) {
      modDef.seed_records.forEach((recordData) => {
        allRecords.push({
          id: generateId(),
          module_id: modId,
          workspace_id: wsId,
          data: recordData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });
    }
  });

  setStored(STORAGE_KEYS.MODULES, allModules);
  setStored(STORAGE_KEYS.FIELDS, allFields);
  setStored(STORAGE_KEYS.RECORDS, allRecords);

  // 4. Create Dashboard & Widgets
  const dashId = generateId();
  const allDashboards = getStored<Dashboard[]>(STORAGE_KEYS.DASHBOARDS, []);
  const allWidgets = getStored<DashboardWidget[]>(STORAGE_KEYS.WIDGETS, []);

  allDashboards.push({
    id: dashId,
    workspace_id: wsId,
    name: `${name} Command Center`,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  template.widgets.forEach((wDef, wIdx) => {
    const targetModId = wDef.module_slug ? moduleSlugToIdMap.get(wDef.module_slug) : undefined;
    allWidgets.push({
      id: generateId(),
      dashboard_id: dashId,
      title: wDef.title,
      type: wDef.type,
      module_id: targetModId,
      config: wDef.config,
      position_x: (wIdx % 4) * 3,
      position_y: Math.floor(wIdx / 4) * 2,
      width: wDef.width,
      height: wDef.height,
    });
  });

  setStored(STORAGE_KEYS.DASHBOARDS, allDashboards);
  setStored(STORAGE_KEYS.WIDGETS, allWidgets);

  // 5. Workflows
  const allWorkflows = getStored<WorkflowRule[]>(STORAGE_KEYS.WORKFLOWS, []);
  template.workflows.forEach((wfDef) => {
    const triggerModId = moduleSlugToIdMap.get(wfDef.trigger_module_slug);
    if (triggerModId) {
      allWorkflows.push({
        id: generateId(),
        workspace_id: wsId,
        name: wfDef.name,
        description: wfDef.description,
        is_active: true,
        trigger_module_id: triggerModId,
        trigger_type: wfDef.trigger_type,
        conditions: wfDef.conditions,
        actions: wfDef.actions.map((act) => ({
          id: generateId(),
          action_type: act.action_type,
          target_module_id: act.target_module_slug ? moduleSlugToIdMap.get(act.target_module_slug) : undefined,
          mapping: act.mapping,
          description: act.description,
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        execution_count: 0,
      });
    }
  });
  setStored(STORAGE_KEYS.WORKFLOWS, allWorkflows);

  // 6. Activity log
  logActivity(wsId, 'Alex Vance', 'received payment for', 'Invoice INV-2026-094 ($7,800)', 'Solstice Fashion House');
  logActivity(wsId, 'Alex Vance', 'moved project status to In Review', 'SaaS Core Analytics Dashboard', 'Apex Venture Lab');
  logActivity(wsId, 'Alex Vance', 'issued new invoice', 'Invoice INV-2026-098 ($3,200)', 'Nordic Roast Co');
  logActivity(wsId, 'Alex Vance', 'onboarded new enterprise client', 'Aether AI Research', 'Elena Vance');
  logActivity(wsId, 'Alex Vance', 'logged business expense', 'Apple Studio Display 27"', 'Equipment');
  logActivity(wsId, 'System', 'provisioned custom operating system', 'Workspace OS', name);

  setActiveWorkspaceId(wsId);
  return workspace;
}

// -------------------------------------------------------------
// MODULES API
// -------------------------------------------------------------

export function listModules(workspaceId: string): Module[] {
  const all = getStored<Module[]>(STORAGE_KEYS.MODULES, []);
  const allFields = getStored<Field[]>(STORAGE_KEYS.FIELDS, []);

  return all
    .filter((m) => m.workspace_id === workspaceId)
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      ...m,
      fields: allFields
        .filter((f) => f.module_id === m.id)
        .sort((a, b) => a.position - b.position),
    }));
}

export function getModule(moduleId: string): Module | undefined {
  const all = getStored<Module[]>(STORAGE_KEYS.MODULES, []);
  const mod = all.find((m) => m.id === moduleId);
  if (!mod) return undefined;

  const allFields = getStored<Field[]>(STORAGE_KEYS.FIELDS, []);
  return {
    ...mod,
    fields: allFields
      .filter((f) => f.module_id === mod.id)
      .sort((a, b) => a.position - b.position),
  };
}

export function createModule(
  workspaceId: string,
  data: { name: string; icon: string; description?: string; color?: string }
): Module {
  const all = getStored<Module[]>(STORAGE_KEYS.MODULES, []);
  const wsModules = all.filter((m) => m.workspace_id === workspaceId);

  const newModule: Module = {
    id: generateId(),
    workspace_id: workspaceId,
    name: data.name.trim(),
    slug: slugify(data.name) || `mod_${Date.now().toString(36)}`,
    icon: data.icon || 'Boxes',
    description: data.description || '',
    color: data.color || '#C7F36B',
    position: wsModules.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  all.push(newModule);
  setStored(STORAGE_KEYS.MODULES, all);

  // Create initial default name field
  createField(newModule.id, {
    name: `${data.name.trim()} Name`,
    type: 'text',
    required: true,
    config: { placeholder: `Enter ${data.name.toLowerCase()} name` },
  });

  logActivity(workspaceId, 'Owner', 'created module', 'Module', newModule.name);
  return newModule;
}

export function updateModule(moduleId: string, updates: Partial<Module>): Module {
  const all = getStored<Module[]>(STORAGE_KEYS.MODULES, []);
  const idx = all.findIndex((m) => m.id === moduleId);
  if (idx === -1) throw new Error('Module not found');

  const updated: Module = {
    ...all[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  all[idx] = updated;
  setStored(STORAGE_KEYS.MODULES, all);
  return updated;
}

export function deleteModule(moduleId: string): void {
  const all = getStored<Module[]>(STORAGE_KEYS.MODULES, []);
  const target = all.find((m) => m.id === moduleId);
  if (!target) return;

  // Remove module
  const filtered = all.filter((m) => m.id !== moduleId);
  setStored(STORAGE_KEYS.MODULES, filtered);

  // Remove child fields
  const allFields = getStored<Field[]>(STORAGE_KEYS.FIELDS, []).filter((f) => f.module_id !== moduleId);
  setStored(STORAGE_KEYS.FIELDS, allFields);

  // Remove child records
  const allRecords = getStored<FormaRecord[]>(STORAGE_KEYS.RECORDS, []).filter((r) => r.module_id !== moduleId);
  setStored(STORAGE_KEYS.RECORDS, allRecords);

  // Clean widgets referencing this module
  const allWidgets = getStored<DashboardWidget[]>(STORAGE_KEYS.WIDGETS, []).filter((w) => w.module_id !== moduleId);
  setStored(STORAGE_KEYS.WIDGETS, allWidgets);

  logActivity(target.workspace_id, 'Owner', 'deleted module', 'Module', target.name);
}

// -------------------------------------------------------------
// FIELDS API
// -------------------------------------------------------------

export function listFields(moduleId: string): Field[] {
  const all = getStored<Field[]>(STORAGE_KEYS.FIELDS, []);
  return all.filter((f) => f.module_id === moduleId).sort((a, b) => a.position - b.position);
}

export function createField(
  moduleId: string,
  data: { name: string; type: Field['type']; required?: boolean; config?: Field['config'] }
): Field {
  const all = getStored<Field[]>(STORAGE_KEYS.FIELDS, []);
  const modFields = all.filter((f) => f.module_id === moduleId);

  const newField: Field = {
    id: generateId(),
    module_id: moduleId,
    name: data.name.trim(),
    slug: slugify(data.name) || `field_${Date.now().toString(36)}`,
    type: data.type,
    config: data.config || {},
    position: modFields.length,
    required: Boolean(data.required),
    created_at: new Date().toISOString(),
  };

  all.push(newField);
  setStored(STORAGE_KEYS.FIELDS, all);
  return newField;
}

export function updateField(fieldId: string, updates: Partial<Field>): Field {
  const all = getStored<Field[]>(STORAGE_KEYS.FIELDS, []);
  const idx = all.findIndex((f) => f.id === fieldId);
  if (idx === -1) throw new Error('Field not found');

  const updated: Field = {
    ...all[idx],
    ...updates,
  };
  all[idx] = updated;
  setStored(STORAGE_KEYS.FIELDS, all);
  return updated;
}

export function deleteField(fieldId: string): void {
  const all = getStored<Field[]>(STORAGE_KEYS.FIELDS, []);
  const filtered = all.filter((f) => f.id !== fieldId);
  setStored(STORAGE_KEYS.FIELDS, filtered);
}

export function reorderFields(moduleId: string, orderedFieldIds: string[]): void {
  const all = getStored<Field[]>(STORAGE_KEYS.FIELDS, []);
  orderedFieldIds.forEach((id, index) => {
    const field = all.find((f) => f.id === id);
    if (field) field.position = index;
  });
  setStored(STORAGE_KEYS.FIELDS, all);
}

// -------------------------------------------------------------
// RECORDS API
// -------------------------------------------------------------

export interface RecordQueryParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
}

export function listRecords(
  moduleId: string,
  params: RecordQueryParams = {}
): { records: FormaRecord[]; totalCount: number; totalPages: number } {
  const all = getStored<FormaRecord[]>(STORAGE_KEYS.RECORDS, []);
  let filtered = all.filter((r) => r.module_id === moduleId);

  // Live text search across all dynamic data fields
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter((r) => {
      return Object.values(r.data).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }

  // Field filters
  if (params.filters) {
    Object.entries(params.filters).forEach(([fieldSlug, filterValue]) => {
      if (filterValue !== undefined && filterValue !== '' && filterValue !== 'ALL') {
        filtered = filtered.filter((r) => {
          const val = r.data[fieldSlug];
          if (typeof filterValue === 'boolean') {
            return Boolean(val) === filterValue;
          }
          return String(val).toLowerCase() === String(filterValue).toLowerCase();
        });
      }
    });
  }

  // Sorting
  if (params.sortBy) {
    const key = params.sortBy;
    const isAsc = params.sortOrder === 'asc';
    filtered.sort((a, b) => {
      const valA = a.data[key] ?? a.created_at;
      const valB = b.data[key] ?? b.created_at;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return isAsc ? valA - valB : valB - valA;
      }
      return isAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  } else {
    // Default newest first
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const totalCount = filtered.length;
  const pageSize = params.pageSize || 10;
  const page = params.page || 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    records: paginated,
    totalCount,
    totalPages,
  };
}

export function getAllRecordsForModule(moduleId: string): FormaRecord[] {
  const all = getStored<FormaRecord[]>(STORAGE_KEYS.RECORDS, []);
  return all.filter((r) => r.module_id === moduleId);
}

export function getRecord(recordId: string): FormaRecord | undefined {
  const all = getStored<FormaRecord[]>(STORAGE_KEYS.RECORDS, []);
  return all.find((r) => r.id === recordId);
}

export function createRecord(
  moduleId: string,
  workspaceId: string,
  data: Record<string, any>
): FormaRecord {
  const all = getStored<FormaRecord[]>(STORAGE_KEYS.RECORDS, []);
  const newRecord: FormaRecord = {
    id: generateId(),
    module_id: moduleId,
    workspace_id: workspaceId,
    data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  all.unshift(newRecord);
  setStored(STORAGE_KEYS.RECORDS, all);

  // Trigger workflows
  triggerWorkflows(workspaceId, moduleId, 'record_created', newRecord);

  const mod = getModule(moduleId);
  const primaryName = data.name || data.title || data.full_name || data.company_name || 'Record';
  logActivity(workspaceId, 'User', 'created record', mod?.name || 'Record', String(primaryName));

  return newRecord;
}

export function updateRecord(recordId: string, data: Record<string, any>): FormaRecord {
  const all = getStored<FormaRecord[]>(STORAGE_KEYS.RECORDS, []);
  const idx = all.findIndex((r) => r.id === recordId);
  if (idx === -1) throw new Error('Record not found');

  const updated: FormaRecord = {
    ...all[idx],
    data: {
      ...all[idx].data,
      ...data,
    },
    updated_at: new Date().toISOString(),
  };

  all[idx] = updated;
  setStored(STORAGE_KEYS.RECORDS, all);

  // Trigger workflows
  triggerWorkflows(updated.workspace_id, updated.module_id, 'record_updated', updated);

  const mod = getModule(updated.module_id);
  const primaryName = data.name || data.title || data.full_name || data.company_name || 'Record';
  logActivity(updated.workspace_id, 'User', 'updated record', mod?.name || 'Record', String(primaryName));

  return updated;
}

export function deleteRecord(recordId: string): void {
  const all = getStored<FormaRecord[]>(STORAGE_KEYS.RECORDS, []);
  const target = all.find((r) => r.id === recordId);
  if (!target) return;

  const filtered = all.filter((r) => r.id !== recordId);
  setStored(STORAGE_KEYS.RECORDS, filtered);

  triggerWorkflows(target.workspace_id, target.module_id, 'record_deleted', target);

  const mod = getModule(target.module_id);
  logActivity(target.workspace_id, 'User', 'deleted record', mod?.name || 'Record', `#${recordId.slice(-4)}`);
}

// -------------------------------------------------------------
// DASHBOARD & WIDGETS API
// -------------------------------------------------------------

export function getDashboardForWorkspace(workspaceId: string): { dashboard: Dashboard; widgets: DashboardWidget[] } {
  let allDashboards = getStored<Dashboard[]>(STORAGE_KEYS.DASHBOARDS, []);
  let dash = allDashboards.find((d) => d.workspace_id === workspaceId);

  if (!dash) {
    dash = {
      id: generateId(),
      workspace_id: workspaceId,
      name: 'Business Command Center',
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    allDashboards.push(dash);
    setStored(STORAGE_KEYS.DASHBOARDS, allDashboards);
  }

  const allWidgets = getStored<DashboardWidget[]>(STORAGE_KEYS.WIDGETS, []);
  const widgets = allWidgets.filter((w) => w.dashboard_id === dash!.id);

  return { dashboard: dash!, widgets };
}

export function addDashboardWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id' | 'dashboard_id'>): DashboardWidget {
  const allWidgets = getStored<DashboardWidget[]>(STORAGE_KEYS.WIDGETS, []);
  const newWidget: DashboardWidget = {
    ...widget,
    id: generateId(),
    dashboard_id: dashboardId,
  };
  allWidgets.push(newWidget);
  setStored(STORAGE_KEYS.WIDGETS, allWidgets);
  return newWidget;
}

export function updateDashboardWidget(widgetId: string, updates: Partial<DashboardWidget>): DashboardWidget {
  const allWidgets = getStored<DashboardWidget[]>(STORAGE_KEYS.WIDGETS, []);
  const idx = allWidgets.findIndex((w) => w.id === widgetId);
  if (idx === -1) throw new Error('Widget not found');

  const updated = { ...allWidgets[idx], ...updates };
  allWidgets[idx] = updated;
  setStored(STORAGE_KEYS.WIDGETS, allWidgets);
  return updated;
}

export function deleteDashboardWidget(widgetId: string): void {
  const allWidgets = getStored<DashboardWidget[]>(STORAGE_KEYS.WIDGETS, []);
  const filtered = allWidgets.filter((w) => w.id !== widgetId);
  setStored(STORAGE_KEYS.WIDGETS, filtered);
}

// -------------------------------------------------------------
// WORKFLOW ENGINE
// -------------------------------------------------------------

export function listWorkflows(workspaceId: string): WorkflowRule[] {
  const all = getStored<WorkflowRule[]>(STORAGE_KEYS.WORKFLOWS, []);
  return all.filter((w) => w.workspace_id === workspaceId);
}

export function createWorkflow(workspaceId: string, data: Omit<WorkflowRule, 'id' | 'workspace_id' | 'created_at' | 'updated_at'>): WorkflowRule {
  const all = getStored<WorkflowRule[]>(STORAGE_KEYS.WORKFLOWS, []);
  const newWf: WorkflowRule = {
    ...data,
    id: generateId(),
    workspace_id: workspaceId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    execution_count: 0,
  };
  all.push(newWf);
  setStored(STORAGE_KEYS.WORKFLOWS, all);
  return newWf;
}

export function updateWorkflow(workflowId: string, updates: Partial<WorkflowRule>): WorkflowRule {
  const all = getStored<WorkflowRule[]>(STORAGE_KEYS.WORKFLOWS, []);
  const idx = all.findIndex((w) => w.id === workflowId);
  if (idx === -1) throw new Error('Workflow not found');

  const updated = {
    ...all[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  all[idx] = updated;
  setStored(STORAGE_KEYS.WORKFLOWS, all);
  return updated;
}

export function deleteWorkflow(workflowId: string): void {
  const all = getStored<WorkflowRule[]>(STORAGE_KEYS.WORKFLOWS, []);
  setStored(STORAGE_KEYS.WORKFLOWS, all.filter((w) => w.id !== workflowId));
}

export function listWorkflowExecutions(workspaceId: string, limit = 20): WorkflowExecution[] {
  const all = getStored<WorkflowExecution[]>(STORAGE_KEYS.WORKFLOW_EXECUTIONS, []);
  return all
    .filter((execution) => execution.workspace_id === workspaceId)
    .sort((a, b) => b.started_at.localeCompare(a.started_at))
    .slice(0, limit);
}

function triggerWorkflows(
  workspaceId: string,
  moduleId: string,
  triggerType: WorkflowRule['trigger_type'],
  record: FormaRecord
) {
  const workflows = listWorkflows(workspaceId).filter(
    (w) => w.is_active && w.trigger_module_id === moduleId && w.trigger_type === triggerType
  );

  workflows.forEach((wf) => {
    // Evaluate conditions
    const match = wf.conditions.every((cond) => {
      const recordVal = record.data[cond.field];
      if (cond.operator === 'equals') return String(recordVal) === String(cond.value);
      if (cond.operator === 'not_equals') return String(recordVal) !== String(cond.value);
      if (cond.operator === 'contains') return String(recordVal).toLowerCase().includes(String(cond.value).toLowerCase());
      if (cond.operator === 'greater_than') return Number(recordVal) > Number(cond.value);
      if (cond.operator === 'less_than') return Number(recordVal) < Number(cond.value);
      if (cond.operator === 'is_set') return recordVal !== undefined && recordVal !== null && recordVal !== '';
      return true;
    });

    if (match) {
      const execution: WorkflowExecution = {
        id: generateId(),
        workflow_id: wf.id,
        workspace_id: workspaceId,
        source_record_id: record.id,
        status: 'running',
        started_at: new Date().toISOString(),
      };
      const executions = getStored<WorkflowExecution[]>(STORAGE_KEYS.WORKFLOW_EXECUTIONS, []);
      executions.unshift(execution);
      setStored(STORAGE_KEYS.WORKFLOW_EXECUTIONS, executions.slice(0, 100));

      try {
        wf.actions.forEach((act) => {
          if (act.action_type === 'log_activity') {
            logActivity(workspaceId, 'Workflow Automation', 'executed', wf.name, act.description || 'Action triggered');
          } else if (act.action_type === 'create_record' && act.target_module_id) {
            createRecord(act.target_module_id, workspaceId, act.mapping || {});
          }
        });

        updateWorkflow(wf.id, {
          execution_count: (wf.execution_count || 0) + 1,
          last_triggered_at: new Date().toISOString(),
        });
        const completed = getStored<WorkflowExecution[]>(STORAGE_KEYS.WORKFLOW_EXECUTIONS, []);
        const index = completed.findIndex((item) => item.id === execution.id);
        if (index >= 0) {
          completed[index] = { ...completed[index], status: 'succeeded', completed_at: new Date().toISOString() };
          setStored(STORAGE_KEYS.WORKFLOW_EXECUTIONS, completed);
        }
      } catch (error) {
        const failed = getStored<WorkflowExecution[]>(STORAGE_KEYS.WORKFLOW_EXECUTIONS, []);
        const index = failed.findIndex((item) => item.id === execution.id);
        if (index >= 0) {
          failed[index] = {
            ...failed[index],
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Workflow action failed',
            completed_at: new Date().toISOString(),
          };
          setStored(STORAGE_KEYS.WORKFLOW_EXECUTIONS, failed);
        }
      }
    }
  });
}

// -------------------------------------------------------------
// ACTIVITY LOGS API
// -------------------------------------------------------------

export function listActivityLogs(workspaceId: string, limit: number = 20): ActivityLog[] {
  const all = getStored<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, []);
  return all
    .filter((a) => a.workspace_id === workspaceId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function logActivity(
  workspaceId: string,
  userName: string,
  action: string,
  entityType: string,
  entityName: string
): void {
  const all = getStored<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, []);
  all.unshift({
    id: generateId(),
    workspace_id: workspaceId,
    user_name: userName,
    action,
    entity_type: entityType,
    entity_name: entityName,
    timestamp: new Date().toISOString(),
  });
  setStored(STORAGE_KEYS.ACTIVITIES, all.slice(0, 100)); // retain last 100
}

// -------------------------------------------------------------
// MEMBERS & ROLES
// -------------------------------------------------------------

export function listWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
  const all = getStored<WorkspaceMember[]>(STORAGE_KEYS.MEMBERS, []);
  return all.filter((m) => m.workspace_id === workspaceId);
}

export function addWorkspaceMember(
  workspaceId: string,
  email: string,
  name: string,
  role: WorkspaceMember['role']
): WorkspaceMember {
  const all = getStored<WorkspaceMember[]>(STORAGE_KEYS.MEMBERS, []);
  const newMember: WorkspaceMember = {
    id: generateId(),
    workspace_id: workspaceId,
    user_id: `usr_${Date.now().toString(36)}`,
    email,
    name,
    role,
    joined_at: new Date().toISOString(),
  };
  all.push(newMember);
  setStored(STORAGE_KEYS.MEMBERS, all);
  logActivity(workspaceId, 'Owner', 'invited team member', 'Member', `${name} (${role})`);
  return newMember;
}

export function removeWorkspaceMember(memberId: string): void {
  const all = getStored<WorkspaceMember[]>(STORAGE_KEYS.MEMBERS, []);
  setStored(STORAGE_KEYS.MEMBERS, all.filter((m) => m.id !== memberId));
}
