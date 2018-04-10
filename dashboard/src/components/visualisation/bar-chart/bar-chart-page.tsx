import React, {PureComponent} from 'react';
import {RangeFilter} from '../../../lib/measurement/selection/range-filter';
import {BarChart} from './bar-chart';
import {GroupMode} from '../../../lib/measurement/group-mode';
import {GroupModeSelector} from '../group-mode-selector';
import {Measurement} from '../../../lib/measurement/measurement';
import {User} from '../../../lib/user/user';
import {Project} from '../../../lib/project/project';
import {
    loadBarChartMeasurementsAction,
    LoadMeasurementParams, setBarChartSelection,
    setBarChartXAxisAction, setBarChartYAxesAction
} from '../../../state/ui/bar-chart-page/actions';
import {connect} from 'react-redux';
import {getUser} from '../../../state/user/reducer';
import {getSelectedProject} from '../../../state/project/reducer';
import {AppState} from '../../../state/app/reducers';
import {DataSelector} from './data-selector';
import {Selection} from '../../../lib/measurement/selection/selection';
import styled from 'styled-components';
import {RangeFilterSwitcher} from '../range-filter-switcher';
import {RouteComponentProps, withRouter} from 'react-router';
import {MeasurementList} from '../measurement-list';
import {SelectionSelect} from '../selection-container/selection-select';
import {getSelections} from '../../../state/selection/reducer';
import {loadSelectionsAction, LoadSelectionsParams} from '../../../state/selection/actions';
import {Switch} from '../../global/switch';
import {SelectionContainer} from '../selection-container/selection-container';
import {getBarChartPageSelection} from '../../../state/ui/bar-chart-page/reducer';
import {Request} from '../../../util/request';
import {RequestComponent} from '../../global/request-component';
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
    selectionsEditing: boolean;
}

const MeasurementsWrapper = styled.div`
  width: 900px;
`;

class BarChartPageComponent extends PureComponent<Props, State>
{
    state: State = {
        groupMode: GroupMode.AxisX,
        selectedMeasurements: [],
        selectionsEditing: false
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
                <Box title='Selection'>
                    <Switch
                        useFirst={!this.state.selectionsEditing}
                        firstLabel='Select'
                        secondLabel='Edit'
                        firstComponent={
                            <SelectionSelect
                                selections={this.props.selections}
                                selection={this.props.selection}
                                onSelect={this.changeSelection} />
                        }
                        secondComponent={
                            <SelectionContainer
                                measurements={this.props.measurements}
                                selectedSelection={this.props.selection}
                                selectSelection={this.changeSelection} />
                        }
                        onChange={this.changeSelectionsEditing} />
                </Box>
                <Box title='Projections'>
                    <DataSelector
                        measurements={this.props.measurements}
                        measurementKeys={this.props.project.measurementKeys}
                        selection={this.props.selection}
                        xAxis={this.props.xAxis}
                        yAxes={this.props.yAxes}
                        onChangeXAxis={this.changeXAxis}
                        onChangeYAxes={this.changeYAxes}
                        onChangeSelection={this.changeSelection} />
                </Box>
                <Box title='Group by'>
                    <GroupModeSelector groupMode={this.state.groupMode}
                                       onChangeGroupMode={this.changeGroupMode} />
                </Box>
                <RequestComponent request={this.props.measurementRequest} />
            </>
        );
    }
    renderGraph = (): JSX.Element =>
    {
        return (
            <div>
                <h4>Bar chart</h4>
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
    changeGroupMode = (groupMode: GroupMode) =>
    {
        this.setState(() => ({ groupMode }));
    }
    changeSelectedMeasurements = (selectedMeasurements: Measurement[]) =>
    {
        this.setState(() => ({ selectedMeasurements  }));
    }
    changeSelectionsEditing = (select: boolean) =>
    {
        this.setState(() => ({ selectionsEditing: !select }));
    }
}

export const BarChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    selections: getSelections(state),
    measurements: state.ui.barChartPage.measurements,
    measurementRequest: state.ui.barChartPage.measurementsRequest,
    xAxis: state.ui.barChartPage.xAxis,
    yAxes: state.ui.barChartPage.yAxes,
    selection: getBarChartPageSelection(state)
}), {
    loadMeasurements: loadBarChartMeasurementsAction.started,
    loadSelections: loadSelectionsAction.started,
    setXAxis: setBarChartXAxisAction,
    setYAxes: setBarChartYAxesAction,
    setSelection: setBarChartSelection
})(BarChartPageComponent));
