import React, {PureComponent, RefObject} from 'react';
import styled from 'styled-components';
import {ChartToolbar} from './chart-toolbar';
import {ToolbarSettings} from './toolbar-settings';

interface Props
{
    children(ref: RefObject<React.Component<{}>>, settings: ToolbarSettings): JSX.Element;
}

const initialState = {
    settings: {
        responsive: false,
        fitToDomain: false
    } as ToolbarSettings
};
type State = Readonly<typeof initialState>;

const Toolbar = styled(ChartToolbar)`
  margin-bottom: 10px;
`;

export class ChartToolbarWrapper extends PureComponent<Props, State>
{
    readonly state = initialState;

    private ref: RefObject<React.Component<{}>> = React.createRef();

    render()
    {
        return (
            <div>
                <Toolbar settings={this.state.settings}
                              onChange={this.changeSettings}
                              chartRef={this.ref} />
                {this.props.children(this.ref, this.state.settings)}
            </div>
        );
    }

    changeSettings = (settings: ToolbarSettings) =>
    {
        this.setState({ settings });
    }
}
