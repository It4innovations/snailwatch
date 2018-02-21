import React, {PureComponent} from 'react';

interface Props
{
    groupByEnvironment: boolean;
    onChangeGroup(value: boolean): void;
}

export class ChartSettings extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                <label>Group by environment:</label>
                <input type='checkbox'
                       checked={this.props.groupByEnvironment}
                       onChange={this.handleChangeGroup} />
            </div>
        );
    }

    handleChangeGroup = (e: React.FormEvent<HTMLInputElement>) =>
    {
        this.props.onChangeGroup(e.currentTarget.checked);
    }
}
