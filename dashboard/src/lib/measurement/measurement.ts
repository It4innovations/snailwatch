import {Moment} from 'moment';
import {toString} from 'ramda';
import {getAllKeysMerged} from '../../util/object';

interface MeasurementRecord
{
    type: 'time' | 'size' | 'integer' | 'string';
    value: string;
}

export interface Measurement
{
    id: string;
    timestamp: Moment;
    benchmark: string;
    environment: { [key: string]: string };
    result: { [key: string]: MeasurementRecord };
}

export function hashMeasurement(measurement: Measurement): string
{
    return toString({
        benchmark: measurement.benchmark,
        environment: measurement.environment
    });
}
export function getMeasurementKeys(measurements: Measurement[]): string[]
{
    return getAllKeysMerged(measurements, m => ({
        timestamp: m.timestamp,
        benchmark: m.benchmark,
        environment: m.environment,
        result: m.result
    }));
}
