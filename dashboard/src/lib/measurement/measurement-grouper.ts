import {hashMeasurement, Measurement} from './measurement';
import {GroupMode} from './group-mode';
import {groupBy, values, min, max, reduce, sum, zipObj, Dictionary, all} from 'ramda';
import {getValueWithPath} from '../../util/object';
import {Moment, isMoment} from 'moment';

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
    measurements: Measurement[];
}

export function groupMeasurements(measurements: Measurement[], groupMode: GroupMode,
                                  axisX: string,
                                  axisY: string[]):
    MeasurementGroup[]
{
    const batches = batchMeasurement(measurements, groupMode, axisX);
    return cleanGroups(values(batches)
        .map(batch => {
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
                measurements: batch,
                items: zipObj(axisY, yValues)
            };
        }));
}

function cleanGroups(groups: MeasurementGroup[]): MeasurementGroup[]
{
    return groups.filter(g => g.x && all(item => !isNaN(item.average), values(g.items)));
}

function batchMeasurement(measurements: Measurement[], groupMode: GroupMode, axis: string = ''):
    Dictionary<Measurement[]>
{
    switch (groupMode)
    {
        case GroupMode.Benchmark:
            return groupBy(m => m.benchmark, measurements);
        case GroupMode.AxisX:
            return groupBy(m => getXAxisValue(m, axis), measurements);
        case GroupMode.Environment:
            return groupBy(hashMeasurement, measurements);
        default:
            return groupBy(m => m.id, measurements);
    }
}

function getXAxisValue(measurement: Measurement, axis: string): string
{
    const DATE_FORMAT = 'DD. MM. YYYY HH:mm:ss';
    const value = getValueWithPath(measurement, axis);
    if (isMoment(value))
    {
        return (value as {} as Moment).format(DATE_FORMAT);
    }
    return value;
}
