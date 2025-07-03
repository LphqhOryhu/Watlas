export interface Source {
    id: string;
    title: string;
    type: 'jeu' | 'roman' | 'bd' | 'cinématique';
    year?: number;
}
