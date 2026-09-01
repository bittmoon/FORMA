import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface IconRendererProps extends LucideProps {
  name: string;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-4 h-4', ...props }) => {
  // Normalize icon name
  const cleanName = name ? name.trim() : 'Boxes';
  
  // Lookup icon in lucide-react exports
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[cleanName] ||
    (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[
      cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
    ] ||
    Icons.Boxes;

  return <IconComponent className={className} {...props} />;
};

export const AVAILABLE_ICONS = [
  'Boxes',
  'Users',
  'Briefcase',
  'Calendar',
  'Receipt',
  'CreditCard',
  'Sparkles',
  'Scissors',
  'Camera',
  'Aperture',
  'Layers',
  'Building',
  'Building2',
  'UserCheck',
  'UserPlus',
  'FolderGit2',
  'Sliders',
  'ShoppingBag',
  'Package',
  'Truck',
  'FileText',
  'TrendingUp',
  'ShieldCheck',
  'HeartPulse',
  'Activity',
  'Tag',
  'MapPin',
  'Clock',
  'DollarSign',
  'CheckCircle2'
];
