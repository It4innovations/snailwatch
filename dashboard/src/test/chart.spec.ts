import {formatYAxis} from '../components/charts/chart/chart-utils';

describe('formatYAxis', () => {
    it('formats zero as zero', () => {
        expect(formatYAxis('0')).toEqual('0');
    });
    it('formats numbers lower than minimum suffix', () => {
        expect(formatYAxis('1')).toEqual('1');
        expect(formatYAxis('999')).toEqual('999');
    });
    it('formats thousands', () => {
        expect(formatYAxis('1000')).toEqual('1K');
        expect(formatYAxis('1001')).toEqual('1K');
        expect(formatYAxis('1202')).toEqual('1.2K');
        expect(formatYAxis('1230')).toEqual('1.23K');
    });
    it('formats millions', () => {
        expect(formatYAxis('1000000')).toEqual('1M');
        expect(formatYAxis('1000001')).toEqual('1M');
        expect(formatYAxis('1200154')).toEqual('1.2M');
        expect(formatYAxis('1990000')).toEqual('1.99M');
    });
    it('formats billions', () => {
        expect(formatYAxis('1000000000')).toEqual('1G');
        expect(formatYAxis('1000000001')).toEqual('1G');
        expect(formatYAxis('1205688702')).toEqual('1.21G');
        expect(formatYAxis('1234576718')).toEqual('1.23G');
    });
});
