import React, {PureComponent} from 'react';
import {Selection} from '../../../lib/measurement/selection/selection';
import {update} from 'ramda';
import Button from 'reactstrap/lib/Button';
import {getMeasurementKeys, Measurement} from '../../../lib/measurement/measurement';
import MdDelete from 'react-icons/lib/md/delete';
import styled from 'styled-components';
import {Input} from 'reactstrap';
import MdAddCircleOutline from 'react-icons/lib/md/add-circle-outline';

interface Props
{
    measurements: Measurement[];
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

export class DataSelector extends PureComponent<Props>
{
    render()
    {
        const keys = getMeasurementKeys(this.props.measurements);
        keys.sort();

        return (
            <div>
                <div>X axis</div>
                {this.renderMeasurementKeys(keys, this.props.xAxis, this.props.onChangeXAxis)}
                <div>Y axes</div>
                {this.props.yAxes.map((axis, index) =>
                    <Row key={index}>
                        {this.renderMeasurementKeys(keys, axis, (val) => this.changeYAxis(index, val))}
                        <MdDelete size={26} onClick={() => this.removeYAxis(index)} />
                    </Row>
                )}
                <Button onClick={this.addYAxis}>
                    <MdAddCircleOutline size={20} /> add axis
                </Button>
            </div>
        );
    }
    renderMeasurementKeys = (keys: string[], value: string, onChange: (value: string) => void): JSX.Element =>
    {
        return (
            <Input type='select'
                   bsSize='sm'
                   value={value}
                   onChange={e => onChange(e.currentTarget.value)}>
                <option key='' value='' />
                {keys.map(key =>
                    <option key={key} value={key}>{key}</option>
                )}
            </Input>
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
