import React, {PureComponent} from 'react';
import {RangeFilter} from '../../../../lib/measurement/selection/range-filter';
import {BarChart} from './bar-chart';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {User} from '../../../../lib/user/user';
import {Project} from '../../../../lib/project/project';
import {
    loadBarChartMeasurementsAction,
    LoadMeasurementParams, setBarChartSelection,
    setBarChartXAxisAction, setBarChartYAxesAction
} from '../../../../state/session/views/bar-chart-page/actions';
import {connect} from 'react-redux';
import {getUser} from '../../../../state/session/user/reducer';
import {getSelectedProject} from '../../../../state/session/project/reducer';
import {AppState} from '../../../../state/app/reducers';
import {DataSelector} from './data-selector';
import {Selection} from '../../../../lib/measurement/selection/selection';
import styled from 'styled-components';
import {RangeFilterSwitcher} from '../../range-filter-switcher';
import {RouteComponentProps, withRouter} from 'react-router';
import {MeasurementList} from '../measurement-list';
import {getSelections} from '../../../../state/session/selection/reducer';
import {loadSelectionsAction, LoadSelectionsParams} from '../../../../state/session/selection/actions';
import {getBarChartPageSelection} from '../../../../state/session/views/bar-chart-page/reducer';
import {Request} from '../../../../util/request';
import {RequestView} from '../../../global/request-view';
import {Box} from '../../../global/box';
import {TwoColumnPage} from '../../../global/two-column-page';
import {SelectionSelectEditor} from '../../selection-container/selection-select-editor';

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
    measurements: Measurement[];
    selection: Selection | null;
    xAxis: string;
    yAxes: string[];
    measurementRequest: Request;
}
interface DispatchProps
{
    loadMeasurements(params: LoadMeasurementParams): void;
    loadSelections(params: LoadSelectionsParams): void;
    setXAxis(axis: string): void;
    setYAxes(axes: string[]): void;
    setSelection(selectionId: string): void;
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
        this.loadMeasurements();
        this.props.loadSelections({
            user: this.props.user,
            project: this.props.project
        });
    }
    componentDidUpdate(props: Props, state: State)
    {
        if (props.rangeFilter !== this.props.rangeFilter || props.selection !== this.props.selection)
        {
            this.loadMeasurements();
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
        return (
            <>
                <Box title='Range'>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.props.onChangeRangeFilter} />
                </Box>
                <Box title='Selection'>
                    <SelectionSelectEditor
                        selections={this.props.selections}
                        selection={this.props.selection}
                        measurements={this.props.measurements}
                        onSelectSelection={this.changeSelection} />
                </Box>
                <Box title='Projections'>
                    <DataSelector
                        measurementKeys={this.props.project.measurementKeys}
                        selection={this.props.selection}
                        xAxis={this.props.xAxis}
                        yAxes={this.props.yAxes}
                        onChangeXAxis={this.changeXAxis}
                        onChangeYAxes={this.changeYAxes}
                        onChangeSelection={this.changeSelection} />
                </Box>
                <RequestView request={this.props.measurementRequest} />
            </>
        );
    }
    renderGraph = (): JSX.Element =>
    {
        return (
            <div>
                <h4>Stacked bar chart</h4>
                <BarChart measurements={this.props.measurements}
                          xAxis={this.props.xAxis}
                          yAxes={this.props.yAxes}
                          groupMode={this.state.groupMode}
                          onMeasurementsSelected={this.changeSelectedMeasurements} />
                <MeasurementsWrapper>
                    <h4>Selected measurements</h4>
                    <MeasurementList measurements={this.state.selectedMeasurements} />
                </MeasurementsWrapper>
            </div>
        );
    }

    loadMeasurements = () =>
    {
        this.props.loadMeasurements({
            user: this.props.user,
            project: this.props.project,
            rangeFilter: this.props.rangeFilter,
            selection: this.props.selection
        });
    }

    changeXAxis = (xAxis: string) =>
    {
        this.props.setXAxis(xAxis);
    }
    changeYAxes = (yAxes: string[]) =>
    {
        this.props.setYAxes(yAxes);
    }
    changeSelection = (selection: Selection) =>
    {
        this.props.setSelection(selection === null ? null : selection.id);
    }
    changeSelectedMeasurements = (selectedMeasurements: Measurement[]) =>
    {
        this.setState(() => ({ selectedMeasurements  }));
    }
}

export const BarChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    selections: getSelections(state),
    measurements: state.session.views.barChartPage.measurements,
    measurementRequest: state.session.views.barChartPage.measurementsRequest,
    xAxis: state.session.views.barChartPage.xAxis,
    yAxes: state.session.views.barChartPage.yAxes,
    selection: getBarChartPageSelection(state)
}), {
    loadMeasurements: loadBarChartMeasurementsAction.started,
    loadSelections: loadSelectionsAction.started,
    setXAxis: setBarChartXAxisAction,
    setYAxes: setBarChartYAxesAction,
    setSelection: setBarChartSelection
})(BarChartPageComponent));
