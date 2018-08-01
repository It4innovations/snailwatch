import React, {PureComponent} from 'react';
import {Request} from '../../util/request';
import {Loading} from './loading';

interface Props
{
    request: Request;
}

export class RequestComponent extends PureComponent<Props>
{
    render()
    {
        if (this.props.request.loading)
        {
            return <Loading />;
        }
        if (this.props.request.error)
        {
            return <div>{this.props.request.error}</div>;
        }

        return null;
    }
}
