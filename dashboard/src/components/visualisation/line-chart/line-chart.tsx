import React, {PureComponent} from 'react';
import {
    CartesianGrid, ScatterChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis, Scatter
} from 'recharts';
import {Measurement} from '../../../lib/measurement/measurement';
import ellipsize from 'ellipsize';
import {GroupMode} from '../../../lib/measurement/group-mode';
import {groupMeasurements, MeasurementGroup} from '../../../lib/measurement/measurement-grouper';
import {ColorPalette} from '../color-palette';
import {sort} from 'ramda';

export interface LineChartView
{
    yAxis: string;
    measurements: Measurement[];
}

interface Props
{
    views: LineChartView[];
    xAxis: string;
    groupMode: GroupMode;
    connectPoints: boolean;
    onMeasurementsSelected(measurements: Measurement[]): void;
}

interface ScatterPoint
{
    x: string;
    y: number;
    measurements: Measurement[];
}

const SCATTER_COLORS = new ColorPalette([
    '#DD0000',
    '#00DD00',
    '#0000DD',
    '#DD2288'
]);

export class LineChart extends PureComponent<Props>
{
    render()
    {
        if (this.props.views.length > 1 && this.props.groupMode === GroupMode.None)
        {
            return 'You have to use a group mode with multiple datasets';
        }

        const horizontalPadding = 20;
        const verticalPadding = 20;

        const datasets = this.props.views.map(v => sort((a, b) => a.x.localeCompare(b.x),
            groupMeasurements(v.measurements, this.props.groupMode, this.props.xAxis, [v.yAxis]))
        );
        const scatters = this.createScatterPoints(datasets);

        return (
            <>
                <ResponsiveContainer width='100%' height={400}>
                    <ScatterChart>
                        <CartesianGrid stroke='#ccc' />
                        <XAxis
                            allowDuplicatedCategory={false}
                            padding={{left: horizontalPadding, right: horizontalPadding}}
                            tickFormatter={this.formatX}
                            dataKey='x' />
                        <YAxis dataKey='y' padding={{bottom: verticalPadding, top: verticalPadding}} />
                        <Tooltip />
                        {scatters.map((scatter, index) =>
                            <Scatter
                                key={index}
                                onClick={this.selectMeasurements}
                                data={scatter}
                                fill={SCATTER_COLORS.getColor(index)}
                                line={this.props.connectPoints} />
                        )}
                    </ScatterChart>
                </ResponsiveContainer>
            </>
        );
    }
    formatX = (value: string): string =>
    {
        return ellipsize(value, 18);
    }

    createScatterPoints = (datasets: MeasurementGroup[][]): ScatterPoint[][] =>
    {
        return datasets.map(d => d.map(group => ({
            x: group.x,
            y: group.items[Object.keys(group.items)[0]].average,
            measurements: group.measurements
        })));
    }

    selectMeasurements = (data: {payload: ScatterPoint}) =>
    {
        this.props.onMeasurementsSelected(data.payload.measurements);
    }
}
