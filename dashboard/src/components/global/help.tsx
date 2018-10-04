import React, {PureComponent, ReactNode} from 'react';
import FaQuestionCircle from 'react-icons/lib/fa/question-circle';
import {Popover, PopoverBody} from 'reactstrap';
import styled from 'styled-components';

interface Props
{
    content: ReactNode | string;
    className?: string;
}

const initialState = {
    isOpen: false
};

type State = Readonly<typeof initialState>;

const Wrapper = styled.div`
  display: inline-block;
`;

export class Help extends PureComponent<Props, State>
{
    readonly state = initialState;

    private iconRef: React.RefObject<HTMLDivElement> = React.createRef();

    render()
    {
        return (
            <>
                <Wrapper onMouseEnter={this.show}
                         onMouseLeave={this.hide}
                         innerRef={this.iconRef}
                         className={this.props.className}>
                    <FaQuestionCircle color='#7199C3' />
                </Wrapper>
                {this.iconRef.current &&
                    <Popover placement='right'
                             isOpen={this.state.isOpen}
                             target={this.iconRef.current}>
                        <PopoverBody>
                            {this.props.content}
                        </PopoverBody>
                    </Popover>
                }
            </>
        );
    }

    show = () =>
    {
        this.setState({ isOpen: true });
    }
    hide = () =>
    {
        this.setState({ isOpen: false });
    }
}
