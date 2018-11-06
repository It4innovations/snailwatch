import {sort} from 'ramda';
import React, {PureComponent} from 'react';
import {TooltipProps} from 'recharts';
import styled from 'styled-components';
import {Measurement} from '../../../lib/measurement/measurement';
import {compareDate} from '../../../util/date';
import {Deviation} from './chart-utils';

export interface TooltipDataset
{
    name: string;
    fill: string;
    measurements: Measurement[];
    value: number;
    deviation: Deviation;
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
  max-width: 450px;
  word-break: break-all;
`;
const DatasetLabel = styled.div<{color: string}>`
  color: ${props => props.color};
  text-shadow: 1px 1px 1px #AAAAAA;
`;
const DatasetInfo = styled.table`
  width: 100%;
  font-size: 0.9rem;
  border-collapse: collapse;
  td {
    border-bottom: 1px solid black;
    text-align: center;
    padding: 4px;
  }
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
                <AxisX>
                    <div><b>{this.props.xLabel}</b></div>
                    <div>{this.props.xValue}</div>
                </AxisX>
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
            <div key={`${dataset.name}.${index}`}>
                <DatasetLabel color={dataset.fill}>{name}</DatasetLabel>
                {!single &&
                <DatasetInfo>
                    <tbody>
                        <tr><td>Average</td><td>{dataset.value.toFixed(2)}</td></tr>
                        <tr><td>Std. dev.</td><td>{dataset.deviation.value.toFixed(2)}</td></tr>
                        <tr><td>Measurements</td><td>{dataset.measurements.length}</td></tr>
                        <tr><td>Timestamp</td><td>{this.generateTimestamp(dataset.measurements)}</td></tr>
                    </tbody>
                </DatasetInfo>
                }
            </div>
        );
    }

    generateTimestamp = (measurements: Measurement[]): string =>
    {
        const DATE_FORMAT = 'DD. MM. YYYY HH:mm:ss';
        if (measurements.length === 1) return measurements[0].timestamp.format(DATE_FORMAT);

        const dates = sort(compareDate, measurements.map(m => m.timestamp));

        // checks whether the two dates have the same (day, month, year)
        if (dates[0].isSame(dates[0], 'day'))
        {
            return `${dates[0].format(DATE_FORMAT)} - ${dates[1].format('HH:mm:ss')}`;
        }

        return `${dates[0].format(DATE_FORMAT)} - ${dates[dates.length - 1].format(DATE_FORMAT)}`;
    }
}
