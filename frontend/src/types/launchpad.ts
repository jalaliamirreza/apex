export interface Space {
  id: string;
  name: string;        // English
  nameFa?: string;     // Persian
  slug: string;        // URL slug
  icon: string;
  color: string;
  orderIndex: number;
  direction: 'ltr' | 'rtl';
  isActive: boolean;
  pages: Page[];
}

export interface Page {
  id: string;
  spaceId: string;
  name: string;        // English
  nameFa?: string;     // Persian
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
  nameFa?: string;     // Persian
  orderIndex: number;
  isActive: boolean;
  tiles: Tile[];
}

export interface Tile {
  id: string;
  name: string;        // English
  nameFa?: string;     // Persian
  description?: string;
  icon: string;
  color: string;
  slug: string;
  type: 'form' | 'link' | 'kpi' | 'app';
  orderIndex: number;
  direction?: 'ltr' | 'rtl';
  config?: {
    route?: string;
    permissions?: string[];
    [key: string]: any;
  };
}
