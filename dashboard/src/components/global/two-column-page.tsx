import React, {Component} from 'react';
import styled from 'styled-components';
import {isFunction} from 'util';

type Element = JSX.Element | (() => JSX.Element);

interface Props
{
    menu: Element;
    content: Element;
}

interface OptionalProps
{
    menuWidth?: string;
    alignMenuToTop?: boolean;
}

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
`;
const MenuColumn = styled.div<{ width: string; alignMenuToTop: boolean; }>`
  width: ${props => props.width};
  margin-right: 10px;
  padding: 10px;
  background: #EAEAEA;
  border: 1px solid black;
  border-radius: 0 5px 5px 0;
  border-left: 0;
  ${props => props.alignMenuToTop && `
    border-top-right-radius: 0;
    border-top: 0;
  `}
`;
const ContentColumn = styled.div`
  flex-grow: 1;
`;

export class TwoColumnPage extends Component<Props & OptionalProps>
{
    static defaultProps: OptionalProps = {
        menuWidth: '400px',
        alignMenuToTop: true
    };

    render()
    {
        function render(element: Element): JSX.Element
        {
            if (isFunction(element))
            {
                return (element as () => JSX.Element)();
            }
            else return element as JSX.Element;
        }

        return (
            <Row>
                <MenuColumn width={this.props.menuWidth} alignMenuToTop={this.props.alignMenuToTop}>
                    {render(this.props.menu)}
                </MenuColumn>
                <ContentColumn>{render(this.props.content)}</ContentColumn>
            </Row>
        );
    }
}
