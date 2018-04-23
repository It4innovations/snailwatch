import React, {PureComponent} from 'react';
import {sort} from 'ramda';
import styled from 'styled-components';
import {MeasurementKeys} from '../../../global/measurement-keys';

interface Props
{
    measurementKeys: string[];
    xAxis: string;
    yAxis: string;
    onChangeXAxis(xAxis: string): void;
    onChangeYAxis(yAxes: string): void;
}

const Row = styled.div`
  display: flex;
  align-items: center;
`;

export class DataSelector extends PureComponent<Props>
{
    render()
    {
        const keys = sort((a, b) => a.localeCompare(b), this.props.measurementKeys);

        return (
            <div>
                <div>X axis</div>
                <MeasurementKeys keys={keys}
                                 value={this.props.xAxis}
                                 onChange={this.props.onChangeXAxis} />
                <div>Y axis</div>
                <Row>
                    <MeasurementKeys keys={keys}
                                     value={this.props.yAxis}
                                     onChange={this.props.onChangeYAxis} />
                </Row>
            </div>
        );
    }
}
