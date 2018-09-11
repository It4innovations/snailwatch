import {standardDeviation} from '../util/math';

describe('Math helpers', () => {
    it('Calculates std dev correctly', () => {
        expect(standardDeviation([5, 3, 0, -12, 13.7]).toFixed(4)).toEqual('8.3291');
    });
});
