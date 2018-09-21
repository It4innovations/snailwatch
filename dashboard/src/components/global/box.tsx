import React, {PureComponent, ReactNode} from 'react';
import {Card} from 'reactstrap';
import styled from 'styled-components';
import {Help} from './help';

interface Props
{
    title?: ReactNode | string;
    help?: ReactNode | string;
    className?: string;
    hideable?: boolean;
}

type State = Readonly<{
    visible: boolean;
}>;

const SlimCard = styled(Card)`
    padding: 10px !important;
    margin-bottom: 5px;
`;
const Title = styled.div<{hideable: boolean}>`
    font-size: 1.25rem;
    ${(props) => props.hideable ? 'cursor: pointer' : ''};
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export class Box extends PureComponent<Props, State>
{
    static defaultProps: Props = {
        title: '',
        help: '',
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
                {this.props.title &&
                    <Title onClick={this.handleClick} hideable={this.props.hideable}>
                        {this.renderTitle()}
                    </Title>
                }
                {this.state.visible && <>{this.props.children}</>}
            </SlimCard>
        );
    }
    renderTitle = (): JSX.Element =>
    {
        if (!this.props.help) return <>{this.props.title}</>;

        return (
            <Row>
                {this.props.title}
                <Help content={this.props.help} />
            </Row>
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
