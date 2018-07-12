import React, {PureComponent} from 'react';
import ReactLoading from 'react-loading';
import styled from 'styled-components';

interface Props
{
    show?: boolean;
}

const Loader = styled(ReactLoading)`
  margin: 5px;
`;

export class Loading extends PureComponent<Props>
{
    render()
    {
        const show = this.props.show === undefined ? true : this.props.show;
        if (!show) return null;

        return <Loader type='spin'
                             color='black'
                             width={24}
                             height={24} />;
    }
}
