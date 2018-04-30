import React, {PureComponent} from 'react';
import {TooltipProps} from 'recharts';
import {MeasurementGroup} from '../chart-utils';
import {Tooltip, TooltipDataset} from '../tooltip';

interface Props
{
    xAxis: string;
}

interface Payload
{
    name: string;
    dataKey: string;
    payload: MeasurementGroup;
    fill: string;
}

export class BarTooltip extends PureComponent<TooltipProps & Props>
{
    render()
    {
        if (this.props.payload === null ||
            this.props.payload === undefined ||
            this.props.payload.length < 1) return null;

        const payloads = this.props.payload as {} as Payload[];
        const datasets = payloads.map(this.getDataset);
        const x = payloads[0].payload.x;

        return (
            <Tooltip
                xLabel={this.props.xAxis}
                xValue={x}
                datasets={datasets} />
        );
    }
    getDataset = (payload: Payload): TooltipDataset =>
    {
        const point = payload.payload;
        const key = this.getKey(payload.dataKey);
        const data = point.items[key];
        const value = data.average;

        return {
            name: payload.name,
            fill: payload.fill,
            value,
            deviation: data.deviation,
            measurements: point.measurements
        };
    }

    getKey = (dataKey: string): string =>
    {
        const regex = new RegExp(/^items\["(.*)"]/);
        const match = regex.exec(dataKey);
        return match[1];
    }
}
