import React, {PureComponent} from 'react';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {update, sort} from 'ramda';
import Button from 'reactstrap/lib/Button';
import MdDelete from 'react-icons/lib/md/delete';
import styled from 'styled-components';
import MdAddCircleOutline from 'react-icons/lib/md/add-circle-outline';
import {MeasurementKeys} from '../../../global/measurement-keys';
import {ResultKeys} from '../../../global/result-keys';

interface Props
{
    measurementKeys: string[];
    selection: Selection | null;
    xAxis: string;
    yAxes: string[];
    onChangeXAxis(xAxis: string): void;
    onChangeYAxes(yAxes: string[]): void;
    onChangeSelection(selection: Selection): void;
}

const Row = styled.div`
  display: flex;
  align-items: center;
`;
const AddButton = styled(Button)`
  margin-top: 5px;
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
                <div>Y axes</div>
                {this.props.yAxes.map((axis, index) =>
                    <Row key={index}>
                        <ResultKeys keys={keys}
                                    value={axis}
                                    onChange={(val) => this.changeYAxis(index, val)} />
                        <MdDelete size={26} onClick={() => this.removeYAxis(index)} />
                    </Row>
                )}
                <AddButton size='sm'
                           color='success'
                           title='Add axis'
                           onClick={this.addYAxis}>
                    <MdAddCircleOutline size={20} />
                </AddButton>
            </div>
        );
    }

    changeYAxis = (index: number, value: string) =>
    {
        const axes = update(index, value, this.props.yAxes);
        this.props.onChangeYAxes(axes);
    }
    addYAxis = () =>
    {
        this.props.onChangeYAxes([...this.props.yAxes, '']);
    }
    removeYAxis = (index: number) =>
    {
        this.props.onChangeYAxes(this.props.yAxes.filter((axis, i) => i !== index));
    }
}
