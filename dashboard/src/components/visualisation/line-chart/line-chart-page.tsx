import React, {PureComponent} from 'react';
import {RangeFilter} from '../../../lib/measurement/selection/range-filter';
import {LineChart} from './line-chart';
import {GroupMode} from '../../../lib/measurement/group-mode';
import {GroupModeSelector} from '../group-mode-selector';
import {Measurement} from '../../../lib/measurement/measurement';
import {User} from '../../../lib/user/user';
import {Project} from '../../../lib/project/project';
import {connect} from 'react-redux';
import {getUser} from '../../../state/user/reducer';
import {getSelectedProject} from '../../../state/project/reducer';
import {AppState} from '../../../state/app/reducers';
import {Selection} from '../../../lib/measurement/selection/selection';
import styled from 'styled-components';
import {RangeFilterSwitcher} from '../range-filter-switcher';
import {RouteComponentProps, withRouter} from 'react-router';
import {MeasurementList} from '../measurement-list';
import {getSelections} from '../../../state/selection/reducer';
import {loadSelectionsAction, LoadSelectionsParams} from '../../../state/selection/actions';
import {LineChartDataset} from './line-chart-dataset';
import {
    AddDatasetParams,
    addLineChartDatasetAction,
    deleteLineChartDatasetAction, setLineChartXAxisAction,
    UpdateDatasetParams, updateLineChartDatasetAction
} from '../../../state/ui/line-chart-page/actions';
import {DatasetManager} from './dataset-manager';
import {Box} from '../../global/box';
import {ChartPage} from '../chart-page';

interface OwnProps
{
    rangeFilter: RangeFilter;
    onChangeRangeFilter(rangeFilter: RangeFilter): void;
}
interface StateProps
{
    user: User;
    project: Project;
    selections: Selection[];
    xAxis: string;
    datasets: LineChartDataset[];
}
interface DispatchProps
{
    loadSelections(params: LoadSelectionsParams): void;
    setXAxis(axis: string): void;
    addDataset(params: AddDatasetParams): void;
    deleteDataset(dataset: LineChartDataset): void;
    updateDataset(params: UpdateDatasetParams): void;
}
type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    groupMode: GroupMode;
    selectedMeasurements: Measurement[];
}

const MeasurementsWrapper = styled.div`
  width: 900px;
`;

class LineChartPageComponent extends PureComponent<Props, State>
{
    state: State = {
        groupMode: GroupMode.AxisX,
        selectedMeasurements: []
    };

    componentDidMount()
    {
        this.props.loadSelections({
            user: this.props.user,
            project: this.props.project
        });
    }

    render()
    {
        return (
            <ChartPage
                renderOptions={this.renderOptions}
                renderGraph={this.renderGraph} />
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
                <h4>Projections</h4>
                <DatasetManager
                    selections={this.props.selections}
                    datasets={this.props.datasets}
                    addDataset={this.addDataset}
                    deleteDataset={this.props.deleteDataset}
                    updateDataset={this.updateDataset} />
                <GroupModeSelector groupMode={this.state.groupMode}
                                   onChangeGroupMode={this.changeGroupMode} />
            </>
        );
    }
    renderGraph = (): JSX.Element =>
    {
        return (
            <>
                <h4>Line chart</h4>
                <LineChart
                    xAxis={this.props.xAxis}
                    groupMode={this.state.groupMode}
                    connectPoints={true}
                    onMeasurementsSelected={this.changeSelectedMeasurements}
                    views={this.props.datasets} />
                <MeasurementsWrapper>
                    <h4>Selected measurements</h4>
                    <MeasurementList measurements={this.state.selectedMeasurements} />
                </MeasurementsWrapper>
            </>
        );
    }

    addDataset = () =>
    {
        this.props.addDataset({
            user: this.props.user,
            project: this.props.project,
            rangeFilter: this.props.rangeFilter
        });
    }
    updateDataset = (dataset: LineChartDataset, newDataset: LineChartDataset) =>
    {
        this.props.updateDataset({
            user: this.props.user,
            project: this.props.project,
            rangeFilter: this.props.rangeFilter,
            dataset,
            selection: newDataset.selection,
            yAxis: newDataset.yAxis
        });
    }

    changeXAxis = (xAxis: string) =>
    {
        this.props.setXAxis(xAxis);
    }
    changeGroupMode = (groupMode: GroupMode) =>
    {
        this.setState(() => ({ groupMode }));
    }
    changeSelectedMeasurements = (selectedMeasurements: Measurement[]) =>
    {
        this.setState(() => ({ selectedMeasurements  }));
    }
}

export const LineChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    selections: getSelections(state),
    xAxis: state.ui.lineChartPage.xAxis,
    datasets: state.ui.lineChartPage.datasets
}), {
    loadSelections: loadSelectionsAction.started,
    setXAxis: setLineChartXAxisAction,
    addDataset: addLineChartDatasetAction.started,
    deleteDataset: deleteLineChartDatasetAction,
    updateDataset: updateLineChartDatasetAction.started
})(LineChartPageComponent));
