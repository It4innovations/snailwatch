import {Measurement} from '../../../lib/measurement/measurement';
import {Selection} from '../../../lib/measurement/selection/selection';

export interface LineChartDataset
{
    selection: Selection | null;
    yAxis: string;
    measurements: Measurement[];
}
