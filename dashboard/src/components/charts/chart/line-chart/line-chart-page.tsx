import {chain, sort} from 'ramda';
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import styled from 'styled-components';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {RangeFilter} from '../../../../lib/measurement/selection/range-filter';
import {Project} from '../../../../lib/project/project';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {
    addChartDatasetAction,
    AddDatasetParams,
    deleteChartDatasetAction,
    reloadChartDatasetsAction,
    ReloadDatasetsParams,
    setChartXAxisAction,
    updateChartDatasetAction,
    UpdateDatasetParams
} from '../../../../state/session/pages/chart-page/actions';
import {getSelectedProject} from '../../../../state/session/project/reducer';
import {SelectionActions} from '../../../../state/session/selection/actions';
import {getViews} from '../../../../state/session/view/reducer';
import {formatKey} from '../../../../util/measurement';
import {Box} from '../../../global/box';
import {MeasurementKeys} from '../../../global/keys/measurement-keys';
import {TwoColumnPage} from '../../../global/two-column-page';
import {RangeFilterSwitcher} from '../../range-filter-switcher';
import {ViewManager} from '../../view/view-manager';
import {ChartDataset} from '../chart-dataset';
import {DatasetManager} from '../dataset-manager';
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
    xAxis: string;
    datasets: ChartDataset[];
}
interface DispatchProps
{
    loadSelections(): void;
    setXAxis(axis: string): void;
    addDataset(params: AddDatasetParams): void;
    deleteDataset(dataset: ChartDataset): void;
    updateDataset(params: UpdateDatasetParams): void;
    reloadDatasets(params: ReloadDatasetsParams): void;
}
type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    groupMode: GroupMode;
    selectedMeasurements: Measurement[];
    settings: LineChartSettings;
}

const MeasurementsWrapper = styled.div`
  width: 900px;
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
        }
    };

    componentDidMount()
    {
        this.props.loadSelections();
        this.reloadDatasets(this.props.rangeFilter);
    }

    componentDidUpdate(oldProps: Props)
    {
        if (this.props.views !== oldProps.views)
        {
            this.reloadDatasets(this.props.rangeFilter);
        }
    }

    render()
    {
        return (
            <TwoColumnPage
                menu={this.renderOptions}
                content={this.renderGraph} />
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
                <Box title='Views'>
                    <div>X axis</div>
                    <MeasurementKeys keys={keys}
                                     value={this.props.xAxis}
                                     onChange={this.props.setXAxis} />
                    {this.renderDatasetManager(keys)}
                </Box>
                <Box title='Settings'>
                    <LineChartSettingsComponent
                        settings={this.state.settings}
                        onChangeSettings={this.changeSettings} />
                </Box>
            </>
        );
    }
    renderDatasetManager = (keys: string[]): JSX.Element =>
    {
        if (this.props.views.length === 0)
        {
            return <span>You have no defined views</span>;
        }

        return (
            <DatasetManager
                views={this.props.views}
                measurementKeys={keys}
                datasets={this.props.datasets}
                maxDatasetCount={4}
                addDataset={this.addDataset}
                canAdd={this.canAddDataset()}
                deleteDataset={this.props.deleteDataset}
                updateDataset={this.updateDataset} />
        );
    }
    renderGraph = (): JSX.Element =>
    {
        const datasets = this.expandDatasets(this.props.datasets);
        return (
            <>
                <ViewManager />
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
                <MeasurementsWrapper>
                    <h4>Selected measurements</h4>
                    <MeasurementList measurements={this.state.selectedMeasurements} />
                </MeasurementsWrapper>
            </>
        );
    }

    expandDatasets = (datasets: ChartDataset[]): LineChartDataset[] =>
    {
        return chain(d => {
            const view = this.props.views.find(v => v.id === d.view);
            if (view === undefined)
            {
                return [];
            }

            return view.yAxes.map(yAxis => ({
                name: `${view.name} (${formatKey(yAxis)})`,
                yAxis,
                measurements: d.measurements
            }));
        }, datasets);
    }

    canAddDataset = () =>
    {
        return this.props.views.length > 0;
    }

    addDataset = () =>
    {
        if (this.canAddDataset())
        {
            this.props.addDataset({
                rangeFilter: this.props.rangeFilter,
                view: this.props.views[0].id
            });
        }
    }
    updateDataset = (dataset: ChartDataset, newDataset: ChartDataset) =>
    {
        this.props.updateDataset({
            rangeFilter: this.props.rangeFilter,
            dataset,
            view: newDataset.view
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
    changeSettings = (settings: LineChartSettings) =>
    {
        this.setState(() => ({ settings }));
    }
    reloadDatasets = (rangeFilter: RangeFilter) =>
    {
        this.props.reloadDatasets({ rangeFilter });
    }
}

export const LineChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    views: getViews(state),
    xAxis: state.session.pages.chartState.xAxis,
    datasets: state.session.pages.chartState.datasets
}), {
    loadSelections: SelectionActions.load.started,
    setXAxis: setChartXAxisAction,
    addDataset: addChartDatasetAction.started,
    deleteDataset: deleteChartDatasetAction,
    updateDataset: updateChartDatasetAction.started,
    reloadDatasets: reloadChartDatasetsAction.started
})(LineChartPageComponent));
