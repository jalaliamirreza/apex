export interface ColumnConfig {
  key: string;
  label: string;
  type?: 'text' | 'icon' | 'boolean' | 'date';
  width?: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'switch' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface AdminAppConfig {
  entity: string;
  endpoint: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  actions?: {
    canAdd?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
  };
}
