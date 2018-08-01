import {Moment, default as moment} from 'moment';

export interface View
{
    id: string;
    name: string;
    selection: string | null;
    yAxes: string[];
    created: Moment;
}

export function createView(view: Partial<View> = {}): View
{
    return {
        id: '',
        name: '',
        selection: null,
        yAxes: [],
        created: moment(),
        ...view
    };
}
