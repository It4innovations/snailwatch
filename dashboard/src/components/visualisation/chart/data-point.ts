import {Measurement} from '../../../lib/measurement/measurement';

export interface DataPoint
{
    x: string;
    y: number;
    deviation: number[];
    measurements: Measurement[];
}
