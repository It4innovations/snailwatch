import {Filter} from './filter';

export interface Selection
{
    id: string;
    name: string;
    filters: Filter[];
}

export function createSelection(id: string = '', name: string = '', filters: Filter[] = [])
{
    return {
        id,
        name,
        filters
    };
}
