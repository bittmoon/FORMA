import React from 'react';
import { BrandingSettings } from '@/features/builder/BrandingSettings';
import { TeamAndRoles } from '@/features/builder/TeamAndRoles';
import { Tabs } from '@/components/ui/Tabs';
import { useState } from 'react';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('branding');

  const tabs = [
    { id: 'branding', label: 'Workspace Branding' },
    { id: 'team', label: 'Team Members & Roles' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-forma-border">
        <h1 className="text-xl font-bold font-display text-forma-white">
          Workspace Settings
        </h1>
        <p className="text-xs text-forma-muted mt-0.5">
          Manage workspace profile, member permissions, and visual theme.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-2">
        {activeTab === 'branding' && <BrandingSettings />}
        {activeTab === 'team' && <TeamAndRoles />}
      </div>
    </div>
  );
};
