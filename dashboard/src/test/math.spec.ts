import {standardDeviation} from '../util/math';

describe('Math helpers', () => {
    it('Calculates std dev correctly', () => {
        expect(standardDeviation([5, 3, 0, -12, 13.7]).toFixed(4)).toEqual('8.3291');
    });
    it('Calculates std dev zero for array of length one', () => {
        expect(standardDeviation([5])).toEqual(0);
    });
});
