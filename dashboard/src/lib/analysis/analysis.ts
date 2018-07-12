import {Filter} from '../measurement/selection/filter';
import {Moment, default as moment} from 'moment';

export interface Analysis
{
    id: string;
    name: string;
    filters: Filter[];
    trigger: string;
    observedValue: string;
    ratio: number;
    created: Moment;
}

export function createAnalysis(analysis: Partial<Analysis> = {}): Analysis
{
    return {
        id: '',
        name: '',
        filters: [],
        trigger: '',
        observedValue: '',
        ratio: 1,
        created: moment(),
        ...analysis
    };
}
