import {Filter} from '../view/filter';

export function buildRequestFilter(filters: Filter[]): string
{
    return filters.map(filter =>
        `${filter.path}${filter.operator}"${filter.value}"`
    ).join('&&');
}
