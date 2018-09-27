import React, {PureComponent} from 'react';
import ReactLoading from 'react-loading';
import styled from 'styled-components';

interface Props
{
    show?: boolean;
    width?: number;
    height?: number;
}

const Loader = styled(ReactLoading)`
  margin: 5px;
`;

export class Loading extends PureComponent<Props>
{
    static defaultProps: Props = {
        show: true,
        width: 24,
        height: 24
    };

    render()
    {
        if (!this.props.show) return null;

        return <Loader type='spin'
                             color='black'
                             width={this.props.width}
                             height={this.props.height} />;
    }
}
