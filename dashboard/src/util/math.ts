import {mean} from 'ramda';

export function standardDeviation(data: number[]): number
{
    const average = mean(data);
    return Math.sqrt(mean(data.map(v => Math.pow(v - average, 2))));
}
