export interface Space {
  id: string;
  name: string;        // English
  nameFa?: string;     // Persian (Farsi)
  slug: string;        // URL slug
  icon: string;
  color: string;
  orderIndex: number;
  direction: 'ltr' | 'rtl';
  isActive: boolean;
  pages?: Page[];
}

export interface Page {
  id: string;
  spaceId: string;
  name: string;        // English
  nameFa?: string;     // Persian (Farsi)
  slug: string;        // URL slug
  icon: string;
  orderIndex: number;
  isDefault: boolean;
  isActive: boolean;
  sections?: Section[];
}

export interface Section {
  id: string;
  pageId: string;
  name: string;        // English
  nameFa?: string;     // Persian (Farsi)
  orderIndex: number;
  isActive: boolean;
  tiles?: Tile[];
}

export interface Tile {
  id: string;
  sectionId?: string;
  name: string;        // English
  nameFa?: string;     // Persian (Farsi)
  description?: string;
  icon: string;
  color: string;
  slug: string;
  type: 'form' | 'link' | 'kpi' | 'app';
  orderIndex: number;
  direction?: 'ltr' | 'rtl';
  config?: Record<string, any>;
  isActive?: boolean;
}
