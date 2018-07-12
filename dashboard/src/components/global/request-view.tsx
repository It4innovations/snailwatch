import React, {PureComponent} from 'react';
import {Request} from '../../util/request';
import {ErrorBox} from './error-box';
import {Loading} from './loading';

interface Props
{
    request: Request;
}

export class RequestView extends PureComponent<Props>
{
    render()
    {
        if (this.props.request.loading)
        {
            return <Loading />;
        }
        if (this.props.request.error)
        {
            return <ErrorBox error={this.props.request.error} />;
        }

        return null;
    }
}
