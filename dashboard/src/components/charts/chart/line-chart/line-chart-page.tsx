import {chain} from 'ramda';
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import styled from 'styled-components';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {Project} from '../../../../lib/project/project';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {setChartXAxisAction} from '../../../../state/session/pages/chart-page/actions';
import {getSelectedProject} from '../../../../state/session/project/reducer';
import {getViews} from '../../../../state/session/view/reducer';
import {formatKey} from '../../../../util/measurement';
import {Box} from '../../../global/box';
import {MeasurementKeys} from '../../../global/keys/measurement-keys';
import {TwoColumnPage} from '../../../global/two-column-page';
import {RangeFilterSwitcher} from '../../range-filter-switcher';
import {ViewManager} from '../../view/view-manager';
import {ViewSelection} from '../../view/view-selection';
import {MeasurementList} from '../measurement-list';
import {LineChart, LineChartDataset} from './line-chart';
import {LineChartSettings} from './line-chart-settings';
import {LineChartSettingsComponent} from './line-chart-settings-component';

interface OwnProps
{
    rangeFilter: RangeFilter;
    onChangeRangeFilter(rangeFilter: RangeFilter): void;
}
interface StateProps
{
    project: Project;
    views: View[];
    selectedViews: string[];
    xAxis: string;
}
interface DispatchProps
{
    setXAxis(axis: string): void;
}
type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    groupMode: GroupMode;
    selectedMeasurements: Measurement[];
    settings: LineChartSettings;
    selectedView: string | null;
}

const Row = styled.div`
  display: flex;
  align-items: stretch;
`;
const MeasurementsWrapper = styled.div`
  width: 900px;
`;
const ViewManagerWrapper = styled.div`
  flex-grow: 1;
  margin-left: 15px;
  padding-left: 15px;
  border-left: 1px solid #000000;
`;

class LineChartPageComponent extends PureComponent<Props, State>
{
    state: State = {
        groupMode: GroupMode.AxisX,
        selectedMeasurements: [],
        settings: {
            showPoints: false,
            connectPoints: true,
            showDeviation: false
        },
        selectedView: null
    };

    render()
    {
        return (
            <TwoColumnPage
                menu={this.renderOptions}
                menuWidth='auto'
                content={this.renderGraph} />
        );
    }
    renderOptions = (): JSX.Element =>
    {
        return (
            <>
                <Box title='Range'>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.props.onChangeRangeFilter} />
                </Box>
                <Box title='X axis'>
                    <MeasurementKeys project={this.props.project}
                                     value={this.props.xAxis}
                                     onChange={this.props.setXAxis} />
                </Box>
                <Box title='View list'>
                    <ViewSelection onEditView={this.setSelectedView} />
                </Box>
                <Box title='Settings'>
                    <LineChartSettingsComponent
                        settings={this.state.settings}
                        onChangeSettings={this.changeSettings} />
                </Box>
            </>
        );
    }
    renderGraph = (): JSX.Element =>
    {
        const datasets = this.expandDatasets(this.props.selectedViews);
        const view = this.props.views.find(v => v.id === this.state.selectedView);
        return (
            <>
                <h4>Line chart</h4>
                <LineChart
                    xAxis={this.props.xAxis}
                    height={400}
                    responsive={true}
                    groupMode={this.state.groupMode}
                    connectPoints={this.state.settings.connectPoints}
                    showPoints={this.state.settings.showPoints}
                    showDeviation={this.state.settings.showDeviation}
                    onMeasurementsSelected={this.changeSelectedMeasurements}
                    datasets={datasets} />
                <Row>
                    <MeasurementsWrapper>
                        <h4>Selected measurements</h4>
                        <MeasurementList measurements={this.state.selectedMeasurements}
                                         project={this.props.project} />
                    </MeasurementsWrapper>
                    <ViewManagerWrapper>
                        {view && <ViewManager view={view} onClose={this.deselectView} />}
                    </ViewManagerWrapper>
                </Row>
            </>
        );
    }

    expandDatasets = (viewIds: string[]): LineChartDataset[] =>
    {
        return chain(viewId => {
            const view = this.props.views.find(v => v.id === viewId);
            if (view === undefined)
            {
                return [];
            }

            return view.yAxes.map(yAxis => ({
                name: `${view.name} (${formatKey(yAxis)})`,
                yAxis,
                measurements: view.measurements
            }));
        }, viewIds);
    }

    changeSelectedMeasurements = (selectedMeasurements: Measurement[]) =>
    {
        this.setState({ selectedMeasurements  });
    }
    changeSettings = (settings: LineChartSettings) =>
    {
        this.setState({ settings });
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

export const LineChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    views: getViews(state),
    selectedViews: state.session.pages.chartState.selectedViews,
    xAxis: state.session.pages.chartState.xAxis
}), {
    setXAxis: setChartXAxisAction
})(LineChartPageComponent));
