import {chain, toUpper, uniq} from 'ramda';
import {getValueWithPath} from '../../util/object';
import {Measurement} from '../measurement/measurement';

function getKeys(measurements: Measurement[], dictKey: keyof Measurement): string[]
{
    return uniq(chain(m => Object.keys(m[dictKey]), measurements));
}
function encode(headers: string[], separator: string): string
{
    return headers.join(separator);
}
function capitalize(input: string): string
{
    return toUpper(input.charAt(0)) + input.substring(1);
}

export function exportCSV(measurements: Measurement[], separator: string = ';'): string
{
    const environmentKeys = getKeys(measurements, 'environment');
    const resultKeys = getKeys(measurements, 'result');

    const headers = encode([
        'Benchmark',
        'Timestamp',
        ...environmentKeys.map(capitalize),
        ...resultKeys.map(capitalize)
    ], separator);
    const body = measurements
        .map(m => encode([
            m.benchmark,
            m.timestamp.toISOString(),
            ...environmentKeys.map(k => getValueWithPath(m, `environment.${k}`)),
            ...resultKeys.map(k => getValueWithPath(m, `result.${k}.value`))
        ], separator))
        .join('\n');
    return `${headers}\n${body}`;
}
