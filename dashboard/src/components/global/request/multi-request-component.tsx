import React, {PureComponent} from 'react';
import {sort} from 'ramda';
import {compareDate} from '../../../util/date';
import {Request} from '../../../util/request';
import {RequestComponent} from './request-component';

interface Props
{
    requests: Request[];
}

export function selectActiveRequest(requests: Request[]): Request | null
{
    if (requests.length === 0) return null;

    const sorted = sort((a, b) => {
        if (a.completed && b.completed) return -compareDate(a.finishedAt, b.finishedAt);
        if (a.loading) return -1;
        if (b.loading) return 1;
        if (a.error) return -1;
        if (b.error) return 1;
        return a.completed ? -1 : 1;
    }, requests);

    return sorted[0];
}

export class MultiRequestComponent extends PureComponent<Props>
{
    render()
    {
        const active = selectActiveRequest(this.props.requests);
        if (!active) return null;
        return <RequestComponent request={active} />;
    }
}
