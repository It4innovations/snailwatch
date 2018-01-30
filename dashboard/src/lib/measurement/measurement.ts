import {Moment} from 'moment';

interface MeasurementRecord
{
    type: 'time' | 'size' | 'integer' | 'string';
    value: string | number;
}

export interface Measurement
{
    id: string;
    benchmark: string;
    environment: { [key: string]: string };
    measurement: { [key: string]: MeasurementRecord };
    createdAt: Moment;
}
