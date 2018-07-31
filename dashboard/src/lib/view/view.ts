import {Moment, default as moment} from 'moment';

export interface View
{
    id: string;
    name: string;
    selection: string;
    xAxis: string;
    yAxes: string[];
    created: Moment;
}

export function createView(view: Partial<View> = {}): View
{
    return {
        id: '',
        name: '',
        selection: null,
        xAxis: '',
        yAxes: [],
        created: moment(),
        ...view
    };
}
