import React, {PureComponent} from 'react';
import {GroupMode} from './line-chart';
import Input from 'reactstrap/lib/Input';

interface Props
{
    groupMode: GroupMode;
    onChangeGroupMode(value: GroupMode): void;
}

export class ChartSettings extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                <label>Group by:</label>
                <Input type='select'
                       value={this.props.groupMode.toString()}
                       onChange={this.handleChangeGroup}>
                    <option value={GroupMode.None}>None</option>
                    <option value={GroupMode.Benchmark}>Benchmark</option>
                    <option value={GroupMode.AxisX}>X axis</option>
                    <option value={GroupMode.Environment}>Environment</option>
                </Input>
            </div>
        );
    }

    handleChangeGroup = (e: React.FormEvent<HTMLInputElement>) =>
    {
        this.props.onChangeGroupMode(Number(e.currentTarget.value) as GroupMode);
    }
}
