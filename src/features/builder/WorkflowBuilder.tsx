import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import {
  listBuilderWorkflowExecutions,
  listBuilderWorkflows,
  saveWorkflow,
  removeWorkflow,
} from '@/lib/builder-data';
import {
  WorkflowRule,
  WorkflowExecution,
  WorkflowTriggerType,
  WorkflowActionType,
} from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { IconRenderer } from '@/components/ui/IconRenderer';
import {
  Workflow,
  Plus,
  Trash2,
  Zap,
  ArrowDown,
  CheckCircle2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const WorkflowBuilder: React.FC = () => {
  const { activeWorkspaceId, modules } = useWorkspace();
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isRefreshingRuns, setIsRefreshingRuns] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerModuleId, setTriggerModuleId] = useState(modules[0]?.id || '');
  const [triggerType, setTriggerType] = useState<WorkflowTriggerType>('record_updated');
  const [conditionField, setConditionField] = useState('');
  const [conditionValue, setConditionValue] = useState('');
  const [actionType, setActionType] = useState<WorkflowActionType>('log_activity');
  const [actionDescription, setActionDescription] = useState('');
  const [actionTargetModuleId, setActionTargetModuleId] = useState('');

  const loadWorkflowData = async () => {
    if (!activeWorkspaceId) return;
    try {
      const [rules, runs] = await Promise.all([
        listBuilderWorkflows(activeWorkspaceId),
        listBuilderWorkflowExecutions(activeWorkspaceId),
      ]);
      setWorkflows(rules);
      setExecutions(runs);
    } catch (err) {
      console.error('Unable to load workflow data', err);
    }
  };

  useEffect(() => { loadWorkflowData(); }, [activeWorkspaceId]);

  const refreshRuns = async () => {
    setIsRefreshingRuns(true);
    await loadWorkflowData();
    setIsRefreshingRuns(false);
  };

  const selectedTriggerModule = modules.find((m) => m.id === triggerModuleId);
  const triggerFields = selectedTriggerModule?.fields || [];

  const openCreateModal = () => {
    setName('');
    setDescription('');
    setTriggerModuleId(modules[0]?.id || '');
    setTriggerType('record_updated');
    setConditionField(triggerFields[0]?.slug || 'status');
    setConditionValue('Completed');
    setActionType('log_activity');
    setActionDescription('Record automated workflow execution');
    setActionTargetModuleId(modules.find((m) => m.id !== triggerModuleId)?.id || '');
    setIsModalOpen(true);
  };

  const handleSaveWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await saveWorkflow(activeWorkspaceId, {
      name: name.trim(),
      description: description.trim() || undefined,
      is_active: true,
      trigger_module_id: triggerModuleId,
      trigger_type: triggerType,
      conditions: conditionField
        ? [{ field: conditionField, operator: 'equals', value: conditionValue }]
        : [],
      actions: [
        {
          id: 'act_' + Date.now().toString(36),
          action_type: actionType,
          target_module_id: actionType === 'create_record' ? actionTargetModuleId || undefined : undefined,
          description: actionDescription.trim() || 'Triggered automation action',
        },
      ],
      });
      await loadWorkflowData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Unable to save workflow', err);
      window.alert('FORMA could not save this workflow. Please try again.');
    }
  };

  const handleToggle = async (wf: WorkflowRule) => {
    try {
      const { id: _id, workspace_id, created_at: _createdAt, updated_at: _updatedAt, ...data } = wf;
      await saveWorkflow(workspace_id, { ...data, is_active: !wf.is_active }, wf.id);
      await loadWorkflowData();
    } catch (err) {
      console.error('Unable to update workflow', err);
      window.alert('FORMA could not update this workflow. Please try again.');
    }
  };

  const handleDelete = async (wfId: string) => {
    if (window.confirm('Delete this automated workflow?')) {
      try {
        await removeWorkflow(wfId);
        await loadWorkflowData();
      } catch (err) {
        console.error('Unable to delete workflow', err);
        window.alert('FORMA could not delete this workflow. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-forma-border">
        <div>
          <h3 className="text-base font-bold font-display text-forma-white">
            Automated Business Workflows
          </h3>
          <p className="text-xs text-forma-muted mt-0.5">
            Connect modules together: when business events occur, automatically execute actions.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          <span>New Workflow Rule</span>
        </Button>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.length === 0 ? (
          <div className="forma-panel p-10 rounded-2xl border border-forma-border text-center">
            <Workflow className="w-10 h-10 text-forma-muted mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-forma-white">No active workflows yet</h3>
            <p className="text-xs text-forma-muted mt-1 max-w-sm mx-auto">
              Automate tasks like generating receipts when appointments complete or updating client statuses when invoices are paid.
            </p>
            <Button variant="primary" size="sm" onClick={openCreateModal} className="mt-4">
              + Create Workflow
            </Button>
          </div>
        ) : (
          workflows.map((wf) => {
            const triggerMod = modules.find((m) => m.id === wf.trigger_module_id);

            return (
              <div
                key={wf.id}
                className={`p-5 rounded-xl border transition-all ${
                  wf.is_active
                    ? 'forma-card border-forma-border'
                    : 'bg-forma-surface/40 border-forma-border/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-forma-white font-display">
                          {wf.name}
                        </h4>
                        <Badge variant={wf.is_active ? 'emerald' : 'slate'} size="sm">
                          {wf.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      {wf.description && (
                        <p className="text-xs text-forma-muted mt-0.5">{wf.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(wf)}
                      title={wf.is_active ? 'Pause automation' : 'Activate automation'}
                      className="p-1 text-forma-muted hover:text-forma-white transition-colors cursor-pointer"
                    >
                      {wf.is_active ? (
                        <ToggleRight className="w-6 h-6 text-forma-lime" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-forma-muted" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(wf.id)}
                      className="p-1 rounded text-forma-muted hover:text-red-400 hover:bg-forma-surface transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Visual Pipeline Steps */}
                <div className="mt-4 pt-4 border-t border-forma-border/60 flex flex-col sm:flex-row items-center gap-3">
                  {/* Step 1: WHEN */}
                  <div className="flex-1 w-full p-3 rounded-lg bg-forma-surface border border-forma-border flex items-center gap-2.5 text-xs">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-forma-limeDim text-forma-lime font-bold">
                      WHEN
                    </span>
                    <span className="text-forma-white font-medium truncate">
                      {triggerMod?.name || 'Record'}{' '}
                      <strong className="text-forma-muted font-normal">
                        ({wf.trigger_type.replace('_', ' ')})
                      </strong>
                    </span>
                  </div>

                  <ArrowDown className="w-4 h-4 text-forma-subtle shrink-0 sm:-rotate-90" />

                  {/* Step 2: IF Conditions */}
                  {wf.conditions.length > 0 && (
                    <>
                      <div className="flex-1 w-full p-3 rounded-lg bg-forma-surface border border-forma-border flex items-center gap-2.5 text-xs">
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                          IF
                        </span>
                        <span className="text-forma-white font-mono text-[11px] truncate">
                          {wf.conditions[0].field} == "{String(wf.conditions[0].value)}"
                        </span>
                      </div>
                      <ArrowDown className="w-4 h-4 text-forma-subtle shrink-0 sm:-rotate-90" />
                    </>
                  )}

                  {/* Step 3: THEN Action */}
                  <div className="flex-1 w-full p-3 rounded-lg bg-forma-surface border border-forma-border flex items-center gap-2.5 text-xs">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold">
                      THEN
                    </span>
                    <span className="text-forma-white truncate">
                      {wf.actions[0]?.description || wf.actions[0]?.action_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-forma-subtle font-mono flex items-center justify-between">
                  <span>Executions: {wf.execution_count || 0} times</span>
                  {wf.last_triggered_at && <span>Last: {wf.last_triggered_at.slice(0, 10)}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Workflow Runs */}
      <section className="forma-card rounded-xl border border-forma-border overflow-hidden">
        <div className="p-4 flex items-center justify-between gap-3 border-b border-forma-border">
          <div>
            <h3 className="text-xs font-bold text-forma-white font-display uppercase tracking-wider">
              Workflow Runs
            </h3>
            <p className="text-[11px] text-forma-muted mt-0.5">
              Latest automated actions and any execution failures.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshRuns} disabled={isRefreshingRuns}>
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRuns ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {executions.length === 0 ? (
          <p className="p-6 text-center text-xs text-forma-muted">
            No workflow runs yet. Trigger an active rule by creating, updating, or deleting a matching record.
          </p>
        ) : (
          <div className="divide-y divide-forma-border/60">
            {executions.map((execution) => {
              const workflow = workflows.find((item) => item.id === execution.workflow_id);
              const succeeded = execution.status === 'succeeded';
              const failed = execution.status === 'failed';
              return (
                <div key={execution.id} className="p-3.5 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex items-start gap-2.5">
                    {failed ? (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${succeeded ? 'text-forma-lime' : 'text-amber-400'}`} />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-forma-white truncate">
                        {workflow?.name || 'Deleted workflow'}
                      </p>
                      {execution.error_message ? (
                        <p className="text-[11px] text-red-300 mt-0.5 break-words">{execution.error_message}</p>
                      ) : (
                        <p className="text-[11px] text-forma-muted mt-0.5">
                          {execution.source_record_id ? `Source record: ${execution.source_record_id.slice(0, 8)}` : 'Automation run'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={failed ? 'coral' : succeeded ? 'lime' : 'amber'} size="sm">
                      {execution.status}
                    </Badge>
                    <p className="text-[10px] font-mono text-forma-subtle mt-1">
                      {formatDateTime(execution.started_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Create Workflow Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Automated Workflow"
        description="Design a 'When -> If -> Then' business action rule."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveWorkflow} className="space-y-4">
          <Input
            label="Workflow Rule Name"
            placeholder="e.g. Auto-generate receipt when appointment completes"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. Dispatches payment record and updates client visit count"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Trigger */}
          <div className="p-4 rounded-xl bg-forma-surface border border-forma-border space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-forma-lime font-bold">
              1. When Something Happens
            </span>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Source Module"
                value={triggerModuleId}
                onChange={(e) => setTriggerModuleId(e.target.value)}
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id} className="bg-forma-card text-forma-white">
                    {m.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Trigger Event"
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as any)}
                options={[
                  { value: 'record_created', label: 'Record Created' },
                  { value: 'record_updated', label: 'Record Updated' },
                  { value: 'record_deleted', label: 'Record Deleted' },
                ]}
              />
            </div>
          </div>

          {/* Condition */}
          <div className="p-4 rounded-xl bg-forma-surface border border-forma-border space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              2. If Condition Matches (Optional)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Check Field"
                value={conditionField}
                onChange={(e) => setConditionField(e.target.value)}
              >
                <option value="">Any change (no condition)</option>
                {triggerFields.map((f) => (
                  <option key={f.id} value={f.slug} className="bg-forma-card text-forma-white">
                    {f.name} ({f.slug})
                  </option>
                ))}
              </Select>

              <Input
                label="Target Value"
                placeholder="e.g. Completed, Paid, Active"
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
              />
            </div>
          </div>

          {/* Action */}
          <div className="p-4 rounded-xl bg-forma-surface border border-forma-border space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
              3. Then Execute Action
            </span>
            <div className="space-y-3">
              <Select
                label="Action Type"
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                options={[
                  { value: 'log_activity', label: 'Log System Audit Activity' },
                  { value: 'create_record', label: 'Create Record in Linked Module' },
                ]}
              />

              <Input
                label="Action Description"
                placeholder="e.g. Log payment confirmation receipt in activity feed"
                value={actionDescription}
                onChange={(e) => setActionDescription(e.target.value)}
                required
              />

              {actionType === 'create_record' && (
                <Select
                  label="Target Module"
                  value={actionTargetModuleId}
                  onChange={(e) => setActionTargetModuleId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select the module for the new record...</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id} className="bg-forma-card text-forma-white">
                      {m.name}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-forma-border">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={!name.trim()}>
              Save Automation Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
