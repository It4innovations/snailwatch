import React, {PureComponent, Fragment} from 'react';
import {TooltipProps} from 'recharts';
import styled from 'styled-components';
import {LinePoint} from './line-point';
import {Measurement} from '../../../../lib/measurement/measurement';
import {compareDate} from '../../../../util/date';
import {sort} from 'ramda';

const TooltipWrapper = styled.div`
  background: #FFFFFF;
  border: 1px solid #DDDDDD;
  padding: 8px;
`;
const Dataset = styled.div`
  color: ${(props: {color: string}) => props.color}
`;

const DATE_FORMAT = 'DD. MM. YYYY HH:mm:ss';

interface Payload
{
    name: string;
    payload: LinePoint;
    fill: string;
}

export class PointTooltip extends PureComponent<TooltipProps>
{
    render()
    {
        if (this.props.payload === null ||
            this.props.payload === undefined ||
            this.props.payload.length < 1) return null;

        const payloads = this.props.payload as {} as Payload[];
        const datasets = payloads.map((p, index) =>
            this.renderDataset(index, p)
        );
        const x = payloads[0].payload.x;

        return (
            <TooltipWrapper>
                <div>{x.toString()}</div>
                <div>{datasets}</div>
            </TooltipWrapper>
        );
    }
    renderDataset = (index: number, payload: Payload): JSX.Element =>
    {
        if (payload.payload.data[index].group === null) return null;

        const point = payload.payload.data[index];
        const single = point.group.measurements.length === 1;
        let name = payload.name;
        if (single)
        {
            name = `${name}: ${point.value}`;
        }

        return (
            <div key={index}>
                <Dataset color={payload.fill}>{name}</Dataset>
                {!single &&
                    <>
                        <Fragment key={index}>
                            <div>Average: {point.value}</div>
                            <div>Deviation: [{point.deviation[0]}, {point.deviation[1]}]</div>
                        </Fragment>
                        <div>Timestamp: {this.generateTimestamp(point.group.measurements)}</div>
                    </>
                }
            </div>
        );
    }

    generateTimestamp = (measurements: Measurement[]): string =>
    {
        if (measurements.length === 1) return measurements[0].timestamp.format(DATE_FORMAT);

        const dates = sort(compareDate, measurements.map(m => m.timestamp));
        return `${dates[0].format(DATE_FORMAT)} - ${dates[dates.length - 1].format(DATE_FORMAT)}`;
    }
}
