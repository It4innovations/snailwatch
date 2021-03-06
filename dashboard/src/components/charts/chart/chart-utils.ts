import {default as moment, isMoment, Moment} from 'moment';
import {all, Dictionary, filter, groupBy, map, reduce, sort, sum, values, zipObj} from 'ramda';
import {GroupMode} from '../../../lib/measurement/group-mode';
import {hashMeasurement, Measurement} from '../../../lib/measurement/measurement';
import {compareDate} from '../../../util/date';
import {standardDeviation} from '../../../util/math';
import {getValueWithPath} from '../../../util/object';
import {SortMode} from './sort-mode';


export interface Deviation
{
    /**
     * Standard deviation.
     */
    value: number;
    /**
     * Average - minimum.
     */
    low: number;
    /**
     * Maximum - average.
     */
    high: number;
}
export interface MeasurementGroup
{
    items: {
        [key: string]: AggregatedResult;
    };
    x: string;
    hasDateAxis: boolean;
    measurements: Measurement[];
}
export interface AggregatedResult
{
    values: number[];
    average: number;
    deviation: Deviation;
}

export function getValidMeasurements(measurements: Measurement[], axisX: string, axesY: string[]): Measurement[]
{
    return measurements.filter(m => {
        return hasAxis(m, axisX) && all(a => hasAxis(m, a), axesY);
    });
}

export function groupMeasurements(measurements: Measurement[],
                                  groupMode: GroupMode,
                                  axisX: string,
                                  axesY: string[],
                                  dateFormat: string):
    Dictionary<MeasurementGroup>
{
    const valid = getValidMeasurements(measurements, axisX, axesY);
    const batches = batchMeasurement(valid, groupMode, axisX, dateFormat);
    const groups: Dictionary<MeasurementGroup> = map(batch => createGroup(batch, axisX, axesY), batches);
    return filter(isGroupValid, groups);
}
export function linearizeGroups(groups: Dictionary<MeasurementGroup>, dateFormat: string, sortMode: SortMode)
    : MeasurementGroup[]
{
    return sort(
        (a, b) => sortPoints(sortMode, getMinTimestamp, a, b),
        values(groups)
    ).map(v => transformDateAxis(v, dateFormat));
}

export function formatXValue(value: string, dateFormat: string): string
{
    if (isMoment(value))
    {
        return value.format(dateFormat);
    }

    return value;
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

export function getMinTimestamp(group: MeasurementGroup): Moment
{
    return reduce((a, b) => compareDate(a, b) === -1 ? a : b, moment(), group.measurements.map(m => m.timestamp));
}

export function formatYAxis(value: string): string
{
    const num = Number(value);
    const table = [{
        divisor: 1000,
        suffix: 'K'
    }, {
        divisor: 1000 * 1000,
        suffix: 'M'
    }, {
        divisor: 1000 * 1000 * 1000,
        suffix: 'G'
    }];

    for (let i = table.length - 1; i >= 0; i--)
    {
        const entry = table[i];
        const div = num / entry.divisor;

        if (div >= 1)
        {
            const normalized = div.toFixed(2).replace(/\.?(0)+$/, '');
            return `${normalized}${entry.suffix}`;
        }
    }

    return value;
}

export function sortPoints<T extends {x: string}>(sortMode: SortMode,
                                                  getTimestamp: (t: T) => Moment, a: T, b: T): number
{
    if (sortMode === SortMode.Timestamp)
    {
        return compareDate(getTimestamp(a), getTimestamp(b));
    }
    else if (sortMode === SortMode.AxisXNumeric)
    {
        return Number(a.x) - Number(b.x);
    }
    else if (sortMode === SortMode.AxisXLexicographic)
    {
        return a.x.toLocaleLowerCase().localeCompare(b.x.toLocaleLowerCase());
    }
    else throw new Error(`Invalid sort mode: ${sortMode}`);
}

function hasAxis(measurement: Measurement, axis: string)
{
    return getValueWithPath(measurement, axis) !== undefined;
}

function createGroup(batch: Measurement[], axisX: string, axisY: string[]): MeasurementGroup
{
    const x = getXAxisValue(batch[0], axisX);
    const yValues = axisY.map(axis => {
        const vals: number[] = batch.map(value =>
            Number(getValueWithPath(value, axis)));
        const average = sum(vals) / vals.length;
        const stddev = standardDeviation(vals);
        const deviation = {
            value: stddev,
            low: stddev,
            high: stddev
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

/**
 * Groups measurements into disjoint sets according to the given group mode.
 */
function batchMeasurement(measurements: Measurement[], groupMode: GroupMode, axis = '',
                          dateFormat: string = 'DD. MM. YYYY HH:mm:ss'
):
    Dictionary<Measurement[]>
{
    switch (groupMode)
    {
        case GroupMode.Benchmark:
            return groupBy(m => m.benchmark, measurements);
        case GroupMode.AxisX:
            return groupBy(m => formatXValue(getXAxisValue(m, axis), dateFormat), measurements);
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

function transformDateAxis(group: MeasurementGroup, dateFormat: string): MeasurementGroup
{
    if (group.hasDateAxis)
    {
        return {
            ...group,
            x: formatXValue(group.x, dateFormat)
        };
    }

    return group;
}
