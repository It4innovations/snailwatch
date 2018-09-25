import {Dictionary} from 'ramda';
import {Deviation, MeasurementGroup} from '../chart-utils';

export interface LabeledGroup
{
    group: Dictionary<MeasurementGroup>;
    name: string;
    isAverageTrend: boolean;
    color: string;
}
export interface LineData
{
    group: MeasurementGroup | null;
    isAverageTrend: boolean;
    value: number | null;
    deviation: Deviation | null;
    range: number[] | null;
}
export interface LinePoint
{
    x: string;
    data: LineData[];
}
