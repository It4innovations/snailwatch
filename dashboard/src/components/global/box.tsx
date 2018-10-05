import React, {PureComponent, ReactNode} from 'react';
import {Card, CardBody, CardHeader} from 'reactstrap';
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
  padding: 0 !important;
  margin-bottom: 5px;
`;
const Title = styled(CardHeader)<{hideable: boolean}>`
  padding: 0.25rem 0.75rem !important;
  font-size: 1.25rem;
  ${(props) => props.hideable ? 'cursor: pointer' : ''};
`;
const SlimBody = styled(CardBody)`
  padding: 0.75rem !important;
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
                {this.state.visible && <SlimBody>{this.props.children}</SlimBody>}
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
