export type PageType =
    | 'personnage'
    | 'lieu'
    | 'groupe'
    | 'période'
    | 'événement'
    | 'année'
    | 'objet'
    | 'support_narratif';

export interface Page {
    id: string;
    name: string;
    type: PageType;
    description?: string;
    category?: string; // ex : pour les groupes
}
