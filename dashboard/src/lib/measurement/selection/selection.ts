import {Filter} from './filter';

export interface Selection
{
    id: string;
    name: string;
    filters: Filter[];
}

export function createSelection(selection: Partial<Selection> = {}): Selection
{
    return {
        id: null,
        name: '',
        filters: [],
        ...selection
    };
}
