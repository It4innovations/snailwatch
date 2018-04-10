import {Moment} from 'moment';

export interface Project
{
    id: string;
    name: string;
    measurementKeys: string[];
    createdAt: Moment;
}
