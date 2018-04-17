import React, {PureComponent} from 'react';

interface Props
{
    showDeviation: boolean;
    onChangeShowDeviation(value: boolean): void;
}

export class LineChartSettings extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                <div>
                    <span>Show deviation: </span>
                    <input type='checkbox'
                           checked={this.props.showDeviation}
                           onChange={this.changeShowDeviation} />
                </div>
            </div>
        );
    }

    changeShowDeviation = (e: React.SyntheticEvent<HTMLInputElement>) =>
    {
        this.props.onChangeShowDeviation(e.currentTarget.checked);
    }
}
