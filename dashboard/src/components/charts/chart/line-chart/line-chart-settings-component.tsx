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
            <>
                <Row>
                    <div>Show points: </div>
                    <input type='checkbox'
                           checked={this.props.settings.showPoints}
                           onChange={this.change('showPoints')} />
                </Row>
                <Row>
                    <div>Show lines: </div>
                    <input type='checkbox'
                           checked={this.props.settings.connectPoints}
                           onChange={this.change('connectPoints')} />
                </Row>
                <Row>
                    <div>Show trend: </div>
                    <input type='checkbox'
                           checked={this.props.settings.showAverageTrend}
                           onChange={this.change('showAverageTrend')} />
                </Row>
                <Row>
                    <div>Show error bars: </div>
                    <input type='checkbox'
                           checked={this.props.settings.showDeviation}
                           onChange={this.change('showDeviation')} />
                </Row>
            </>
        );
    }

    change = (attr: keyof LineChartSettings) => (e: React.SyntheticEvent<HTMLInputElement>) =>
    {
        this.props.onChangeSettings({
            ...this.props.settings,
            [attr]: e.currentTarget.checked
        });
    }
}
