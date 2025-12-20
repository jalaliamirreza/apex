export interface Space {
  id: string;
  name: string;        // English
  name_fa?: string;     // Persian (Farsi)
  slug: string;        // URL slug
  icon: string;
  color: string;
  order_index: number;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
  pages?: Page[];
}

export interface Page {
  id: string;
  space_id: string;
  name: string;        // English
  name_fa?: string;     // Persian (Farsi)
  slug: string;        // URL slug
  icon: string;
  order_index: number;
  is_default: boolean;
  is_active: boolean;
  sections?: Section[];
}

export interface Section {
  id: string;
  page_id: string;
  name: string;        // English
  name_fa?: string;     // Persian (Farsi)
  order_index: number;
  is_active: boolean;
  tiles?: Tile[];
}

export interface Tile {
  id: string;
  section_id?: string;
  name: string;        // English
  name_fa?: string;     // Persian (Farsi)
  description?: string;
  icon: string;
  color: string;
  slug: string;
  type: 'form' | 'link' | 'kpi' | 'app';
  order_index: number;
  direction?: 'ltr' | 'rtl';
  config?: Record<string, any>;
  is_active?: boolean;
}
