import React, {Fragment, PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import styled from 'styled-components';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {RangeFilter} from '../../../../lib/measurement/selection/range-filter';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {Project} from '../../../../lib/project/project';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {setChartXAxisAction} from '../../../../state/session/pages/chart-page/actions';
import {getSelectedProject} from '../../../../state/session/project/reducer';
import {getSelections} from '../../../../state/session/selection/reducer';
import {getViews} from '../../../../state/session/view/reducer';
import {Request} from '../../../../util/request';
import {Box} from '../../../global/box';
import {RequestView} from '../../../global/request-view';
import {TwoColumnPage} from '../../../global/two-column-page';
import {RangeFilterSwitcher} from '../../range-filter-switcher';
import {ViewManager} from '../../view/view-manager';
import {ViewSelection} from '../../view/view-selection';
import {ChartDataset} from '../chart-dataset';
import {MeasurementList} from '../measurement-list';
import {XAxisSelector} from '../x-axis-selector';
import {BarChart} from './bar-chart';

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
    setXAxis(axis: string): void;
}
type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    groupMode: GroupMode;
    selectedMeasurements: Measurement[];
    selectedView: string | null;
}

const MeasurementsWrapper = styled.div`
  width: 900px;
`;

class BarChartPageComponent extends PureComponent<Props, State>
{
    state: State = {
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
                    <XAxisSelector measurementKeys={this.props.project.measurementKeys}
                                   xAxis={this.props.xAxis}
                                   onChange={this.props.setXAxis} />
                </Box>
                <Box title='View list'>
                    <ViewSelection onEditView={this.setSelectedView} />
                </Box>
                <RequestView request={this.props.measurementRequest} />
            </>
        );
    }
    renderGraph = (): JSX.Element =>
    {
        const view = this.props.views.find(v => v.id === this.state.selectedView);

        return (
            <div>
                {view && <ViewManager view={view} onClose={this.deselectView} />}
                <h4>Stacked bar chart</h4>
                {this.props.datasets.map(this.renderDataset)}
                <MeasurementsWrapper>
                    <h4>Selected measurements</h4>
                    <MeasurementList measurements={this.state.selectedMeasurements}
                                     project={this.props.project} />
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

    changeSelectedMeasurements = (selectedMeasurements: Measurement[]) =>
    {
        this.setState(() => ({ selectedMeasurements  }));
    }

    setSelectedView = (selectedView: View) =>
    {
        this.setState(() => ({ selectedView: selectedView.id }));
    }
    deselectView = () =>
    {
        this.setState(() => ({ selectedView: null }));
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
    setXAxis: setChartXAxisAction,
})(BarChartPageComponent));