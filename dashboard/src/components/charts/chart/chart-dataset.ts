import {Measurement} from '../../../lib/measurement/measurement';

export interface ChartDataset
{
    id: string;
    view: string;
    measurements: Measurement[];
}
