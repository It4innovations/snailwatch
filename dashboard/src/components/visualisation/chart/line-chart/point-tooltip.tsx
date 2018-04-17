import React, {PureComponent, Fragment} from 'react';
import {TooltipProps} from 'recharts';
import styled from 'styled-components';
import {LinePoint} from './line-point';
import {Measurement} from '../../../../lib/measurement/measurement';
import {compareDate} from '../../../../util/date';
import {sort} from 'ramda';

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

export class PointTooltip extends PureComponent<TooltipProps & Props>
{
    render()
    {
        if (this.props.payload === null ||
            this.props.payload === undefined ||
            this.props.payload.length < 1) return null;

        const payloads = this.props.payload as {} as Payload[];
        const datasets = payloads.map(this.renderDataset);
        const x = payloads[0].payload.x;

        return (
            <TooltipWrapper>
                <AxisX>{this.props.xAxis}: {x.toString()}</AxisX>
                <div>{datasets}</div>
            </TooltipWrapper>
        );
    }
    renderDataset = (payload: Payload): JSX.Element =>
    {
        const index = this.getIndex(payload.dataKey);

        if (payload.payload.data[index].group === null) return null;

        const point = payload.payload.data[index];
        const single = point.group.measurements.length === 1;
        let name = payload.name;
        if (single)
        {
            name = `${name}: ${point.value}`;
        }

        return (
            <Dataset key={index}>
                <DatasetLabel color={payload.fill}>{name}</DatasetLabel>
                {!single &&
                    <DatasetInfo>
                        <Fragment key={index}>
                            <div>Average: {point.value}</div>
                            <div>Deviation: [{point.deviation[0]}, {point.deviation[1]}]</div>
                            <div>Measurements: {point.group.measurements.length}</div>
                        </Fragment>
                        <div>Timestamp: {this.generateTimestamp(point.group.measurements)}</div>
                    </DatasetInfo>
                }
            </Dataset>
        );
    }

    getIndex = (dataKey: string): number =>
    {
        return Number(dataKey.match(/data\[(\d+)]/)[1]);
    }

    generateTimestamp = (measurements: Measurement[]): string =>
    {
        const DATE_FORMAT = 'DD. MM. YYYY HH:mm:ss';
        if (measurements.length === 1) return measurements[0].timestamp.format(DATE_FORMAT);

        const dates = sort(compareDate, measurements.map(m => m.timestamp));
        return `${dates[0].format(DATE_FORMAT)} - ${dates[dates.length - 1].format(DATE_FORMAT)}`;
    }
}
