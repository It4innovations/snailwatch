import {max, mean, min, reduce} from 'ramda';

export function maximum<T>(items: T[], initialValue: number = 0, accessor: (t: T) => number = x => Number(x))
{
    return reduce(max, initialValue, items.map(accessor)) as number;
}
export function minimum<T>(items: T[], initialValue: number = 0, accessor: (t: T) => number = x => Number(x))
{
    return reduce(min, initialValue, items.map(accessor)) as number;
}

export function compareNumber(a: number, b: number): 0 | -1 | 1
{
    return a === b ? 0 : a < b ? -1 : 1;
}

export function standardDeviation(data: number[]): number
{
    const average = mean(data);
    return Math.sqrt(mean(data.map(v => Math.pow(v - average, 2))));
}

export function exponentialAverage(data: number[], window: number, scale: number): number
{
    data = data.slice(Math.max(0, data.length - window));
    let avg = data[0];
    for (let i = 1; i < data.length; i++)
    {
        avg = (avg + data[i]) * scale;
    }
    return avg;
}
