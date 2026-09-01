import { TemplateDefinition } from '@/types';

export const TEMPLATE_PRESETS: TemplateDefinition[] = [
  {
    id: 'freelancer-os',
    name: 'Freelancer & Studio OS',
    tagline: 'High-growth independent creative & consulting OS',
    category: 'Solo & Creative',
    description: 'Track client accounts, active deliverables, multi-currency invoices, project pipeline, and business expenses.',
    icon: 'Briefcase',
    badge: 'Popular',
    modules: [
      {
        name: 'Clients',
        slug: 'clients',
        icon: 'Users',
        description: 'Businesses and enterprise contacts who hire your services',
        color: '#C7F36B',
        fields: [
          { name: 'Company Name', slug: 'company_name', type: 'text', required: true, config: { placeholder: 'Acme Studio' } },
          { name: 'Contact Person', slug: 'contact_person', type: 'text', required: true, config: { placeholder: 'Sarah Jenkins' } },
          { name: 'Email', slug: 'email', type: 'email', required: true, config: { placeholder: 'sarah@acme.com' } },
          { name: 'Phone', slug: 'phone', type: 'phone', required: false, config: { placeholder: '+1 (555) 019-2834' } },
          { name: 'Hourly Rate', slug: 'hourly_rate', type: 'currency', required: false, config: { currency_symbol: '$', placeholder: '160' } },
          { 
            name: 'Status', 
            slug: 'status', 
            type: 'select', 
            required: true, 
            config: { options: ['Active', 'Lead', 'Past Client', 'Paused'], default_value: 'Active' } 
          },
          { name: 'Notes', slug: 'notes', type: 'longtext', required: false, config: { placeholder: 'Client preferences and contract details' } }
        ],
        seed_records: [
          { company_name: 'Starlight Media', contact_person: 'Elena Vance', email: 'elena@starlight.io', phone: '+1 (555) 234-5678', hourly_rate: 160, status: 'Active', notes: 'Monthly retainer for enterprise design systems & design tokens.' },
          { company_name: 'Apex Venture Lab', contact_person: 'David Chen', email: 'david@apexvl.com', phone: '+1 (555) 876-5432', hourly_rate: 185, status: 'Active', notes: 'Brand identity, web application redesign, and seed deck collateral.' },
          { company_name: 'Nordic Roast Co', contact_person: 'Lars Holm', email: 'lars@nordicroast.com', phone: '+1 (555) 345-9876', hourly_rate: 140, status: 'Active', notes: 'Direct-to-consumer e-commerce storefront revamp and subscription flow.' },
          { company_name: 'Aether AI Research', contact_person: 'Dr. Maya Lin', email: 'maya@aetherai.org', phone: '+1 (555) 901-2244', hourly_rate: 195, status: 'Active', notes: 'Prompt engineering console, model playground UI, and token analytics.' },
          { company_name: 'Solstice Fashion House', contact_person: 'Camille Laurent', email: 'camille@solsticeparis.fr', phone: '+33 1 42 68 55 00', hourly_rate: 170, status: 'Active', notes: 'Interactive 3D lookbook and Autumn digital runway experience.' },
          { company_name: 'Vanguard Logistics', contact_person: 'Robert Sterling', email: 'r.sterling@vanguardlog.com', phone: '+1 (555) 672-1199', hourly_rate: 150, status: 'Lead', notes: 'Enterprise fleet dispatch management dashboard overhaul proposal.' },
          { company_name: 'Kroma Quantum', contact_person: 'Marcus Zhao', email: 'marcus@kroma-q.tech', phone: '+1 (555) 441-8902', hourly_rate: 200, status: 'Lead', notes: 'Quantum algorithm developer documentation theme & cloud dashboard.' }
        ]
      },
      {
        name: 'Projects',
        slug: 'projects',
        icon: 'FolderGit2',
        description: 'Active client deliverables, sprints, and milestones',
        color: '#38BDF8',
        fields: [
          { name: 'Project Title', slug: 'title', type: 'text', required: true, config: { placeholder: 'Brand Guidelines 2026' } },
          { name: 'Client', slug: 'client_id', type: 'relation', required: true, config: { target_module_id: 'clients', display_field_slug: 'company_name' } },
          { 
            name: 'Status', 
            slug: 'status', 
            type: 'select', 
            required: true, 
            config: { options: ['Discovery', 'In Progress', 'In Review', 'Completed'], default_value: 'In Progress' } 
          },
          { name: 'Budget', slug: 'budget', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '6500' } },
          { name: 'Due Date', slug: 'due_date', type: 'date', required: true, config: {} },
          { name: 'Deliverable Link', slug: 'link', type: 'url', required: false, config: { placeholder: 'https://figma.com/file/...' } }
        ],
        seed_records: [
          { title: 'Global Design System Overhaul v3.0', client_id: 'Starlight Media', status: 'In Progress', budget: 8500, due_date: '2026-09-15', link: 'https://figma.com/design/starlight-ds-v3' },
          { title: 'SaaS Core Analytics & Metrics Dashboard', client_id: 'Apex Venture Lab', status: 'In Review', budget: 9200, due_date: '2026-09-02', link: 'https://github.com/apexvl/analytics-ui' },
          { title: 'E-Commerce Direct Flagship Storefront', client_id: 'Nordic Roast Co', status: 'In Progress', budget: 6400, due_date: '2026-09-28', link: 'https://nordicroast.preview.forma.dev' },
          { title: 'AI Model Visualizer & Playground UI', client_id: 'Aether AI Research', status: 'In Progress', budget: 12000, due_date: '2026-10-10', link: 'https://figma.com/file/aether-playground' },
          { title: 'Interactive 3D Digital Lookbook', client_id: 'Solstice Fashion House', status: 'Completed', budget: 7800, due_date: '2026-08-20', link: 'https://lookbook.solsticeparis.fr' },
          { title: 'Mobile Companion App Component Kit', client_id: 'Starlight Media', status: 'Completed', budget: 4500, due_date: '2026-08-10', link: 'https://figma.com/file/starlight-mobile-kit' },
          { title: 'Fleet Tracking & Route Optimization Console', client_id: 'Vanguard Logistics', status: 'Discovery', budget: 11500, due_date: '2026-10-30', link: '' }
        ]
      },
      {
        name: 'Invoices',
        slug: 'invoices',
        icon: 'Receipt',
        description: 'Billed items, client receivables, and cashflow settlements',
        color: '#10B981',
        fields: [
          { name: 'Invoice Number', slug: 'invoice_no', type: 'text', required: true, config: { placeholder: 'INV-2026-001' } },
          { name: 'Client', slug: 'client_id', type: 'relation', required: true, config: { target_module_id: 'clients', display_field_slug: 'company_name' } },
          { name: 'Amount', slug: 'amount', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '4500' } },
          { 
            name: 'Status', 
            slug: 'status', 
            type: 'select', 
            required: true, 
            config: { options: ['Draft', 'Sent', 'Paid', 'Overdue'], default_value: 'Sent' } 
          },
          { name: 'Issue Date', slug: 'issue_date', type: 'date', required: true, config: {} },
          { name: 'Due Date', slug: 'due_date', type: 'date', required: true, config: {} }
        ],
        seed_records: [
          { invoice_no: 'INV-2026-094', client_id: 'Solstice Fashion House', amount: 7800, status: 'Paid', issue_date: '2026-08-01', due_date: '2026-08-15' },
          { invoice_no: 'INV-2026-095', client_id: 'Starlight Media', amount: 4500, status: 'Paid', issue_date: '2026-08-05', due_date: '2026-08-20' },
          { invoice_no: 'INV-2026-096', client_id: 'Aether AI Research', amount: 6000, status: 'Paid', issue_date: '2026-08-10', due_date: '2026-08-25' },
          { invoice_no: 'INV-2026-097', client_id: 'Apex Venture Lab', amount: 4600, status: 'Sent', issue_date: '2026-08-18', due_date: '2026-09-02' },
          { invoice_no: 'INV-2026-098', client_id: 'Nordic Roast Co', amount: 3200, status: 'Sent', issue_date: '2026-08-22', due_date: '2026-09-06' },
          { invoice_no: 'INV-2026-099', client_id: 'Starlight Media', amount: 4250, status: 'Draft', issue_date: '2026-08-26', due_date: '2026-09-10' },
          { invoice_no: 'INV-2026-100', client_id: 'Aether AI Research', amount: 6000, status: 'Draft', issue_date: '2026-08-28', due_date: '2026-09-12' },
          { invoice_no: 'INV-2026-092', client_id: 'Apex Venture Lab', amount: 2400, status: 'Overdue', issue_date: '2026-07-20', due_date: '2026-08-04' }
        ]
      },
      {
        name: 'Expenses',
        slug: 'expenses',
        icon: 'CreditCard',
        description: 'Software licenses, equipment, and business operations',
        color: '#F59E0B',
        fields: [
          { name: 'Description', slug: 'description', type: 'text', required: true, config: { placeholder: 'Figma Organization Tier' } },
          { 
            name: 'Category', 
            slug: 'category', 
            type: 'select', 
            required: true, 
            config: { options: ['Software & SaaS', 'Equipment', 'Hosting & Cloud', 'Office', 'Travel'], default_value: 'Software & SaaS' } 
          },
          { name: 'Amount', slug: 'amount', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '144' } },
          { name: 'Date', slug: 'date', type: 'date', required: true, config: {} },
          { name: 'Tax Deductible', slug: 'is_tax_deductible', type: 'checkbox', required: false, config: { default_value: true } }
        ],
        seed_records: [
          { description: 'Figma Organization Tier & FigJam', category: 'Software & SaaS', amount: 90, date: '2026-08-02', is_tax_deductible: true },
          { description: 'Vercel Enterprise & Supabase Pro Cluster', category: 'Hosting & Cloud', amount: 145, date: '2026-08-06', is_tax_deductible: true },
          { description: 'Claude 3.5 & OpenAI API Compute Tokens', category: 'Software & SaaS', amount: 180, date: '2026-08-12', is_tax_deductible: true },
          { description: 'Apple Studio Display 27" 5K Monitor', category: 'Equipment', amount: 1599, date: '2026-08-15', is_tax_deductible: true },
          { description: 'Linear & GitHub Enterprise Teams', category: 'Software & SaaS', amount: 65, date: '2026-08-18', is_tax_deductible: true },
          { description: 'Commercial Typeface & Brand Font License', category: 'Office', amount: 350, date: '2026-08-21', is_tax_deductible: true },
          { description: 'High-Speed Dedicated Fiber Office Internet', category: 'Office', amount: 120, date: '2026-08-25', is_tax_deductible: true }
        ]
      }
    ],
    widgets: [
      {
        title: 'Collected Revenue',
        type: 'stat',
        module_slug: 'invoices',
        config: { metric_field: 'amount', aggregate: 'sum', icon: 'DollarSign', color: '#C7F36B', subtitle: 'All-time settled client payouts' },
        width: 3,
        height: 1
      },
      {
        title: 'Outstanding Receivables',
        type: 'stat',
        module_slug: 'invoices',
        config: { metric_field: 'amount', aggregate: 'sum', icon: 'Clock', color: '#F59E0B', subtitle: 'Pending invoices & drafts' },
        width: 3,
        height: 1
      },
      {
        title: 'Active Deliverables',
        type: 'stat',
        module_slug: 'projects',
        config: { aggregate: 'count', icon: 'FolderGit2', color: '#38BDF8', subtitle: 'Projects in flight or review' },
        width: 3,
        height: 1
      },
      {
        title: 'Client Accounts',
        type: 'stat',
        module_slug: 'clients',
        config: { aggregate: 'count', icon: 'Users', color: '#10B981', subtitle: 'Retainers & enterprise partners' },
        width: 3,
        height: 1
      },
      {
        title: 'Revenue & Invoicing Trend',
        type: 'chart',
        module_slug: 'invoices',
        config: { metric_field: 'amount', chart_type: 'area', color: '#C7F36B', subtitle: 'Monthly billing volume' },
        width: 8,
        height: 4
      },
      {
        title: 'Active Project Milestones',
        type: 'recent_records',
        module_slug: 'projects',
        config: { limit: 4 },
        width: 4,
        height: 4
      },
      {
        title: 'Recent Invoices & Cashflow',
        type: 'table',
        module_slug: 'invoices',
        config: { limit: 5 },
        width: 12,
        height: 4
      }
    ],
    workflows: [
      {
        name: 'Auto-Update Client on Paid Invoice',
        description: 'When an invoice status changes to Paid, mark client as Active and log payment activity',
        trigger_module_slug: 'invoices',
        trigger_type: 'record_updated',
        conditions: [
          { field: 'status', operator: 'equals', value: 'Paid' }
        ],
        actions: [
          { action_type: 'log_activity', description: 'Log paid invoice settlement' }
        ]
      },
      {
        name: 'Notify on Project Completion',
        description: 'When a deliverable is marked as Completed, create an audit event and notify billing',
        trigger_module_slug: 'projects',
        trigger_type: 'record_updated',
        conditions: [
          { field: 'status', operator: 'equals', value: 'Completed' }
        ],
        actions: [
          { action_type: 'log_activity', description: 'Record milestone completion in audit feed' }
        ]
      }
    ]
  },
  {
    id: 'barber-salon-os',
    name: 'Barber & Salon OS',
    tagline: 'Appointment scheduling and salon management',
    category: 'Service & Retail',
    description: 'Manage VIP clients, daily appointment queues, specialist services, employee rosters, and daily payouts.',
    icon: 'Scissors',
    badge: 'Trending',
    modules: [
      {
        name: 'Customers',
        slug: 'customers',
        icon: 'UserCheck',
        description: 'Client profiles, hair preferences, and visit history',
        color: '#C7F36B',
        fields: [
          { name: 'Full Name', slug: 'full_name', type: 'text', required: true, config: { placeholder: 'Marcus Thorne' } },
          { name: 'Phone Number', slug: 'phone', type: 'phone', required: true, config: { placeholder: '+1 555-019-3344' } },
          { name: 'Email', slug: 'email', type: 'email', required: false, config: { placeholder: 'marcus@gmail.com' } },
          { name: 'VIP Member', slug: 'is_vip', type: 'checkbox', required: false, config: { default_value: false } },
          { name: 'Last Visit Date', slug: 'last_visit', type: 'date', required: false, config: {} },
          { name: 'Styling Notes', slug: 'notes', type: 'longtext', required: false, config: { placeholder: 'Low skin fade, textured top, beard oil preference' } }
        ],
        seed_records: [
          { full_name: 'Marcus Thorne', phone: '+1 555-019-3344', email: 'marcus.t@gmail.com', is_vip: true, last_visit: '2026-08-20', notes: 'Zero fade with beard trim. Prefers matte clay.' },
          { full_name: 'Alexander Sterling', phone: '+1 555-082-1922', email: 'alex@sterling.co', is_vip: true, last_visit: '2026-08-14', notes: 'Scissor cut taper, herbal scalp massage.' },
          { full_name: 'Julian Mercer', phone: '+1 555-921-4401', email: 'j.mercer@outlook.com', is_vip: false, last_visit: '2026-07-28', notes: 'Standard classic cut.' }
        ]
      },
      {
        name: 'Services',
        slug: 'services',
        icon: 'Sparkles',
        description: 'Haircuts, coloring, treatments, and grooming packages',
        color: '#F43F5E',
        fields: [
          { name: 'Service Name', slug: 'name', type: 'text', required: true, config: { placeholder: 'Executive Cut & Hot Towel' } },
          { 
            name: 'Category', 
            slug: 'category', 
            type: 'select', 
            required: true, 
            config: { options: ['Haircut', 'Beard & Shave', 'Coloring & Highlights', 'Spa & Treatment'], default_value: 'Haircut' } 
          },
          { name: 'Duration (Minutes)', slug: 'duration_min', type: 'number', required: true, config: { placeholder: '45' } },
          { name: 'Price', slug: 'price', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '55' } },
          { name: 'Active Menu Item', slug: 'is_active', type: 'checkbox', required: false, config: { default_value: true } }
        ],
        seed_records: [
          { name: 'Signature Haircut & Style', category: 'Haircut', duration_min: 40, price: 45, is_active: true },
          { name: 'Beard Sculpting & Hot Towel Shave', category: 'Beard & Shave', duration_min: 30, price: 35, is_active: true },
          { name: 'The Master Experience (Hair + Beard + Facial)', category: 'Spa & Treatment', duration_min: 75, price: 95, is_active: true },
          { name: 'Grey Blending & Conditioning', category: 'Coloring & Highlights', duration_min: 50, price: 65, is_active: true }
        ]
      },
      {
        name: 'Employees',
        slug: 'employees',
        icon: 'UserCheck',
        description: 'Stylists, master barbers, and apprentices',
        color: '#38BDF8',
        fields: [
          { name: 'Staff Name', slug: 'name', type: 'text', required: true, config: { placeholder: 'Tariq Al-Mansoor' } },
          { 
            name: 'Specialty Role', 
            slug: 'role', 
            type: 'select', 
            required: true, 
            config: { options: ['Master Barber', 'Senior Stylist', 'Color Specialist', 'Junior Stylist'], default_value: 'Senior Stylist' } 
          },
          { name: 'Phone', slug: 'phone', type: 'phone', required: true, config: { placeholder: '+1 555-321-7788' } },
          { name: 'Commission %', slug: 'commission_rate', type: 'number', required: true, config: { placeholder: '40' } },
          { name: 'Active Roster', slug: 'is_active', type: 'checkbox', required: false, config: { default_value: true } }
        ],
        seed_records: [
          { name: 'Tariq Al-Mansoor', role: 'Master Barber', phone: '+1 555-321-7788', commission_rate: 50, is_active: true },
          { name: 'Chloe Dubois', role: 'Senior Stylist', phone: '+1 555-882-9911', commission_rate: 45, is_active: true },
          { name: 'Liam Gallagher', role: 'Junior Stylist', phone: '+1 555-443-1289', commission_rate: 35, is_active: true }
        ]
      },
      {
        name: 'Appointments',
        slug: 'appointments',
        icon: 'Calendar',
        description: 'Booking schedule and daily client slots',
        color: '#10B981',
        fields: [
          { name: 'Customer', slug: 'customer_id', type: 'relation', required: true, config: { target_module_id: 'customers', display_field_slug: 'full_name' } },
          { name: 'Service', slug: 'service_id', type: 'relation', required: true, config: { target_module_id: 'services', display_field_slug: 'name' } },
          { name: 'Barber / Stylist', slug: 'employee_id', type: 'relation', required: true, config: { target_module_id: 'employees', display_field_slug: 'name' } },
          { name: 'Date & Time', slug: 'appointment_time', type: 'datetime', required: true, config: {} },
          { 
            name: 'Status', 
            slug: 'status', 
            type: 'select', 
            required: true, 
            config: { options: ['Confirmed', 'In Chair', 'Completed', 'No Show', 'Cancelled'], default_value: 'Confirmed' } 
          },
          { name: 'Total Fee', slug: 'total_fee', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '45' } }
        ],
        seed_records: [
          { customer_id: 'Marcus Thorne', service_id: 'The Master Experience (Hair + Beard + Facial)', employee_id: 'Tariq Al-Mansoor', appointment_time: '2026-08-24T14:30:00', status: 'In Chair', total_fee: 95 },
          { customer_id: 'Alexander Sterling', service_id: 'Signature Haircut & Style', employee_id: 'Chloe Dubois', appointment_time: '2026-08-24T16:00:00', status: 'Confirmed', total_fee: 45 },
          { customer_id: 'Julian Mercer', service_id: 'Beard Sculpting & Hot Towel Shave', employee_id: 'Liam Gallagher', appointment_time: '2026-08-24T17:15:00', status: 'Confirmed', total_fee: 35 }
        ]
      },
      {
        name: 'Payments',
        slug: 'payments',
        icon: 'BadgePercent',
        description: 'Completed transactions, tips, and registers',
        color: '#C7F36B',
        fields: [
          { name: 'Appointment', slug: 'appointment_id', type: 'relation', required: true, config: { target_module_id: 'appointments', display_field_slug: 'customer_id' } },
          { name: 'Service Total', slug: 'amount', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '45' } },
          { name: 'Tip Amount', slug: 'tip', type: 'currency', required: false, config: { currency_symbol: '$', placeholder: '10' } },
          { 
            name: 'Payment Method', 
            slug: 'method', 
            type: 'select', 
            required: true, 
            config: { options: ['Credit Card', 'Apple Pay', 'Cash', 'Gift Card'], default_value: 'Credit Card' } 
          },
          { name: 'Transaction Date', slug: 'paid_at', type: 'datetime', required: true, config: {} }
        ],
        seed_records: [
          { appointment_id: 'Marcus Thorne', amount: 95, tip: 20, method: 'Apple Pay', paid_at: '2026-08-24T15:45:00' },
          { appointment_id: 'Alexander Sterling', amount: 45, tip: 10, method: 'Credit Card', paid_at: '2026-08-20T17:00:00' }
        ]
      }
    ],
    widgets: [
      {
        title: "Today's Appointments",
        type: 'stat',
        module_slug: 'appointments',
        config: { aggregate: 'count', icon: 'Calendar', color: '#C7F36B', subtitle: 'Bookings scheduled for today' },
        width: 3,
        height: 1
      },
      {
        title: 'Daily Gross Revenue',
        type: 'stat',
        module_slug: 'payments',
        config: { metric_field: 'amount', aggregate: 'sum', icon: 'DollarSign', color: '#10B981', subtitle: 'Settled register volume' },
        width: 3,
        height: 1
      },
      {
        title: 'Registered Clients',
        type: 'stat',
        module_slug: 'customers',
        config: { aggregate: 'count', icon: 'Users', color: '#38BDF8', subtitle: 'Active customer profiles' },
        width: 3,
        height: 1
      },
      {
        title: 'Active Barbers & Staff',
        type: 'stat',
        module_slug: 'employees',
        config: { aggregate: 'count', icon: 'UserCheck', color: '#F43F5E', subtitle: 'Stylists currently on shift' },
        width: 3,
        height: 1
      },
      {
        title: 'Live Appointments Schedule',
        type: 'table',
        module_slug: 'appointments',
        config: { limit: 6 },
        width: 8,
        height: 4
      },
      {
        title: 'Recent Payments & Tips',
        type: 'recent_records',
        module_slug: 'payments',
        config: { limit: 4 },
        width: 4,
        height: 4
      }
    ],
    workflows: [
      {
        name: 'Auto-Create Payment Record on Appointment Completion',
        description: 'When an appointment status changes to Completed, automatically initialize the checkout payment record',
        trigger_module_slug: 'appointments',
        trigger_type: 'record_updated',
        conditions: [
          { field: 'status', operator: 'equals', value: 'Completed' }
        ],
        actions: [
          { action_type: 'log_activity', description: 'Log checkout receipt generated' }
        ]
      }
    ]
  },
  {
    id: 'photographer-os',
    name: 'Photographer OS',
    tagline: 'Visual production & photoshoot operations',
    category: 'Creative & Media',
    description: 'Track client bookings, production dates, shoot locations, packages, deliverables, and gear inventory.',
    icon: 'Camera',
    badge: 'Curated',
    modules: [
      {
        name: 'Clients',
        slug: 'clients',
        icon: 'Users',
        description: 'Couples, brands, models, and commercial directors',
        color: '#C7F36B',
        fields: [
          { name: 'Client Name', slug: 'name', type: 'text', required: true, config: { placeholder: 'Victoria & Gabriel' } },
          { 
            name: 'Client Category', 
            slug: 'category', 
            type: 'select', 
            required: true, 
            config: { options: ['Wedding & Couple', 'Commercial / Brand', 'Editorial / Fashion', 'Portrait'], default_value: 'Wedding & Couple' } 
          },
          { name: 'Email', slug: 'email', type: 'email', required: true, config: { placeholder: 'victoria@studio.com' } },
          { name: 'Instagram', slug: 'instagram', type: 'text', required: false, config: { placeholder: '@victoria_creative' } },
          { name: 'Phone', slug: 'phone', type: 'phone', required: false, config: { placeholder: '+1 555-901-4455' } }
        ],
        seed_records: [
          { name: 'Victoria & Gabriel', category: 'Wedding & Couple', email: 'v.gabriel@gmail.com', instagram: '@vicandgabe', phone: '+1 555-901-4455' },
          { name: 'Kinfolk Atelier', category: 'Commercial / Brand', email: 'press@kinfolkatelier.com', instagram: '@kinfolk_goods', phone: '+1 555-332-1100' },
          { name: 'Aurelia Solis', category: 'Editorial / Fashion', email: 'aurelia@solismag.com', instagram: '@aureliasolis', phone: '+1 555-776-5432' }
        ]
      },
      {
        name: 'Shoots',
        slug: 'shoots',
        icon: 'Aperture',
        description: 'Scheduled photoshoot sessions and post-production pipeline',
        color: '#EC4899',
        fields: [
          { name: 'Shoot Title', slug: 'title', type: 'text', required: true, config: { placeholder: 'Autumn Lookbook 2026' } },
          { name: 'Client', slug: 'client_id', type: 'relation', required: true, config: { target_module_id: 'clients', display_field_slug: 'name' } },
          { name: 'Shoot Date', slug: 'shoot_date', type: 'date', required: true, config: {} },
          { name: 'Location', slug: 'location', type: 'text', required: true, config: { placeholder: 'Studio Loft 4B, Brooklyn' } },
          { 
            name: 'Production Status', 
            slug: 'status', 
            type: 'select', 
            required: true, 
            config: { options: ['Booked', 'Shot', 'Culling / Selects', 'Color Grading', 'Delivered'], default_value: 'Booked' } 
          },
          { name: 'Final Delivery Date', slug: 'delivery_date', type: 'date', required: false, config: {} },
          { name: 'Fee', slug: 'fee', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '3200' } }
        ],
        seed_records: [
          { title: 'Coastline Editorial Campaign', client_id: 'Kinfolk Atelier', shoot_date: '2026-08-28', location: 'Big Sur, CA', status: 'Booked', delivery_date: '2026-09-12', fee: 4800 },
          { title: 'Villa Terrace Wedding', client_id: 'Victoria & Gabriel', shoot_date: '2026-09-05', location: 'Lake Como, Italy', status: 'Booked', delivery_date: '2026-10-01', fee: 8500 },
          { title: 'High-Fashion Studio Cover', client_id: 'Aurelia Solis', shoot_date: '2026-08-15', location: 'Studio 12, NYC', status: 'Color Grading', delivery_date: '2026-08-30', fee: 3500 }
        ]
      },
      {
        name: 'Packages',
        slug: 'packages',
        icon: 'Layers',
        description: 'Standard session pricing, coverage hours, and deliverable photo counts',
        color: '#38BDF8',
        fields: [
          { name: 'Package Name', slug: 'name', type: 'text', required: true, config: { placeholder: 'Full-Day Commercial Package' } },
          { name: 'Coverage Hours', slug: 'hours', type: 'number', required: true, config: { placeholder: '8' } },
          { name: 'Deliverable High-Res Images', slug: 'deliverables_count', type: 'number', required: true, config: { placeholder: '60' } },
          { name: 'Price', slug: 'price', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '3800' } },
          { name: 'Includes Second Shooter', slug: 'has_second_shooter', type: 'checkbox', required: false, config: { default_value: false } }
        ],
        seed_records: [
          { name: 'Editorial Half-Day (4h)', hours: 4, deliverables_count: 30, price: 2400, has_second_shooter: false },
          { name: 'Full-Day Commercial Lookbook (8h)', hours: 8, deliverables_count: 75, price: 4800, has_second_shooter: true },
          { name: 'Complete Wedding Story (10h)', hours: 10, deliverables_count: 450, price: 8500, has_second_shooter: true }
        ]
      },
      {
        name: 'Gear Inventory',
        slug: 'gear',
        icon: 'Sliders',
        description: 'Cameras, prime lenses, lighting packs, and accessories',
        color: '#F59E0B',
        fields: [
          { name: 'Item Name', slug: 'name', type: 'text', required: true, config: { placeholder: 'Sony A1 Mark II Body' } },
          { 
            name: 'Category', 
            slug: 'category', 
            type: 'select', 
            required: true, 
            config: { options: ['Camera Body', 'Prime Lens', 'Zoom Lens', 'Lighting & Modifiers', 'Audio & Rig'], default_value: 'Camera Body' } 
          },
          { name: 'Serial Number', slug: 'serial_no', type: 'text', required: false, config: { placeholder: 'SN-902184' } },
          { 
            name: 'Condition', 
            slug: 'condition', 
            type: 'select', 
            required: true, 
            config: { options: ['Pristine', 'Good', 'Requires Cleaning', 'In Repair'], default_value: 'Pristine' } 
          }
        ],
        seed_records: [
          { name: 'Sony A1 50MP Camera Body', category: 'Camera Body', serial_no: 'SY-992019', condition: 'Pristine' },
          { name: 'Sony G-Master 50mm f/1.2', category: 'Prime Lens', serial_no: 'GM-5012-44', condition: 'Pristine' },
          { name: 'Profoto B10X Plus Monolight Kit', category: 'Lighting & Modifiers', serial_no: 'PF-B10-88', condition: 'Good' }
        ]
      }
    ],
    widgets: [
      {
        title: 'Shoots Pipeline Value',
        type: 'stat',
        module_slug: 'shoots',
        config: { metric_field: 'fee', aggregate: 'sum', icon: 'DollarSign', color: '#C7F36B', subtitle: 'Total booked production contracts' },
        width: 3,
        height: 1
      },
      {
        title: 'Active Shoots in Pipeline',
        type: 'stat',
        module_slug: 'shoots',
        config: { aggregate: 'count', icon: 'Camera', color: '#EC4899', subtitle: 'Booked & currently in editing' },
        width: 3,
        height: 1
      },
      {
        title: 'Studio Clients',
        type: 'stat',
        module_slug: 'clients',
        config: { aggregate: 'count', icon: 'Users', color: '#38BDF8', subtitle: 'Direct accounts' },
        width: 3,
        height: 1
      },
      {
        title: 'Gear Items Ready',
        type: 'stat',
        module_slug: 'gear',
        config: { aggregate: 'count', icon: 'Sliders', color: '#10B981', subtitle: 'Pristine condition kits' },
        width: 3,
        height: 1
      },
      {
        title: 'Production Shoots Schedule',
        type: 'table',
        module_slug: 'shoots',
        config: { limit: 5 },
        width: 8,
        height: 4
      },
      {
        title: 'Active Client Roster',
        type: 'recent_records',
        module_slug: 'clients',
        config: { limit: 4 },
        width: 4,
        height: 4
      }
    ],
    workflows: [
      {
        name: 'Auto-Notify on Shoot Delivery',
        description: 'When shoot status moves to Delivered, log final client delivery handover',
        trigger_module_slug: 'shoots',
        trigger_type: 'record_updated',
        conditions: [
          { field: 'status', operator: 'equals', value: 'Delivered' }
        ],
        actions: [
          { action_type: 'log_activity', description: 'Log gallery link dispatched' }
        ]
      }
    ]
  },
  {
    id: 'real-estate-os',
    name: 'Real Estate OS',
    tagline: 'Property brokerage & deal flow engine',
    category: 'Property & Finance',
    description: 'Manage buyer leads, property listings, scheduled viewings, active deal contracts, and agent commissions.',
    icon: 'Building2',
    badge: 'Enterprise',
    modules: [
      {
        name: 'Leads',
        slug: 'leads',
        icon: 'UserPlus',
        description: 'Prospective buyers, investors, and tenants',
        color: '#C7F36B',
        fields: [
          { name: 'Lead Name', slug: 'name', type: 'text', required: true, config: { placeholder: 'Jonathan Hayes' } },
          { name: 'Email', slug: 'email', type: 'email', required: true, config: { placeholder: 'jhayes@investments.com' } },
          { name: 'Phone', slug: 'phone', type: 'phone', required: true, config: { placeholder: '+1 555-882-3100' } },
          { name: 'Max Budget', slug: 'budget', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '1500000' } },
          { 
            name: 'Pipeline Stage', 
            slug: 'stage', 
            type: 'select', 
            required: true, 
            config: { options: ['New Lead', 'Qualified', 'Viewing Arranged', 'Negotiation', 'Closed Won', 'Lost'], default_value: 'New Lead' } 
          }
        ],
        seed_records: [
          { name: 'Jonathan Hayes', email: 'jhayes@capital.com', phone: '+1 555-882-3100', budget: 1850000, stage: 'Viewing Arranged' },
          { name: 'Sofia Rodriguez', email: 'sofia.r@techventures.io', phone: '+1 555-442-9901', budget: 950000, stage: 'Negotiation' },
          { name: 'Ethan & Mia Bennett', email: 'ethan.bennett@gmail.com', phone: '+1 555-129-8755', budget: 1200000, stage: 'Qualified' }
        ]
      },
      {
        name: 'Properties',
        slug: 'properties',
        icon: 'Building',
        description: 'Available listings, penthouses, villas, and commercial spaces',
        color: '#6366F1',
        fields: [
          { name: 'Property Title', slug: 'title', type: 'text', required: true, config: { placeholder: 'The Horizon Penthouse' } },
          { name: 'Address / Area', slug: 'address', type: 'text', required: true, config: { placeholder: '742 Evergreen Terrace' } },
          { 
            name: 'Property Type', 
            slug: 'type', 
            type: 'select', 
            required: true, 
            config: { options: ['Luxury Penthouse', 'Single Family Villa', 'Modern Condo', 'Commercial Space', 'Land Plot'], default_value: 'Modern Condo' } 
          },
          { name: 'Listing Price', slug: 'price', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '1450000' } },
          { name: 'Bedrooms', slug: 'bedrooms', type: 'number', required: false, config: { placeholder: '3' } },
          { 
            name: 'Listing Status', 
            slug: 'status', 
            type: 'select', 
            required: true, 
            config: { options: ['Active Listing', 'Under Offer', 'Sold', 'Off Market'], default_value: 'Active Listing' } 
          }
        ],
        seed_records: [
          { title: 'The Skyview Penthouse 42B', address: '100 Riverside Blvd, New York', type: 'Luxury Penthouse', price: 2400000, bedrooms: 4, status: 'Active Listing' },
          { title: 'Cedar Hill Modern Villa', address: '44 Hillcrest Way, Austin TX', type: 'Single Family Villa', price: 1350000, bedrooms: 5, status: 'Under Offer' },
          { title: 'The Foundry Loft Unit 3', address: '88 Industrial Ave, Seattle WA', type: 'Modern Condo', price: 890000, bedrooms: 2, status: 'Active Listing' }
        ]
      },
      {
        name: 'Deals',
        slug: 'deals',
        icon: 'Briefcase',
        description: 'Active purchase offers and commission closings',
        color: '#10B981',
        fields: [
          { name: 'Deal Name', slug: 'name', type: 'text', required: true, config: { placeholder: 'Penthouse 42B Acquisition' } },
          { name: 'Buyer', slug: 'lead_id', type: 'relation', required: true, config: { target_module_id: 'leads', display_field_slug: 'name' } },
          { name: 'Property', slug: 'property_id', type: 'relation', required: true, config: { target_module_id: 'properties', display_field_slug: 'title' } },
          { name: 'Contract Price', slug: 'contract_price', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '1400000' } },
          { name: 'Agency Commission ($)', slug: 'commission', type: 'currency', required: true, config: { currency_symbol: '$', placeholder: '42000' } },
          { 
            name: 'Deal Status', 
            slug: 'status', 
            type: 'select', 
            required: true, 
            config: { options: ['Offer Submitted', 'Due Diligence', 'Escrow Pending', 'Closed Won', 'Deal Terminated'], default_value: 'Offer Submitted' } 
          },
          { name: 'Target Closing Date', slug: 'closing_date', type: 'date', required: true, config: {} }
        ],
        seed_records: [
          { name: 'Cedar Hill Villa Purchase', lead_id: 'Sofia Rodriguez', property_id: 'Cedar Hill Modern Villa', contract_price: 1320000, commission: 39600, status: 'Escrow Pending', closing_date: '2026-09-10' },
          { name: 'Skyview Penthouse Deal', lead_id: 'Jonathan Hayes', property_id: 'The Skyview Penthouse 42B', contract_price: 2350000, commission: 70500, status: 'Offer Submitted', closing_date: '2026-09-25' }
        ]
      }
    ],
    widgets: [
      {
        title: 'Active Deal Pipeline',
        type: 'stat',
        module_slug: 'deals',
        config: { metric_field: 'contract_price', aggregate: 'sum', icon: 'DollarSign', color: '#C7F36B', subtitle: 'Contract volume in closing' },
        width: 3,
        height: 1
      },
      {
        title: 'Projected Commission',
        type: 'stat',
        module_slug: 'deals',
        config: { metric_field: 'commission', aggregate: 'sum', icon: 'BadgePercent', color: '#10B981', subtitle: 'Brokerage fee receivables' },
        width: 3,
        height: 1
      },
      {
        title: 'Active Property Listings',
        type: 'stat',
        module_slug: 'properties',
        config: { aggregate: 'count', icon: 'Building', color: '#6366F1', subtitle: 'Properties available on market' },
        width: 3,
        height: 1
      },
      {
        title: 'Active Buyer Leads',
        type: 'stat',
        module_slug: 'leads',
        config: { aggregate: 'count', icon: 'Users', color: '#38BDF8', subtitle: 'Qualified buyers in pipeline' },
        width: 3,
        height: 1
      },
      {
        title: 'Active Deal Escrows & Offers',
        type: 'table',
        module_slug: 'deals',
        config: { limit: 5 },
        width: 8,
        height: 4
      },
      {
        title: 'Featured Property Inventory',
        type: 'recent_records',
        module_slug: 'properties',
        config: { limit: 4 },
        width: 4,
        height: 4
      }
    ],
    workflows: [
      {
        name: 'Auto-Mark Property Under Offer when Deal Advances',
        description: 'When deal status moves to Escrow Pending, log status and sync property listing',
        trigger_module_slug: 'deals',
        trigger_type: 'record_updated',
        conditions: [
          { field: 'status', operator: 'equals', value: 'Escrow Pending' }
        ],
        actions: [
          { action_type: 'log_activity', description: 'Log property locked in escrow' }
        ]
      }
    ]
  }
];

export const BLANK_TEMPLATE: TemplateDefinition = {
  id: 'scratch',
  name: 'Start from Scratch',
  tagline: 'Custom blank slate Business OS',
  category: 'Custom Builder',
  description: 'Design your own custom modules, fields, workflows, and dashboard from the ground up.',
  icon: 'PlusCircle',
  badge: 'Flexible',
  modules: [
    {
      name: 'Items',
      slug: 'items',
      icon: 'Boxes',
      description: 'Your primary business entities',
      color: '#C7F36B',
      fields: [
        { name: 'Name', slug: 'name', type: 'text', required: true, config: { placeholder: 'Item Name' } },
        { 
          name: 'Status', 
          slug: 'status', 
          type: 'select', 
          required: true, 
          config: { options: ['Active', 'Pending', 'Archived'], default_value: 'Active' } 
        },
        { name: 'Created Date', slug: 'created_date', type: 'date', required: false, config: {} },
        { name: 'Notes', slug: 'notes', type: 'longtext', required: false, config: { placeholder: 'Details' } }
      ],
      seed_records: [
        { name: 'First Business Item', status: 'Active', created_date: '2026-08-24', notes: 'Initial seed item for your custom OS.' }
      ]
    }
  ],
  widgets: [
    {
      title: 'Total Items',
      type: 'stat',
      module_slug: 'items',
      config: { aggregate: 'count', icon: 'Boxes', color: '#C7F36B', subtitle: 'All registered records' },
      width: 4,
      height: 1
    },
    {
      title: 'Recent Items',
      type: 'recent_records',
      module_slug: 'items',
      config: { limit: 5 },
      width: 8,
      height: 4
    }
  ],
  workflows: []
};
