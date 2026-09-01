-- ==============================================================================
-- FORMA Business OS Builder — Production Supabase PostgreSQL Schema with RLS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    business_type VARCHAR(100) DEFAULT 'Other',
    team_size VARCHAR(50) DEFAULT '1-5',
    accent_color VARCHAR(30) DEFAULT '#C7F36B',
    currency VARCHAR(10) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKSPACE MEMBERS
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee', -- 'owner', 'admin', 'employee'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- 3. MODULES (e.g. Customers, Appointments, Invoices, Inventory)
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    icon VARCHAR(100) DEFAULT 'Boxes',
    description TEXT,
    color VARCHAR(30) DEFAULT '#C7F36B',
    position INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, slug)
);

-- 4. FIELDS (Metadata schema for dynamic fields in each module)
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'text', 'number', 'currency', 'select', 'relation', etc.
    config JSONB DEFAULT '{}'::jsonb,
    position INT DEFAULT 0,
    required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, slug)
);

-- 5. RECORDS (Dynamic records stored in JSONB)
CREATE TABLE IF NOT EXISTS public.records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DASHBOARDS & WIDGETS
CREATE TABLE IF NOT EXISTS public.dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Main Dashboard',
    is_default BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'stat', 'chart', 'table', 'recent_records', 'activity'
    module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
    config JSONB DEFAULT '{}'::jsonb,
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    width INT DEFAULT 6,
    height INT DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WORKFLOWS
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    trigger_module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    trigger_type VARCHAR(50) NOT NULL, -- 'record_created', 'record_updated', 'record_deleted'
    conditions JSONB DEFAULT '[]'::jsonb,
    actions JSONB DEFAULT '[]'::jsonb,
    execution_count INT DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7b. WORKFLOW EXECUTION HISTORY
-- Kept separately from workflows so operators can audit failures and retry
-- safely without mutating the workflow definition itself.
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    source_record_id UUID,
    status VARCHAR(30) NOT NULL DEFAULT 'running', -- 'running', 'succeeded', 'failed', 'skipped'
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 8. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_name VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_name VARCHAR(150) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_modules_workspace ON public.modules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_fields_module ON public.fields(module_id);
CREATE INDEX IF NOT EXISTS idx_records_workspace ON public.records(workspace_id);
CREATE INDEX IF NOT EXISTS idx_records_module ON public.records(module_id);
CREATE INDEX IF NOT EXISTS idx_records_gin_data ON public.records USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_widgets_dashboard ON public.dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON public.workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON public.workflow_executions(workflow_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workspace ON public.workflow_executions(workspace_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_workspace ON public.activity_logs(workspace_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check if authenticated user belongs to workspace
CREATE OR REPLACE FUNCTION public.is_member_of_workspace(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user is owner/admin of workspace
CREATE OR REPLACE FUNCTION public.is_admin_of_workspace(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a workspace and its owner membership in one authorized transaction.
-- This avoids the RLS bootstrap gap where a user could create a workspace but
-- was not yet allowed to add themself as its first member.
CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(
  workspace_name TEXT,
  workspace_slug TEXT,
  workspace_business_type TEXT,
  workspace_team_size TEXT,
  owner_email TEXT,
  owner_name TEXT
)
RETURNS public.workspaces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created_workspace public.workspaces;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.workspaces (name, slug, business_type, team_size)
  VALUES (workspace_name, workspace_slug, workspace_business_type, workspace_team_size)
  RETURNING * INTO created_workspace;

  INSERT INTO public.workspace_members (workspace_id, user_id, email, name, role)
  VALUES (created_workspace.id, auth.uid(), owner_email, owner_name, 'owner');

  RETURN created_workspace;
END;
$$;

REVOKE ALL ON FUNCTION public.create_workspace_with_owner(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_workspace_with_owner(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Policies: WORKSPACES
CREATE POLICY "Users can view workspaces they are members of"
    ON public.workspaces FOR SELECT
    USING (public.is_member_of_workspace(id));

CREATE POLICY "Authenticated users can create workspaces"
    ON public.workspaces FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Workspace owners/admins can update workspace"
    ON public.workspaces FOR UPDATE
    USING (public.is_admin_of_workspace(id));

-- Policies: WORKSPACE MEMBERS
CREATE POLICY "Members can view other members of their workspace"
    ON public.workspace_members FOR SELECT
    USING (public.is_member_of_workspace(workspace_id));

CREATE POLICY "Workspace admins can manage members"
    ON public.workspace_members FOR ALL
    USING (public.is_admin_of_workspace(workspace_id));

-- Policies: MODULES
CREATE POLICY "Members can view modules of their workspace"
    ON public.modules FOR SELECT
    USING (public.is_member_of_workspace(workspace_id));

CREATE POLICY "Workspace admins can manage modules"
    ON public.modules FOR ALL
    USING (public.is_admin_of_workspace(workspace_id));

-- Policies: FIELDS
CREATE POLICY "Members can view fields of modules in their workspace"
    ON public.fields FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.modules m
        WHERE m.id = fields.module_id AND public.is_member_of_workspace(m.workspace_id)
      )
    );

CREATE POLICY "Workspace admins can manage fields"
    ON public.fields FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.modules m
        WHERE m.id = fields.module_id AND public.is_admin_of_workspace(m.workspace_id)
      )
    );

-- Policies: RECORDS
CREATE POLICY "Members can view records of their workspace"
    ON public.records FOR SELECT
    USING (public.is_member_of_workspace(workspace_id));

CREATE POLICY "Members can insert records in their workspace"
    ON public.records FOR INSERT
    WITH CHECK (public.is_member_of_workspace(workspace_id));

CREATE POLICY "Members can update records in their workspace"
    ON public.records FOR UPDATE
    USING (public.is_member_of_workspace(workspace_id));

CREATE POLICY "Members can delete records in their workspace"
    ON public.records FOR DELETE
    USING (public.is_member_of_workspace(workspace_id));

-- Policies: DASHBOARDS & WIDGETS
CREATE POLICY "Members can view dashboards of their workspace"
    ON public.dashboards FOR SELECT
    USING (public.is_member_of_workspace(workspace_id));

CREATE POLICY "Workspace admins can manage dashboards"
    ON public.dashboards FOR ALL
    USING (public.is_admin_of_workspace(workspace_id));

CREATE POLICY "Members can view widgets of their workspace dashboards"
    ON public.dashboard_widgets FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id AND public.is_member_of_workspace(d.workspace_id)
      )
    );

CREATE POLICY "Workspace admins can manage widgets"
    ON public.dashboard_widgets FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id AND public.is_admin_of_workspace(d.workspace_id)
      )
    );

-- Policies: WORKFLOWS
CREATE POLICY "Members can view workflows of their workspace"
    ON public.workflows FOR SELECT
    USING (public.is_member_of_workspace(workspace_id));

CREATE POLICY "Workspace admins can manage workflows"
    ON public.workflows FOR ALL
    USING (public.is_admin_of_workspace(workspace_id));

-- Policies: WORKFLOW EXECUTIONS
CREATE POLICY "Members can view workflow executions of their workspace"
    ON public.workflow_executions FOR SELECT
    USING (public.is_member_of_workspace(workspace_id));

-- Execution rows are written only by the security-definer workflow engine.

-- ============================================================================== 
-- SERVER-SIDE WORKFLOW ENGINE
-- ============================================================================== 
-- Runs after a record mutation, writes an execution history row, and supports
-- the actions currently exposed by the Builder: log_activity and create_record.
-- Nested records created by a workflow do not trigger another workflow pass;
-- this is deliberate loop protection for the initial automation engine.
CREATE OR REPLACE FUNCTION public.execute_record_workflows()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_type TEXT;
  event_workspace_id UUID;
  event_module_id UUID;
  event_record_id UUID;
  event_data JSONB;
  wf public.workflows%ROWTYPE;
  action JSONB;
  condition JSONB;
  execution_id UUID;
  conditions_match BOOLEAN;
  record_value TEXT;
BEGIN
  -- Prevent an automation-created record from recursively invoking automation.
  IF pg_trigger_depth() > 1 THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    event_type := 'record_created';
    event_workspace_id := NEW.workspace_id;
    event_module_id := NEW.module_id;
    event_record_id := NEW.id;
    event_data := NEW.data;
  ELSIF TG_OP = 'UPDATE' THEN
    event_type := 'record_updated';
    event_workspace_id := NEW.workspace_id;
    event_module_id := NEW.module_id;
    event_record_id := NEW.id;
    event_data := NEW.data;
  ELSE
    event_type := 'record_deleted';
    event_workspace_id := OLD.workspace_id;
    event_module_id := OLD.module_id;
    event_record_id := OLD.id;
    event_data := OLD.data;
  END IF;

  FOR wf IN
    SELECT * FROM public.workflows
    WHERE workspace_id = event_workspace_id
      AND trigger_module_id = event_module_id
      AND trigger_type = event_type
      AND is_active = true
  LOOP
    conditions_match := true;
    FOR condition IN SELECT value FROM jsonb_array_elements(COALESCE(wf.conditions, '[]'::jsonb))
    LOOP
      record_value := event_data ->> (condition ->> 'field');
      IF NOT (
        CASE condition ->> 'operator'
        WHEN 'equals' THEN record_value = condition ->> 'value'
        WHEN 'not_equals' THEN record_value IS DISTINCT FROM condition ->> 'value'
        WHEN 'contains' THEN COALESCE(record_value, '') ILIKE '%' || COALESCE(condition ->> 'value', '') || '%'
        WHEN 'greater_than' THEN COALESCE(record_value, '0')::NUMERIC > COALESCE(condition ->> 'value', '0')::NUMERIC
        WHEN 'less_than' THEN COALESCE(record_value, '0')::NUMERIC < COALESCE(condition ->> 'value', '0')::NUMERIC
        WHEN 'is_set' THEN record_value IS NOT NULL AND record_value <> ''
          ELSE false
        END
      ) THEN
        conditions_match := false;
        EXIT;
      END IF;
    END LOOP;

    IF NOT conditions_match THEN
      CONTINUE;
    END IF;

    INSERT INTO public.workflow_executions (workflow_id, workspace_id, source_record_id)
    VALUES (wf.id, event_workspace_id, event_record_id)
    RETURNING id INTO execution_id;

    BEGIN
      FOR action IN SELECT value FROM jsonb_array_elements(COALESCE(wf.actions, '[]'::jsonb))
      LOOP
        IF action ->> 'action_type' = 'log_activity' THEN
          INSERT INTO public.activity_logs (workspace_id, user_name, action, entity_type, entity_name)
          VALUES (
            event_workspace_id,
            'Workflow Automation',
            'executed workflow',
            'workflow',
            COALESCE(action ->> 'description', wf.name)
          );
        ELSIF action ->> 'action_type' = 'create_record'
          AND NULLIF(action ->> 'target_module_id', '') IS NOT NULL THEN
          INSERT INTO public.records (module_id, workspace_id, created_by, data)
          VALUES (
            (action ->> 'target_module_id')::UUID,
            event_workspace_id,
            NULL,
            COALESCE(action -> 'mapping', '{}'::jsonb)
          );
        END IF;
      END LOOP;

      UPDATE public.workflows
      SET execution_count = execution_count + 1, last_triggered_at = NOW(), updated_at = NOW()
      WHERE id = wf.id;

      UPDATE public.workflow_executions
      SET status = 'succeeded', completed_at = NOW()
      WHERE id = execution_id;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.workflow_executions
      SET status = 'failed', error_message = SQLERRM, completed_at = NOW()
      WHERE id = execution_id;
    END;
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS records_execute_workflows ON public.records;
CREATE TRIGGER records_execute_workflows
AFTER INSERT OR UPDATE OR DELETE ON public.records
FOR EACH ROW EXECUTE FUNCTION public.execute_record_workflows();

-- Policies: ACTIVITY LOGS
CREATE POLICY "Members can view activity logs of their workspace"
    ON public.activity_logs FOR SELECT
    USING (public.is_member_of_workspace(workspace_id));

CREATE POLICY "Members can insert activity logs in their workspace"
    ON public.activity_logs FOR INSERT
    WITH CHECK (public.is_member_of_workspace(workspace_id));
