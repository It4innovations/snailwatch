import React, {PureComponent} from 'react';
import {RangeFilter} from '../../../../lib/measurement/selection/range-filter';
import {LineChart} from './line-chart';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {User} from '../../../../lib/user/user';
import {Project} from '../../../../lib/project/project';
import {connect} from 'react-redux';
import {getUser} from '../../../../state/user/reducer';
import {getSelectedProject} from '../../../../state/project/reducer';
import {AppState} from '../../../../state/app/reducers';
import {Selection} from '../../../../lib/measurement/selection/selection';
import styled from 'styled-components';
import {RangeFilterSwitcher} from '../../range-filter-switcher';
import {RouteComponentProps, withRouter} from 'react-router';
import {MeasurementList} from '../../measurement-list';
import {getSelections} from '../../../../state/selection/reducer';
import {loadSelectionsAction, LoadSelectionsParams} from '../../../../state/selection/actions';
import {LineChartDataset} from './line-chart-dataset';
import {
    AddDatasetParams,
    addLineChartDatasetAction,
    deleteLineChartDatasetAction, setLineChartXAxisAction,
    UpdateDatasetParams, updateLineChartDatasetAction, ReloadDatasetsParams, reloadDatasetsAction
} from '../../../../state/ui/line-chart-page/actions';
import {DatasetManager} from './dataset-manager';
import {Box} from '../../../global/box';
import {ChartPage} from '../chart-page';
import {MeasurementKeys} from '../../../global/measurement-keys';
import {sort} from 'ramda';
import {LineChartSettings} from './line-chart-settings';

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
    reloadDatasets(params: ReloadDatasetsParams): void;
}
type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    groupMode: GroupMode;
    selectedMeasurements: Measurement[];
    showDeviation: boolean;
}

const MeasurementsWrapper = styled.div`
  width: 900px;
`;

class LineChartPageComponent extends PureComponent<Props, State>
{
    state: State = {
        groupMode: GroupMode.AxisX,
        selectedMeasurements: [],
        showDeviation: false
    };

    componentDidMount()
    {
        this.props.loadSelections({
            user: this.props.user,
            project: this.props.project
        });
        this.reloadDatasets(this.props.rangeFilter);
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
        const keys = sort((a, b) => a.localeCompare(b), this.props.project.measurementKeys);
        return (
            <>
                <Box title='Range'>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.changeRangeFilter} />
                </Box>
                <Box title='Datasets'>
                    <div>X axis</div>
                    <MeasurementKeys keys={keys}
                                     value={this.props.xAxis}
                                     onChange={this.props.setXAxis} />
                    <DatasetManager
                        selections={this.props.selections}
                        measurementKeys={keys}
                        datasets={this.props.datasets}
                        maxDatasetCount={4}
                        addDataset={this.addDataset}
                        deleteDataset={this.props.deleteDataset}
                        updateDataset={this.updateDataset} />
                </Box>
                <Box title='Settings'>
                    <LineChartSettings
                        showDeviation={this.state.showDeviation}
                        onChangeShowDeviation={this.changeShowDeviation} />
                </Box>
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
                    showDeviation={this.state.showDeviation}
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
            selectionId: newDataset.selectionId,
            yAxis: newDataset.yAxis
        });
    }

    changeSelectedMeasurements = (selectedMeasurements: Measurement[]) =>
    {
        this.setState(() => ({ selectedMeasurements  }));
    }
    changeRangeFilter = (rangeFilter: RangeFilter) =>
    {
        this.props.onChangeRangeFilter(rangeFilter);
        this.reloadDatasets(rangeFilter);
    }
    changeShowDeviation = (showDeviation: boolean) =>
    {
        this.setState(() => ({ showDeviation }));
    }
    reloadDatasets = (rangeFilter: RangeFilter) =>
    {
        this.props.reloadDatasets({
            user: this.props.user,
            project: this.props.project,
            rangeFilter
        });
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
    updateDataset: updateLineChartDatasetAction.started,
    reloadDatasets: reloadDatasetsAction.started
})(LineChartPageComponent));
