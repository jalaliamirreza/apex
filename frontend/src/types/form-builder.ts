export interface PageDef {
  name: string;
  title: string;
  elements: (PanelDef | FieldDef)[];
}

export interface PanelDef {
  type: 'panel';
  name: string;
  title: string;
  elements: FieldDef[];
}

export interface FieldDef {
  type: string;
  name: string;
  title: string;
  isRequired?: boolean;
  placeholder?: string;
  inputType?: string;
  choices?: { value: string; text: string }[];
  rateCount?: number;
  acceptedTypes?: string;
}

export interface FieldPath {
  pageIndex: number;
  panelIndex?: number;
  fieldIndex: number;
}
