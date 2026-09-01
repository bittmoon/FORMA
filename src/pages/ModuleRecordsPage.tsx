import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/features/workspaces/WorkspaceContext';
import { RecordListView } from '@/features/records/RecordListView';
import { EmptyState } from '@/components/ui/EmptyState';

export const ModuleRecordsPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { modules, setMode } = useWorkspace();
  const navigate = useNavigate();

  const activeModule = modules.find((m) => m.id === moduleId);

  if (!activeModule) {
    return (
      <EmptyState
        icon="Boxes"
        title="Module Not Found"
        description="The requested module may have been deleted or does not exist in this workspace."
        actionLabel="Go to Command Center"
        onAction={() => navigate('/app/dashboard')}
      />
    );
  }

  return <RecordListView key={activeModule.id} module={activeModule} />;
};
