import {Filter} from './filter';
import {Projection} from './projection';

export interface View
{
    id: string;
    name: string;
    projection: Projection;
    filters: Filter[];
}

export function createView(id: string = '', name: string = '',
                           projection: Projection = { xAxis: '', yAxis: '' },
                           filters: Filter[] = [])
{
    return {
        id,
        name,
        projection,
        filters
    };
}
