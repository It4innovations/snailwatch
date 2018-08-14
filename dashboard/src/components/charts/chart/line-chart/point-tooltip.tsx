import React, {PureComponent} from 'react';
import {TooltipProps} from 'recharts';
import {Tooltip, TooltipDataset} from '../tooltip';
import {LinePoint} from './line-point';

interface Props
{
    xAxis: string;
}

interface Payload
{
    name: string;
    dataKey: string;
    payload: LinePoint;
    fill: string;
}

export class PointTooltip extends PureComponent<TooltipProps & Props>
{
    render()
    {
        if (this.props.payload === null ||
            this.props.payload === undefined ||
            this.props.payload.length < 1) return null;

        const payloads = this.props.payload as {} as Payload[];
        const datasets = payloads.map(this.getDataset).filter(d => d !== null);
        const x = payloads[0].payload.x;

        return (
            <Tooltip xLabel={this.props.xAxis}
                     xValue={x}
                     datasets={datasets} />
        );
    }
    getDataset = (payload: Payload): TooltipDataset | null =>
    {
        const index = this.getIndex(payload.dataKey);

        if (payload.payload.data[index].group === null) return null;

        const point = payload.payload.data[index];

        return {
            name: payload.name,
            fill: payload.fill,
            value: point.value,
            deviation: { low: point.deviation[0], high: point.deviation[1] },
            measurements: point.group.measurements
        };
    }

    getIndex = (dataKey: string): number =>
    {
        return Number(dataKey.match(/data\[(\d+)]/)[1]);
    }
}
