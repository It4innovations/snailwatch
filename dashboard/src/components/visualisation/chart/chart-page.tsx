import React, {Component} from 'react';
import styled from 'styled-components';
import {isFunction} from 'util';

type Element = JSX.Element | (() => JSX.Element);

interface Props
{
    renderOptions: Element;
    renderGraph: Element;
}

const Row = styled.div`
  display: flex;
  width: 100%;
`;
const DatasetColumn = styled.div`
  min-width: 240px;
  margin-right: 10px;
  padding: 0 10px 0 0;
  border-right: 1px solid black;
`;
const BarColumn = styled.div`
  flex-grow: 1;
`;

export class ChartPage extends Component<Props>
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
                <DatasetColumn>{render(this.props.renderOptions)}</DatasetColumn>
                <BarColumn>{render(this.props.renderGraph)}</BarColumn>
            </Row>
        );
    }
}
