import React, {Fragment, PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import styled from 'styled-components';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {Project} from '../../../../lib/project/project';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {setChartXAxisAction} from '../../../../state/session/pages/chart-page/actions';
import {getSelectedProject} from '../../../../state/session/project/reducer';
import {getViews} from '../../../../state/session/view/reducer';
import {Request} from '../../../../util/request';
import {Box} from '../../../global/box';
import {MeasurementKeys} from '../../../global/keys/measurement-keys';
import {RequestView} from '../../../global/request-view';
import {TwoColumnPage} from '../../../global/two-column-page';
import {RangeFilterSwitcher} from '../../range-filter-switcher';
import {ViewManager} from '../../view/view-manager';
import {ViewSelection} from '../../view/view-selection';
import {MeasurementList} from '../measurement-list';
import {BarChart} from './bar-chart';

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
                    <MeasurementKeys project={this.props.project}
                                     value={this.props.xAxis}
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
                {this.props.selectedViews.map(this.renderDataset)}
                <MeasurementsWrapper>
                    <h4>Selected measurements</h4>
                    <MeasurementList measurements={this.state.selectedMeasurements}
                                     project={this.props.project} />
                </MeasurementsWrapper>
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
    views: getViews(state),
    selectedViews: state.session.pages.chartState.selectedViews,
    xAxis: state.session.pages.chartState.xAxis,
    measurementRequest: state.session.pages.chartState.measurementsRequest
}), {
    setXAxis: setChartXAxisAction,
})(BarChartPageComponent));
