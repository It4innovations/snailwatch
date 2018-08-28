import {Measurement} from '../../../../lib/measurement/measurement';
import {RangeFilter} from '../../../../lib/measurement/selection/range-filter';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {equals} from 'ramda';

interface CacheRecord
{
    selection: Selection;
    rangeFilter: RangeFilter;
    measurements: Measurement[];
}

const items: Record<string, CacheRecord> = {};

function isRangeFilterEqual(a: RangeFilter, b: RangeFilter): boolean
{
    if (a.useDateFilter !== b.useDateFilter) return false;
    if (a.useDateFilter)
    {
        return a.from.isSame(b.from) && a.to.isSame(b.to);
    }
    else return a.entryCount === b.entryCount;
}

export function insertMeasurementsRecord(selection: Selection, rangeFilter: RangeFilter, measurements: Measurement[])
{
    items[selection.id] = {
        selection,
        rangeFilter,
        measurements
    };
}
export function getMeasurementsRecord(selection: Selection, rangeFilter: RangeFilter): Measurement[] | null
{
    const id = selection.id;
    if (!items.hasOwnProperty(id)) return null;

    const item = items[id];
    if (equals(item.selection.filters, selection.filters) && isRangeFilterEqual(rangeFilter, item.rangeFilter))
    {
        return item.measurements;
    }
    else return null;
}
