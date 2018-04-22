import {hashMeasurement, Measurement} from '../../../lib/measurement/measurement';
import {GroupMode} from '../../../lib/measurement/group-mode';
import {groupBy, values, min, max, reduce, sum, zipObj, Dictionary, all, map, filter, sort} from 'ramda';
import {getValueWithPath} from '../../../util/object';
import {isMoment, Moment} from 'moment';

export interface MeasurementGroup
{
    items: {
        [key: string]: {
            values: number[];
            average: number;
            deviation: {
                low: number;
                high: number;
            };
        };
    };
    x: string;
    hasDateAxis: boolean;
    measurements: Measurement[];
}

export function groupMeasurements(measurements: Measurement[], groupMode: GroupMode,
                                  axisX: string,
                                  axisY: string[]):
    Dictionary<MeasurementGroup>
{
    const batches = batchMeasurement(measurements, groupMode, axisX);
    const groups: Dictionary<MeasurementGroup> = map(batch => createGroup(batch, axisX, axisY), batches);

    return filter(isGroupValid, groups);
}
export function linearizeGroups(groups: Dictionary<MeasurementGroup>): MeasurementGroup[]
{
    return sort((a, b) => compareXValue(a.x, b.x), values(groups)).map(transformDateAxis);
}

export function formatXValue(value: string): string
{
    const DATE_FORMAT = 'DD. MM. YYYY HH:mm:ss';
    if (isMoment(value))
    {
        return value.format(DATE_FORMAT);
    }

    return value;
}

function createGroup(batch: Measurement[], axisX: string, axisY: string[]): MeasurementGroup
{
    const x = getXAxisValue(batch[0], axisX);
    const yValues = axisY.map(axis => {
        const vals: number[] = batch.map(value =>
            Number(getValueWithPath(value, axis)));
        const average = sum(vals) / vals.length;
        const deviation = {
            low: average - (reduce(min, vals[0], vals) as number),
            high: (reduce(max, vals[0], vals) as number) - average
        };

        return {
            values: vals,
            average,
            deviation
        };
    });

    return {
        x,
        hasDateAxis: isMoment(x),
        items: zipObj(axisY, yValues),
        measurements: batch
    };
}

function isGroupValid(group: MeasurementGroup): boolean
{
    return group.x && all(item => !isNaN(item.average), values(group.items));
}

function batchMeasurement(measurements: Measurement[], groupMode: GroupMode, axis: string = ''):
    Dictionary<Measurement[]>
{
    switch (groupMode)
    {
        case GroupMode.Benchmark:
            return groupBy(m => m.benchmark, measurements);
        case GroupMode.AxisX:
            return groupBy(m => formatXValue(getXAxisValue(m, axis)), measurements);
        case GroupMode.Environment:
            return groupBy(hashMeasurement, measurements);
        default:
            return groupBy(m => m.id, measurements);
    }
}

function getXAxisValue(measurement: Measurement, axis: string): string
{
    return getValueWithPath(measurement, axis);
}

function transformDateAxis(group: MeasurementGroup): MeasurementGroup
{
    if (group.hasDateAxis)
    {
        return {
            ...group,
            x: formatXValue(group.x)
        };
    }

    return group;
}

export function compareXValue(a: string, b: string): number
{
    if (isMoment(a) && isMoment(b))
    {
        return (a as {} as Moment).isBefore(b as {} as Moment) ? -1 : 1;
    }
    if (!isNaN(Number(a)) && !isNaN(Number(b)))
    {
        return Number(a) - Number(b);
    }

    return a.localeCompare(b);
}
