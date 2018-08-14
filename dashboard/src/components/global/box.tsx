import React, {PureComponent, ReactNode} from 'react';
import styled from 'styled-components';
import {Card} from 'reactstrap';

interface DefaultProps
{
    className?: string;
    hideable?: boolean;
}
type Props =
{
    title: ReactNode | string;
} & Partial<DefaultProps>;

type State = Readonly<{
    visible: boolean;
}>;

const SlimCard = styled(Card)`
    padding: 10px !important;
    margin-bottom: 5px;
`;
const Title = styled.div`
    font-size: 1.25rem;
    cursor: pointer;
`;

export class Box extends PureComponent<Props, State>
{
    static defaultProps: DefaultProps = {
        className: '',
        hideable: false
    };

    constructor(props: Props)
    {
        super(props);

        this.state = {
            visible: !props.hideable
        };
    }

    render()
    {
        return (
            <SlimCard body outline color='secondary' className={this.props.className}>
                <Title onClick={this.handleClick}>{this.props.title}</Title>
                {this.state.visible && <>{this.props.children}</>}
            </SlimCard>
        );
    }

    handleClick = () =>
    {
        if (this.props.hideable)
        {
            this.setState(state => ({ visible: !state.visible }));
        }
    }
}
