import {default as moment, Moment} from 'moment';
import {Measurement} from '../measurement/measurement';
import {Filter} from './filter';
import uuid from 'uuid';

export interface View
{
    id: string;
    name: string;
    filters: Filter[];
    yAxes: string[];
    watches: Watch[];
    measurements: Measurement[];
    created: Moment;
}
export interface Watch
{
    id: string;
    groupBy: string;
}

export function createView(view: Partial<View> = {}): View
{
    return {
        id: '',
        name: '',
        filters: [],
        yAxes: [],
        watches: [],
        measurements: [],
        created: moment(),
        ...view
    };
}
export function createWatch(watch: Partial<Watch>): Watch
{
    return {
        id: uuid.v4(),
        groupBy: '',
        ...watch
    };
}
