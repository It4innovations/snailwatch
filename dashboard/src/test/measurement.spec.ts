import moment from 'moment';
import {groupMeasurements} from '../components/charts/chart/chart-utils';
import {GroupMode} from '../lib/measurement/group-mode';
import {Measurement} from '../lib/measurement/measurement';
import {formatKey, getResultKeys} from '../util/measurement';


function createMeasurement(measurement: Partial<Measurement>): Measurement
{
    return measurement as Measurement;
}

describe('Measurement grouper', () => {
    const dateFormat = 'DD. MM. YYYY HH:mm:ss';

    it('calculates average correctly', () => {
        const measurements: Measurement[] = [
            createMeasurement({ environment: { a: '1' }, result: {b: { value: '5', type: 'time' }} }),
            createMeasurement({ environment: { a: '1' }, result: {b: { value: '15', type: 'time' }} })
        ];

        const key = 'result.b.value';
        const grouped = groupMeasurements(measurements, GroupMode.AxisX, 'environment.a', [key], dateFormat);
        expect(grouped.hasOwnProperty('1')).toEqual(true);
        expect(grouped['1'].x === '1');
        expect(grouped['1'].items[key].average === 10);
    });
    it('handles empty measurements', () => {
        const measurements: Measurement[] = [];

        const key = 'result.b.value';
        const grouped = groupMeasurements(measurements, GroupMode.AxisX, 'environment.a', [key], dateFormat);
        expect(Object.keys(grouped).length).toEqual(0);
    });
    it('ignores measurements without valid x-axis', () => {
        const measurements: Measurement[] = [
            createMeasurement({ environment: { a: '1' }, result: {b: { value: '5', type: 'time' }} }),
            createMeasurement({ environment: { b: '1' }, result: {b: { value: '15', type: 'time' }} })
        ];

        const key = 'result.b.value';
        const grouped = groupMeasurements(measurements, GroupMode.AxisX, 'environment.a', [key], dateFormat);
        expect(Object.keys(grouped['1'].items).length).toEqual(1);
    });
    it('ignores measurements that do not have all y-axes', () => {
        const measurements: Measurement[] = [
            createMeasurement({ environment: { a: '1' }, result: {
                b: { value: '5', type: 'time' },
                c: { value: '5', type: 'time' }
            }}),
            createMeasurement({ environment: { a: '1' }, result: {
                b: { value: '5', type: 'time' }
            }}),
            createMeasurement({ environment: { a: '1' }, result: {
                c: { value: '5', type: 'time' }
            }}),
            createMeasurement({ environment: { a: '1' }, result: {
                d: { value: '5', type: 'time' }
            }}),
            createMeasurement({ environment: { a: '1' }, result: {
                b: { value: '5', type: 'time' },
                c: { value: '5', type: 'time' }
            }}),
        ];

        const keys = ['result.b.value', 'result.c.value'];
        const grouped = groupMeasurements(measurements, GroupMode.AxisX, 'environment.a', keys, dateFormat);

        for (const key of keys)
        {
            expect(grouped['1'].items[key].values.length).toEqual(2);
        }
    });
    it('groups measurements by date format correctly', () => {
        const format = 'DD. MM. YYYY';
        const measurements: Measurement[] = [
            createMeasurement({
                timestamp: moment('01. 01. 2018 11:12:13', dateFormat),
                environment: { a: '1' },
                result: {
                    b: { value: '5', type: 'time' },
                }}),
            createMeasurement({
                timestamp: moment('01. 01. 2018 14:10:03', dateFormat),
                environment: { a: '1' },
                result: {
                    b: { value: '5', type: 'time' }
                }}),
            createMeasurement({
                timestamp: moment('02. 01. 2018 11:12:13', dateFormat),
                environment: { a: '1' },
                result: {
                    b: { value: '5', type: 'time' }
                }}),
        ];

        const keys = ['result.b.value'];
        const grouped = groupMeasurements(measurements, GroupMode.AxisX, 'timestamp', keys, format);
        expect(Object.keys(grouped).length).toEqual(2);
        expect(grouped['01. 01. 2018'].measurements).toEqual(measurements.slice(0, 2));
        expect(grouped['02. 01. 2018'].measurements).toEqual(measurements.slice(2));
    });
});
describe('formatKey', () => {
    it('Removes prefix of keys', () => {
        expect(formatKey('environment.data')).toEqual('data');
        expect(formatKey('environment.data.value')).toEqual('data.value');
        expect(formatKey('data')).toEqual('data');
    });
    it('Removes suffix of result value keys', () => {
        expect(formatKey('result.data.value')).toEqual('data');
        expect(formatKey('result.data.type')).toEqual('data.type');
    });
});
describe('getResultKeys', () => {
    it('Returns result value keys from input array', () => {
        expect(getResultKeys([
            'enviroment.commit',
            'result.x1.value',
            'result.x1.time',
            'result.x2.value',
            'result.x2.time'
        ])).toEqual(['result.x1.value', 'result.x2.value']);
    });
});
