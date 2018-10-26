import {default as moment, Moment} from 'moment';
import {chain, clone, reduce, sort, uniq} from 'ramda';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {compareDate} from '../../../../util/date';
import {exponentialAverage} from '../../../../util/math';
import {ColorPalette} from '../../color-palette';
import {formatXValue, getMinTimestamp, groupMeasurements, linearizeGroups, sortPoints} from '../chart-utils';
import {SortMode} from '../sort-mode';
import {LineChartDataset} from './line-chart';
import {LabeledGroup, LinePoint} from './line-point';

export function createLineData(datasets: LineChartDataset[],
                               groupMode: GroupMode,
                               xAxis: string,
                               dateFormat: string,
                               useAverages: boolean,
                               sortMode: SortMode,
                               palette: ColorPalette): {
    groups: LabeledGroup[],
    points: LinePoint[]
}
{
    const groups = datasets.map((v, index) => ({
        group: groupMeasurements(v.measurements, groupMode, xAxis, [v.yAxis], dateFormat),
        name: v.name,
        isAverageTrend: false,
        color: palette.getColor(index)
    }));

    if (useAverages)
    {
        groups.push(...groups.map((labeledGroup, i) => {
            const group = labeledGroup.group;
            const linearized = linearizeGroups(group, dateFormat, sortMode);
            const averageGroup = clone(group);
            linearized.forEach((l, index) => {
                const key = Object.keys(group[l.x].items)[0];
                const subset = linearized.slice(0, index + 1);
                const averages = subset.map(s => s.items[key].average);
                averageGroup[l.x].items[key].average = exponentialAverage(averages, 10, 0.5);
            });

            return {
                group: averageGroup,
                isAverageTrend: true,
                name: `${datasets[i].name} (trend)`,
                color: labeledGroup.color
            };
        }));
    }

    return {
        groups,
        points: createLinePoints(groups, dateFormat, sortMode)
    };
}

function createLinePoints(datasets: LabeledGroup[], dateFormat: string, sortMode: SortMode): LinePoint[]
{
    const keys = uniq(chain(d => Object.keys(d.group), datasets));
    const vals: LinePoint[] = keys.map(x => ({
        x,
        data: datasets.map(d => {
            if (d.group.hasOwnProperty(x))
            {
                const item = d.group[x].items[Object.keys(d.group[x].items)[0]];
                return {
                    group: d.group[x],
                    value: item.average,
                    deviation: item.deviation,
                    range: [item.deviation.low, item.deviation.high],
                    isAverageTrend: d.isAverageTrend
                };
            }

            return {
                group: null,
                value: null,
                deviation: null,
                range: null,
                isAverageTrend: false
            };
        })
    }));

    return sort((a, b) => sortPoints(sortMode, getPointTimestamp, a, b), vals).map(val => ({
        ...val,
        x: formatXValue(val.x, dateFormat)
    }));
}
function getPointTimestamp(data: LinePoint): Moment
{
    return reduce((a, b) => compareDate(a, b) === -1 ? a : b,
        moment(),
        data.data.map(d =>
            d.group === null ? moment() : getMinTimestamp(d.group)
        )
    );
}
