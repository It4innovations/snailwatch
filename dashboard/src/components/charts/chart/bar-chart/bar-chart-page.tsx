import {sort} from 'ramda';
import React, {PureComponent, Fragment} from 'react';
import {RangeFilter} from '../../../../lib/measurement/selection/range-filter';
import {View} from '../../../../lib/view/view';
import {
    addChartDatasetAction,
    AddDatasetParams, deleteChartDatasetAction, reloadChartDatasetsAction,
    ReloadDatasetsParams, setChartXAxisAction, updateChartDatasetAction,
    UpdateDatasetParams
} from '../../../../state/session/pages/chart-page/actions';
import {getViews} from '../../../../state/session/view/reducer';
import {ViewManager} from '../../view/view-manager';
import {ChartDataset} from '../chart-dataset';
import {DatasetManager} from '../dataset-manager';
import {BarChart} from './bar-chart';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {Project} from '../../../../lib/project/project';
import {connect} from 'react-redux';
import {AppState} from '../../../../state/app/reducers';
import {Selection} from '../../../../lib/measurement/selection/selection';
import styled from 'styled-components';
import {RangeFilterSwitcher} from '../../range-filter-switcher';
import {RouteComponentProps, withRouter} from 'react-router';
import {MeasurementList} from '../measurement-list';
import {getSelections} from '../../../../state/session/selection/reducer';
import {SelectionActions} from '../../../../state/session/selection/actions';
import {Request} from '../../../../util/request';
import {RequestView} from '../../../global/request-view';
import {Box} from '../../../global/box';
import {TwoColumnPage} from '../../../global/two-column-page';
import {getSelectedProject} from '../../../../state/session/project/reducer';

interface OwnProps
{
    rangeFilter: RangeFilter;
    onChangeRangeFilter(rangeFilter: RangeFilter): void;
}
interface StateProps
{
    project: Project;
    selections: Selection[];
    views: View[];
    xAxis: string;
    datasets: ChartDataset[];
    measurementRequest: Request;
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
}

const MeasurementsWrapper = styled.div`
  width: 900px;
`;

class BarChartPageComponent extends PureComponent<Props, State>
{
    state: State = {
        groupMode: GroupMode.AxisX,
        selectedMeasurements: []
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
                    {this.renderDatasetManager(keys)}
                </Box>
                <RequestView request={this.props.measurementRequest} />
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
        return (
            <div>
                <ViewManager />
                <h4>Stacked bar chart</h4>
                {this.props.datasets.map(this.renderDataset)}
                <MeasurementsWrapper>
                    <h4>Selected measurements</h4>
                    <MeasurementList measurements={this.state.selectedMeasurements} />
                </MeasurementsWrapper>
            </div>
        );
    }
    renderDataset = (dataset: ChartDataset): JSX.Element =>
    {
        const view = this.props.views.find(v => v.id === dataset.view);
        if (!view) return <Fragment key={dataset.id}>Select a view</Fragment>;

        return (
            <BarChart key={dataset.id}
                      measurements={dataset.measurements}
                      xAxis={this.props.xAxis}
                      yAxes={view.yAxes}
                      groupMode={this.state.groupMode}
                      onMeasurementsSelected={this.changeSelectedMeasurements} />
        );
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
    changeRangeFilter = (rangeFilter: RangeFilter) =>
    {
        this.props.onChangeRangeFilter(rangeFilter);
        this.reloadDatasets(rangeFilter);
    }

    changeSelectedMeasurements = (selectedMeasurements: Measurement[]) =>
    {
        this.setState(() => ({ selectedMeasurements  }));
    }
    reloadDatasets = (rangeFilter: RangeFilter) =>
    {
        this.props.reloadDatasets({ rangeFilter });
    }
}

export const BarChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    selections: getSelections(state),
    views: getViews(state),
    datasets: state.session.pages.chartState.datasets,
    xAxis: state.session.pages.chartState.xAxis,
    measurementRequest: state.session.pages.chartState.measurementsRequest
}), {
    loadSelections: SelectionActions.load.started,
    setXAxis: setChartXAxisAction,
    addDataset: addChartDatasetAction.started,
    deleteDataset: deleteChartDatasetAction,
    updateDataset: updateChartDatasetAction.started,
    reloadDatasets: reloadChartDatasetsAction.started
})(BarChartPageComponent));
