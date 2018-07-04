import {groupMeasurements} from '../components/visualisation/chart/chart-utils';
import {GroupMode} from '../lib/measurement/group-mode';
import {Measurement} from '../lib/measurement/measurement';

function createMeasurement(measurement: Partial<Measurement>): Measurement
{
    return measurement as Measurement;
}

describe('Measurement grouper', () => {
    it('calculates average correctly', () => {
        const measurements: Measurement[] = [
            createMeasurement({ environment: { a: '1' }, result: {b: { value: '5', type: 'time' }} }),
            createMeasurement({ environment: { a: '1' }, result: {b: { value: '15', type: 'time' }} })
        ];

        const key = 'result.b.value';
        const grouped = groupMeasurements(measurements, GroupMode.AxisX, 'environment.a', [key]);
        expect(grouped.hasOwnProperty('1')).toEqual(true);
        expect(grouped['1'].x === '1');
        expect(grouped['1'].items[key].average === 10);
    });
    it('handles empty measurements', () => {
        const measurements: Measurement[] = [];

        const key = 'result.b.value';
        const grouped = groupMeasurements(measurements, GroupMode.AxisX, 'environment.a', [key]);
        expect(Object.keys(grouped).length).toEqual(0);
    });
    it('ignores measurements without valid x-axis', () => {
        const measurements: Measurement[] = [
            createMeasurement({ environment: { a: '1' }, result: {b: { value: '5', type: 'time' }} }),
            createMeasurement({ environment: { b: '1' }, result: {b: { value: '15', type: 'time' }} })
        ];

        const key = 'result.b.value';
        const grouped = groupMeasurements(measurements, GroupMode.AxisX, 'environment.a', [key]);
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
        const grouped = groupMeasurements(measurements, GroupMode.AxisX, 'environment.a', keys);

        for (const key of keys)
        {
            expect(grouped['1'].items[key].values.length).toEqual(2);
        }
    });
});
