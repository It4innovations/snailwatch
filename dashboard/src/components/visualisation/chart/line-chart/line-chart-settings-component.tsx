import React, {PureComponent} from 'react';
import {LineChartSettings} from './line-chart-settings';
import styled from 'styled-components';

interface Props
{
    settings: LineChartSettings;
    onChangeSettings(settings: LineChartSettings): void;
}

const Row = styled.div`
  display: flex;
  align-items: center;
`;
const Label = styled.div`
  width: 150px;
`;

export class LineChartSettingsComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                <Row>
                    <Label>Connect points: </Label>
                    <input type='checkbox'
                           checked={this.props.settings.connectPoints}
                           onChange={this.changeConnectPoints} />
                </Row>
                <Row>
                    <Label>Show deviation: </Label>
                    <input type='checkbox'
                           checked={this.props.settings.showDeviation}
                           onChange={this.changeShowDeviation} />
                </Row>
            </div>
        );
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
