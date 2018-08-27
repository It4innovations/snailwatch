import React, {PureComponent} from 'react';
import styled from 'styled-components';
import {LineChartSettings} from './line-chart-settings';

interface Props
{
    settings: LineChartSettings;
    onChangeSettings(settings: LineChartSettings): void;
}

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export class LineChartSettingsComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                <Row>
                    <div>Show points: </div>
                    <input type='checkbox'
                           checked={this.props.settings.showPoints}
                           onChange={this.changeShowPoints} />
                </Row>
                <Row>
                    <div>Show lines: </div>
                    <input type='checkbox'
                           checked={this.props.settings.connectPoints}
                           onChange={this.changeConnectPoints} />
                </Row>
                <Row>
                    <div>Show deviation: </div>
                    <input type='checkbox'
                           checked={this.props.settings.showDeviation}
                           onChange={this.changeShowDeviation} />
                </Row>
            </div>
        );
    }

    changeShowPoints = (e: React.SyntheticEvent<HTMLInputElement>) =>
    {
        this.props.onChangeSettings({
            ...this.props.settings,
            showPoints: e.currentTarget.checked
        });
    }
    changeConnectPoints = (e: React.SyntheticEvent<HTMLInputElement>) =>
    {
        this.props.onChangeSettings({
            ...this.props.settings,
            connectPoints: e.currentTarget.checked
        });
    }
    changeShowDeviation = (e: React.SyntheticEvent<HTMLInputElement>) =>
    {
        this.props.onChangeSettings({
            ...this.props.settings,
            showDeviation: e.currentTarget.checked
        });
    }
}
