export type PageType =
    | 'personnage'
    | 'lieu'
    | 'groupe'
    | 'période'
    | 'événement'
    | 'année'
    | 'objet'
    | 'support_narratif';

export interface Section {
    title: string;
    content: string;
}

export interface Page {
    id: string;
    name: string;
    type: PageType;
    sections?: Section[];  // Remplace description par un tableau de sections
    relations?: string[];
    imageUrl?: string;
}
