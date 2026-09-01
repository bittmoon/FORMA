import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Module, FormaRecord } from '@/types';
import { RecordForm } from './RecordForm';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
  record?: FormaRecord;
  onSubmit: (data: Record<string, any>) => void;
  isLoading?: boolean;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  module,
  record,
  onSubmit,
  isLoading,
}) => {
  const isEditing = Boolean(record);
  const title = isEditing
    ? `Edit ${module.name.slice(0, -1) || module.name}`
    : `New ${module.name.slice(0, -1) || module.name}`;
  const description = isEditing
    ? `Update information and properties for this ${module.name.toLowerCase()} record.`
    : `Fill out the required attributes to create a new ${module.name.toLowerCase()} entry.`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth="lg"
    >
      <RecordForm
        module={module}
        initialData={record}
        onSubmit={onSubmit}
        onCancel={onClose}
        isLoading={isLoading}
      />
    </Modal>
  );
};
