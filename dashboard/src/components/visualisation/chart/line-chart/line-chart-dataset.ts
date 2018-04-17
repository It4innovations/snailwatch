import {Measurement} from '../../../../lib/measurement/measurement';

export interface LineChartDataset
{
    name: string;
    selectionId: string;
    yAxis: string;
    measurements: Measurement[];
}
