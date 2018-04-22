import React, {Component} from 'react';
import styled from 'styled-components';
import {isFunction} from 'util';

type Element = JSX.Element | (() => JSX.Element);

interface Props
{
    menu: Element;
    content: Element;
}

const Row = styled.div`
  display: flex;
  width: 100%;
`;
const MenuColumn = styled.div`
  min-width: 240px;
  margin-right: 10px;
  padding: 0 10px 0 0;
  border-right: 1px solid black;
`;
const ContentColumn = styled.div`
  flex-grow: 1;
`;

export class TwoColumnPage extends Component<Props>
{
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
                <MenuColumn>{render(this.props.menu)}</MenuColumn>
                <ContentColumn>{render(this.props.content)}</ContentColumn>
            </Row>
        );
    }
}
