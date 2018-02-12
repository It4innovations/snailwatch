import {Moment} from 'moment';

interface MeasurementRecord
{
    type: 'time' | 'size' | 'integer' | 'string';
    value: string | number;
}

export interface Measurement
{
    id: string;
    timestamp: Moment;
    benchmark: string;
    environment: { [key: string]: string };
    result: { [key: string]: MeasurementRecord };
}
