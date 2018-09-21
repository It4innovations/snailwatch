import React, {PureComponent} from 'react';
import {sort} from 'ramda';
import {compareDate} from '../../../util/date';
import {Request} from '../../../util/request';
import {RequestComponent} from './request-component';

interface Props
{
    requests: Request[];
}

export class MultiRequestComponent extends PureComponent<Props>
{
    render()
    {
        if (this.props.requests.length === 0) return null;
        const active = sort((a, b) => {
            if (a.completed && b.completed) return -compareDate(a.finishedAt, b.finishedAt);
            if (a.loading) return -1;
            if (b.loading) return 1;
            if (a.error) return -1;
            if (b.error) return 1;
            return 0;
        }, this.props.requests);

        if (!active) return null;
        return <RequestComponent request={active[0]} />;
    }
}
