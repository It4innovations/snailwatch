import {default as moment, Moment} from 'moment';
import {Filter} from './filter';

export interface View
{
    id: string;
    name: string;
    filters: Filter[];
    yAxes: string[];
    created: Moment;
}

export function createView(view: Partial<View> = {}): View
{
    return {
        id: '',
        name: '',
        filters: [],
        yAxes: [],
        created: moment(),
        ...view
    };
}
