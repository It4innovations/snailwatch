import React, {PureComponent} from 'react';
import {TooltipProps} from 'recharts';
import styled from 'styled-components';
import {DataPoint} from './data-point';
import {Measurement} from '../../../../lib/measurement/measurement';
import {compareDate} from '../../../../util/date';
import {sort} from 'ramda';

const TooltipWrapper = styled.div`
  background: rgba(180, 180, 180, 0.5);
  padding: 5px;
`;

interface Props
{
    groupByEnvironment: boolean;
}

const DATE_FORMAT = 'DD. MM. YYYY HH:mm:ss';

export class PointTooltip extends PureComponent<TooltipProps & Props>
{
    render()
    {
        if (this.props.payload === null ||
            this.props.payload === undefined ||
            this.props.payload.length < 1) return null;

        const point = (this.props.payload[0] as {} as {payload: DataPoint}).payload;
        const content = this.props.groupByEnvironment ?
            <>
                <div>Avg: {point.y}</div>
                <div>Deviation: [{point.deviation[0]}, {point.deviation[1]}]</div>
            </> :
            <div>Value: {point.y}</div>;
        return (
            <TooltipWrapper>
                <div>Label: {point.x.toString()}</div>
                <div>Timestamp: {this.generateTimestamp(point.measurements)}</div>
                {content}
            </TooltipWrapper>
        );
    }

    generateTimestamp = (measurements: Measurement[]): string =>
    {
        if (measurements.length === 1) return measurements[0].timestamp.format(DATE_FORMAT);

        const dates = sort(compareDate, measurements.map(m => m.timestamp));
        return `${dates[0].format(DATE_FORMAT)} - ${dates[dates.length - 1].format(DATE_FORMAT)}}`;
    }
}
