import {Filter} from './filter';
import {Projection} from './projection';

export interface View
{
    projection: Projection;
    filters: Filter[];
}
