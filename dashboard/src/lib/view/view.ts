import {default as moment, Moment} from 'moment';
import {Measurement} from '../measurement/measurement';
import {Filter} from './filter';

export interface View
{
    id: string;
    name: string;
    filters: Filter[];
    yAxes: string[];
    measurements: Measurement[];
    created: Moment;
}

export function createView(view: Partial<View> = {}): View
{
    return {
        id: '',
        name: '',
        filters: [],
        yAxes: [],
        measurements: [],
        created: moment(),
        ...view
    };
}
