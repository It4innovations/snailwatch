import {Moment} from 'moment';
import {map, sort, sum, values as objValues} from 'ramda';
import {
    AggregatedResult,
    groupMeasurements,
    linearizeGroups,
    MeasurementGroup
} from '../../components/charts/chart/chart-utils';
import {compareDate} from '../../util/date';
import {exponentialAverage} from '../../util/math';
import {formatKey} from '../../util/measurement';
import {GroupMode} from '../measurement/group-mode';
import {Measurement} from '../measurement/measurement';
import {View} from '../view/view';

export interface RelPerformance
{
    groups: MeasurementGroup[];
    change: number | null;
    trend: number;
    lastUpload: Moment;
}

export function aggregateSum(group: MeasurementGroup): number
{
    return sum(map((res: AggregatedResult) => res.average, objValues(group.items)));
}
export function aggregateSumDescribe(view: View): string
{
    return view.yAxes.map(formatKey).join(' + ');
}

export function calculateRelPerformance(view: View, measurements: Measurement[], axisX: string,
                                        trendWindow: number, dateFormat: string,
                                        aggregate: (group: MeasurementGroup) => number = aggregateSum): RelPerformance
{
    const groups = groupMeasurements(
        measurements, GroupMode.AxisX, axisX,
        view.yAxes, dateFormat
    );
    const linearized = linearizeGroups(groups, dateFormat);

    return {
        groups: linearized,
        change: calculateChange(linearized, aggregate),
        trend: calculateTrend(linearized, aggregate, trendWindow, 0.5),
        lastUpload: getLastUpload(view, linearized)
    };
}

function getLastUpload(view: View, groups: MeasurementGroup[]): Moment | null
{
    if (groups.length === 0) return null;

    const dates = sort(compareDate, groups[groups.length - 1].measurements.map(m => m.timestamp));
    return dates[dates.length - 1];
}

function calculateChange(groups: MeasurementGroup[], aggregate: (group: MeasurementGroup) => number): number | null
{
    if (groups.length < 2) return 1;

    const current = aggregate(groups[groups.length - 1]);
    const last = aggregate(groups[groups.length - 2]);
    if (last === 0) return null;

    return current / last;
}

function calculateTrend(groups: MeasurementGroup[], aggregate: (group: MeasurementGroup) => number,
                        trendWindow: number, scale: number): number | null
{
    if (groups.length < 2) return 1;

    const emva = exponentialAverage(groups.map(aggregate), trendWindow, scale);
    return aggregate(groups[groups.length - 1]) / emva;
}
