import React, {PureComponent} from 'react';
import Input from 'reactstrap/lib/Input';
import {GroupMode} from '../../lib/measurement/group-mode';

interface Props
{
    groupMode: GroupMode;
    onChangeGroupMode(value: GroupMode): void;
}

export class GroupModeSelector extends PureComponent<Props>
{
    render()
    {
        {/*<option value={GroupMode.None}>None</option>*/}
        {/*<option value={GroupMode.Benchmark}>Benchmark</option>*/}
        {/*<option value={GroupMode.Environment}>Environment</option>*/}

        return (
            <Input type='select'
                   bsSize='sm'
                   value={this.props.groupMode.toString()}
                   onChange={this.handleChangeGroup}>
                <option value={GroupMode.AxisX}>X axis</option>
            </Input>
        );
    }

    handleChangeGroup = (e: React.FormEvent<HTMLInputElement>) =>
    {
        this.props.onChangeGroupMode(Number(e.currentTarget.value) as GroupMode);
    }
}
