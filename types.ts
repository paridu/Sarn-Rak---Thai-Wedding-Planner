
export interface Guest {
  id: string;
  name: string;
  side: 'Groom' | 'Bride' | 'Mutual';
  status: 'Pending' | 'Confirmed' | 'Declined';
  plusOne: boolean;
  dietaryNeeds?: string;
  tableId?: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Appetizer' | 'Main' | 'Dessert' | 'Drink';
  notes?: string;
}

export interface ProductionTask {
  id: string;
  item: string;
  status: 'Pending' | 'In Progress' | 'Done';
}

export interface WeddingContext {
  coupleNames: { groom: string; bride: string };
  date?: string;
  budgetTotal: number;
  guests: Guest[];
  budgetItems: BudgetItem[];
  rituals: RitualTask[];
  gallery: GalleryImage[];
  // New Sections
  theme: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    backdropNotes: string;
  };
  tables: Table[];
  catering: MenuItem[];
  production: {
    videoTeam: string;
    projectors: number;
    tasks: ProductionTask[];
  };
}

export interface BudgetItem {
  id: string;
  category: string;
  item: string;
  estimated: number;
  actual: number;
  isPaid: boolean;
}

export interface RitualTask {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  order: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  type: 'Engagement' | 'Inspiration';
  createdAt: number;
}
