import {Moment} from 'moment';

export interface Project
{
    id: string;
    name: string;
    createdAt: Moment;
}
