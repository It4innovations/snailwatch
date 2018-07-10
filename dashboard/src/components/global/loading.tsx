import React, {PureComponent} from 'react';
import ReactLoading from 'react-loading';

interface Props
{
    show: boolean;
}

export class Loading extends PureComponent<Props>
{
    render()
    {
        if (!this.props.show) return null;

        return <ReactLoading type='spin' color='black' width={24} height={24} />;
    }
}
