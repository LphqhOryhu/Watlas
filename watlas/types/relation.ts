export interface Relation {
    fromId: string;
    toId: string;
    type: string;
    dateStart?: string;
    dateEnd?: string;
    sources: string[];
}
