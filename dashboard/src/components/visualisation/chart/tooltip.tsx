import React, {PureComponent} from 'react';
import {TooltipProps} from 'recharts';
import styled from 'styled-components';
import {sort} from 'ramda';
import {Measurement} from '../../../lib/measurement/measurement';
import {compareDate} from '../../../util/date';

export interface TooltipDataset
{
    name: string;
    fill: string;
    measurements: Measurement[];
    value: number;
    deviation?: { low: number; high: number; };
}

interface Props
{
    xLabel: string;
    xValue: string;
    datasets: TooltipDataset[];
}

const TooltipWrapper = styled.div`
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
  padding: 8px;
`;
const Dataset = styled.div`
  border-bottom: 1px solid black;
  padding-bottom: 2px;
  margin-bottom: 2px;
  :last-child {
    border-bottom: none;
  }
`;
const DatasetLabel = styled.div`
  color: ${(props: {color: string}) => props.color}
`;
const DatasetInfo = styled.div`
  font-size: 0.75rem;
`;
const AxisX = styled.div`
  margin-bottom: 5px;
`;

export class Tooltip extends PureComponent<TooltipProps & Props>
{
    render()
    {
        return (
            <TooltipWrapper>
                <AxisX>{this.props.xLabel}: {this.props.xValue}</AxisX>
                <div>{this.props.datasets.map(this.renderDataset)}</div>
            </TooltipWrapper>
        );
    }
    renderDataset = (dataset: TooltipDataset, index: number): JSX.Element =>
    {
        const single = dataset.measurements.length === 1;

        let name = dataset.name;
        if (single)
        {
            name = `${name}: ${dataset.value}`;
        }

        return (
            <Dataset key={`${dataset.name}.${index}`}>
                <DatasetLabel color={dataset.fill}>{name}</DatasetLabel>
                {!single &&
                <DatasetInfo>
                    <div>Average: {dataset.value}</div>
                    <div>Deviation: [{dataset.deviation.low}, {dataset.deviation.high}]</div>
                    <div>Measurements: {dataset.measurements.length}</div>
                    <div>Timestamp: {this.generateTimestamp(dataset.measurements)}</div>
                </DatasetInfo>
                }
            </Dataset>
        );
    }

    generateTimestamp = (measurements: Measurement[]): string =>
    {
        const DATE_FORMAT = 'DD. MM. YYYY HH:mm:ss';
        if (measurements.length === 1) return measurements[0].timestamp.format(DATE_FORMAT);

        const dates = sort(compareDate, measurements.map(m => m.timestamp));
        return `${dates[0].format(DATE_FORMAT)} - ${dates[dates.length - 1].format(DATE_FORMAT)}`;
    }
}
