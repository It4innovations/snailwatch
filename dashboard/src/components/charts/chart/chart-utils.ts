import {isMoment, Moment, default as moment} from 'moment';
import {all, chain, Dictionary, filter, groupBy, map, reduce, sort, sum, uniq, values, zipObj} from 'ramda';
import {GroupMode} from '../../../lib/measurement/group-mode';
import {hashMeasurement, Measurement} from '../../../lib/measurement/measurement';
import {compareDate} from '../../../util/date';
import {maximum, minimum, standardDeviation} from '../../../util/math';
import {getValueWithPath} from '../../../util/object';
import {LinePoint} from './line-chart/line-point';


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
export function linearizeGroups(groups: Dictionary<MeasurementGroup>, dateFormat: string): MeasurementGroup[]
{
    return sort(
        (a, b) => compareDate(getMinTimestamp(a), getMinTimestamp(b)),
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

export function createLinePoints(datasets: Dictionary<MeasurementGroup>[], dateFormat: string): LinePoint[]
{
    const keys = uniq(chain(d => Object.keys(d), datasets));
    const vals: LinePoint[] = keys.map(x => ({
        x,
        data: datasets.map(d => {
            if (d.hasOwnProperty(x))
            {
                const item = d[x].items[Object.keys(d[x].items)[0]];
                return {
                    group: d[x],
                    value: item.average,
                    deviation: item.deviation,
                    range: [item.deviation.low, item.deviation.high]
                };
            }

            return {
                group: null,
                value: null,
                deviation: null,
                range: null
            };
        })
    }));

    return sort((a, b) => compareDate(getPointTimestamp(a), getPointTimestamp(b)), vals).map(val => ({
        ...val,
        x: formatXValue(val.x, dateFormat)
    }));
}

function getMinTimestamp(group: MeasurementGroup): Moment
{
    return reduce((a, b) => compareDate(a, b) === -1 ? a : b, moment(), group.measurements.map(m => m.timestamp));
}
function getPointTimestamp(data: LinePoint): Moment
{
    return reduce((a, b) => compareDate(a, b) === -1 ? a : b,
        moment(),
        data.data.map(d =>
            d.group === null ? moment() : getMinTimestamp(d.group)
        )
    );
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
            low: average - minimum(vals, vals[0]),
            high: maximum(vals, vals[0]) - average
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
