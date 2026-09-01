export type UserRole = 'owner' | 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  business_type: string;
  team_size: string;
  accent_color: string;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  joined_at: string;
}

export type FieldType =
  | 'text'
  | 'longtext'
  | 'number'
  | 'currency'
  | 'email'
  | 'phone'
  | 'date'
  | 'datetime'
  | 'checkbox'
  | 'select'
  | 'multiselect'
  | 'url'
  | 'file'
  | 'image'
  | 'relation';

export interface FieldConfig {
  placeholder?: string;
  options?: string[]; // For select, multiselect
  target_module_id?: string; // For relation
  display_field_slug?: string; // For relation
  default_value?: any;
  currency_symbol?: string; // For currency ($ € £ etc.)
  min?: number;
  max?: number;
  description?: string;
}

export interface Field {
  id: string;
  module_id: string;
  name: string;
  slug: string;
  type: FieldType;
  config: FieldConfig;
  position: number;
  required: boolean;
  created_at: string;
}

export interface Module {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  color?: string;
  position: number;
  created_at: string;
  updated_at: string;
  fields?: Field[];
}

export interface FormaRecord {
  id: string;
  module_id: string;
  workspace_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type WidgetType =
  | 'stat'
  | 'chart'
  | 'table'
  | 'recent_records'
  | 'calendar'
  | 'activity';

export interface WidgetConfig {
  metric_field?: string;
  aggregate?: 'count' | 'sum' | 'avg' | 'min' | 'max';
  chart_type?: 'bar' | 'line' | 'area';
  date_field?: string;
  group_by_field?: string;
  limit?: number;
  icon?: string;
  color?: string;
  subtitle?: string;
  compare_label?: string;
  compare_value?: string;
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  title: string;
  type: WidgetType;
  module_id?: string;
  config: WidgetConfig;
  position_x: number;
  position_y: number;
  width: number; // 1-12 columns
  height: number;
  created_at?: string;
}

export interface Dashboard {
  id: string;
  workspace_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type WorkflowTriggerType =
  | 'record_created'
  | 'record_updated'
  | 'record_deleted';

export type WorkflowActionType =
  | 'create_record'
  | 'update_record'
  | 'delete_record'
  | 'log_activity';

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_set';
  value: any;
}

export interface WorkflowAction {
  id: string;
  action_type: WorkflowActionType;
  target_module_id?: string;
  mapping?: Record<string, any>;
  description?: string;
}

export interface WorkflowRule {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger_module_id: string;
  trigger_type: WorkflowTriggerType;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  created_at: string;
  updated_at: string;
  execution_count?: number;
  last_triggered_at?: string;
}

export type WorkflowExecutionStatus = 'running' | 'succeeded' | 'failed' | 'skipped';

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workspace_id: string;
  source_record_id?: string;
  status: WorkflowExecutionStatus;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface ActivityLog {
  id: string;
  workspace_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_name: string;
  timestamp: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  tagline: string;
  category: string;
  description: string;
  icon: string;
  badge?: string;
  modules: {
    id?: string; // optional local ID; slug is the stable fallback for template mapping
    name: string;
    slug: string;
    icon: string;
    description: string;
    color: string;
    fields: {
      name: string;
      slug: string;
      type: FieldType;
      required: boolean;
      config: FieldConfig;
    }[];
    seed_records?: Record<string, any>[];
  }[];
  dashboard_widgets?: {
    title: string;
    type: WidgetType;
    module_id?: string; // references modules[].id (template-local ID)
    module_slug?: string;
    config: WidgetConfig;
    width: number;
    height: number;
  }[];
  widgets: {
    title: string;
    type: WidgetType;
    module_slug?: string;
    config: WidgetConfig;
    width: number;
    height: number;
  }[];
  workflows: {
    name: string;
    description: string;
    trigger_module_slug: string;
    trigger_type: WorkflowTriggerType;
    conditions: WorkflowCondition[];
    actions: {
      action_type: WorkflowActionType;
      target_module_slug?: string;
      mapping?: Record<string, any>;
      description?: string;
    }[];
  }[];
}
