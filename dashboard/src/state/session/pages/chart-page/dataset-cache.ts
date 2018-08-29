import {Measurement} from '../../../../lib/measurement/measurement';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {equals} from 'ramda';
import {View} from '../../../../lib/view/view';

interface CacheRecord
{
    view: View;
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

export function insertMeasurementsRecord(view: View, rangeFilter: RangeFilter, measurements: Measurement[])
{
    items[view.id] = {
        view,
        rangeFilter,
        measurements
    };
}
export function getMeasurementsRecord(view: View, rangeFilter: RangeFilter): Measurement[] | null
{
    const id = view.id;
    if (!items.hasOwnProperty(id)) return null;

    const item = items[id];
    if (equals(item.view.filters, view.filters) && isRangeFilterEqual(rangeFilter, item.rangeFilter))
    {
        return item.measurements;
    }
    else return null;
}
