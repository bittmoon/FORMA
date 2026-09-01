import React, { useState, useMemo } from 'react';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import {
  listWorkspaceMembers,
  addWorkspaceMember,
  removeWorkspaceMember,
} from '@/lib/storage';
import { WorkspaceMember, UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  Plus,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Check,
  X,
} from 'lucide-react';

export const TeamAndRoles: React.FC = () => {
  const { activeWorkspaceId, modules, refreshData } = useWorkspace();
  const members = useMemo(() => listWorkspaceMembers(activeWorkspaceId), [activeWorkspaceId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    addWorkspaceMember(activeWorkspaceId, email.trim(), name.trim(), role);
    refreshData();
    setIsModalOpen(false);
    setEmail('');
    setName('');
  };

  const handleRemove = (memberId: string) => {
    if (window.confirm('Remove member from workspace?')) {
      removeWorkspaceMember(memberId);
      refreshData();
    }
  };

  return (
    <div className="space-y-8">
      {/* Team Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-forma-border">
        <div>
          <h3 className="text-base font-bold font-display text-forma-white">
            Team Members & Role Access Matrix
          </h3>
          <p className="text-xs text-forma-muted mt-0.5">
            Manage who has access to operate modules and configure the business OS.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Invite Member</span>
        </Button>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-forma-muted">
          Active Members ({members.length})
        </h4>

        <div className="divide-y divide-forma-border border border-forma-border rounded-xl bg-forma-surface/30 overflow-hidden">
          {members.map((m) => (
            <div key={m.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forma-card border border-forma-border flex items-center justify-center font-bold text-xs text-forma-lime font-mono">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-forma-white">{m.name}</span>
                    <Badge
                      variant={m.role === 'owner' ? 'lime' : m.role === 'admin' ? 'sky' : 'slate'}
                      size="sm"
                    >
                      {m.role.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-forma-muted">{m.email}</span>
                </div>
              </div>

              {m.role !== 'owner' && (
                <button
                  onClick={() => handleRemove(m.id)}
                  className="p-1 rounded text-forma-muted hover:text-red-400 hover:bg-forma-surface transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Module Permission Matrix */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-forma-muted">
          Module Access Matrix
        </h4>

        <div className="border border-forma-border rounded-xl bg-forma-surface/30 overflow-hidden">
          <table className="w-full text-left text-xs text-forma-white border-collapse">
            <thead>
              <tr className="bg-forma-card border-b border-forma-border text-[11px] font-mono uppercase text-forma-muted">
                <th className="px-4 py-3">Permission Area</th>
                <th className="px-4 py-3 text-center">Owner</th>
                <th className="px-4 py-3 text-center">Admin</th>
                <th className="px-4 py-3 text-center">Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forma-border/50">
              {modules.map((mod) => (
                <tr key={mod.id} className="hover:bg-forma-card/40 transition-colors">
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-forma-lime" />
                    <span>{mod.name} Module</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-4 h-4 text-forma-lime mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-4 h-4 text-forma-lime mx-auto" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {mod.slug.includes('payment') || mod.slug.includes('expense') || mod.slug.includes('deal') ? (
                      <X className="w-4 h-4 text-forma-subtle mx-auto" />
                    ) : (
                      <Check className="w-4 h-4 text-forma-lime mx-auto" />
                    )}
                  </td>
                </tr>
              ))}

              <tr className="hover:bg-forma-card/40 transition-colors bg-forma-surface/20 font-semibold">
                <td className="px-4 py-3">Builder & Schema Editor</td>
                <td className="px-4 py-3 text-center">
                  <Check className="w-4 h-4 text-forma-lime mx-auto" />
                </td>
                <td className="px-4 py-3 text-center">
                  <X className="w-4 h-4 text-forma-subtle mx-auto" />
                </td>
                <td className="px-4 py-3 text-center">
                  <X className="w-4 h-4 text-forma-subtle mx-auto" />
                </td>
              </tr>

              <tr className="hover:bg-forma-card/40 transition-colors bg-forma-surface/20 font-semibold">
                <td className="px-4 py-3">Workspace Settings & Billing</td>
                <td className="px-4 py-3 text-center">
                  <Check className="w-4 h-4 text-forma-lime mx-auto" />
                </td>
                <td className="px-4 py-3 text-center">
                  <X className="w-4 h-4 text-forma-subtle mx-auto" />
                </td>
                <td className="px-4 py-3 text-center">
                  <X className="w-4 h-4 text-forma-subtle mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite Team Member"
        description="Add a teammate and assign their operational role."
        maxWidth="md"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Sarah Jenkins"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            type="email"
            label="Email Address"
            placeholder="sarah@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Select
            label="Assigned Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: 'employee', label: 'Employee (Standard Module Access)' },
              { value: 'admin', label: 'Admin (Full Business Operation)' },
            ]}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-forma-border">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={!name.trim() || !email.trim()}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
