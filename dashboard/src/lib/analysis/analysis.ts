import {Filter} from '../measurement/selection/filter';

export interface Analysis
{
    id: string;
    name: string;
    filters: Filter[];
    trigger: string;
    observedValue: string;
    ratio: number;
}
