import {Deviation, MeasurementGroup} from '../chart-utils';

export interface LineData
{
    group: MeasurementGroup | null;
    value: number | null;
    deviation: Deviation | null;
    range: number[] | null;
}
export interface LinePoint
{
    x: string;
    data: LineData[];
}
