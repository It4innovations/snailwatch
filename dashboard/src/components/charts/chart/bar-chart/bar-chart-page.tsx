import React, {Fragment, PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import styled from 'styled-components';
import {RangeHelp, ViewListHelp, XAxisHelp} from '../../../../help';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {Project} from '../../../../lib/project/project';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {getSelectedProject} from '../../../../state/session/project/reducers';
import {getViews} from '../../../../state/session/view/reducers';
import {Box} from '../../../global/box';
import {TwoColumnPage} from '../../../global/two-column-page';
import {RangeFilterSwitcher} from '../../range-filter/range-filter-switcher';
import {ViewSelection} from '../../view/view-selection';
import {ChartBottomPanel} from '../chart-bottom-panel';
import {XAxisSelector} from '../x-axis-selector';
import {XAxisSettings} from '../x-axis-settings';
import {BarChart} from './bar-chart';

interface OwnProps
{
    rangeFilter: RangeFilter;
    xAxisSettings: XAxisSettings;
    onChangeRangeFilter(rangeFilter: RangeFilter): void;
    onChangeXAxisSettings(settings: XAxisSettings): void;
}
interface StateProps
{
    project: Project;
    views: View[];
    selectedViews: string[];
}
type Props = OwnProps & StateProps & RouteComponentProps<void>;

interface State
{
    groupMode: GroupMode;
    selectedMeasurements: Measurement[];
    selectedView: string | null;
}

const ChartsWrapper = styled.div`
  min-height: 300px;
`;

class BarChartPageComponent extends PureComponent<Props, State>
{
    readonly state: State = {
        groupMode: GroupMode.AxisX,
        selectedMeasurements: [],
        selectedView: null
    };

    render()
    {
        return (
            <TwoColumnPage
                menu={this.renderOptions}
                menuWidth='auto'
                content={this.renderGraph}
                alignMenuToTop={false} />
        );
    }
    renderOptions = (): JSX.Element =>
    {
        return (
            <>
                <Box title='Range' help={RangeHelp}>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.props.onChangeRangeFilter} />
                </Box>
                <Box title='X axis' help={XAxisHelp}>
                    <XAxisSelector project={this.props.project}
                                   settings={this.props.xAxisSettings}
                                   onChange={this.props.onChangeXAxisSettings} />
                </Box>
                <Box title='View list' help={ViewListHelp}>
                    <ViewSelection onEditView={this.setSelectedView} />
                </Box>
            </>
        );
    }
    renderGraph = (): JSX.Element =>
    {
        const view = this.props.views.find(v => v.id === this.state.selectedView) || null;

        return (
            <div>
                <ChartsWrapper>
                    {this.props.selectedViews.length === 0 ? 'Select a view' :
                        this.props.selectedViews.map(this.renderDataset)}
                </ChartsWrapper>
                <ChartBottomPanel
                    view={view}
                    project={this.props.project}
                    selectedMeasurements={this.state.selectedMeasurements}
                    deselectView={this.deselectView}
                    deselectMeasurements={this.deselectMeasurements} />
            </div>
        );
    }
    renderDataset = (viewId: string): JSX.Element =>
    {
        const view = this.props.views.find(v => v.id === viewId);
        if (!view) return <Fragment key={viewId}>Select a view</Fragment>;

        return (
            <BarChart key={viewId}
                      measurements={view.measurements}
                      xAxis={this.props.xAxisSettings.xAxis}
                      yAxes={view.yAxes}
                      groupMode={this.state.groupMode}
                      dateFormat={this.props.xAxisSettings.dateFormat}
                      onMeasurementsSelected={this.changeSelectedMeasurements} />
        );
    }

    deselectMeasurements = () =>
    {
        this.changeSelectedMeasurements([]);
    }
    changeSelectedMeasurements = (selectedMeasurements: Measurement[]) =>
    {
        this.setState({ selectedMeasurements  });
    }

    setSelectedView = (selectedView: View) =>
    {
        this.setState({ selectedView: selectedView.id });
    }
    deselectView = () =>
    {
        this.setState({ selectedView: null });
    }
}

export const BarChartPage = withRouter(connect<StateProps, {}, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    views: getViews(state),
    selectedViews: state.session.pages.chartState.selectedViews
}))(BarChartPageComponent));
