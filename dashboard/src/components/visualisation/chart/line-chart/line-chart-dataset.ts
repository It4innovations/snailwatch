import {Measurement} from '../../../../lib/measurement/measurement';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {formatKey} from '../../../../util/measurement';

export interface LineChartDataset
{
    id: string;
    selectionId: string;
    yAxis: string;
    measurements: Measurement[];
}
export type NamedLineChartDataset = LineChartDataset & {
    name: string;
};

export function nameDataset(dataset: LineChartDataset, selections: Selection[]): NamedLineChartDataset
{
    const selection = selections.find(s => s.id === dataset.selectionId);
    const selectionName = selection ? selection.name : 'all';
    return {
        ...dataset,
        name: `${selectionName}/${formatKey(dataset.yAxis)}`
    };
}
