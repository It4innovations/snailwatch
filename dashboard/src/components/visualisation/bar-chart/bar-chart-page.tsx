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
import moment from 'moment';
import {RangeFilterSwitcher} from '../range-filter-switcher';
import {RouteComponentProps, withRouter} from 'react-router';
import {MeasurementList} from '../measurement-list';
import {SelectionSelect} from '../selection-container/selection-select';
import {getSelections} from '../../../state/selection/reducer';
import {loadSelectionsAction, LoadSelectionsParams} from '../../../state/selection/actions';
import {Switch} from '../../global/switch';
import {SelectionContainer} from '../selection-container/selection-container';

interface OwnProps
{

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
}
interface DispatchProps
{
    loadMeasurements(params: LoadMeasurementParams): void;
    loadSelections(params: LoadSelectionsParams): void;
    setXAxis(axis: string): void;
    setYAxes(axes: string[]): void;
    setSelection(selection: Selection): void;
}
type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    rangeFilter: RangeFilter;
    groupMode: GroupMode;
    selectedMeasurements: Measurement[];
    selectionsEditing: boolean;
}

const Row = styled.div`
  display: flex;
  width: 100%;
`;
const MeasurementsWrapper = styled.div`
  width: 900px;
`;
const DatasetColumn = styled.div`
  min-width: 240px;
  margin-right: 10px;
`;
const BarColumn = styled.div`
  flex-grow: 1;
`;

class BarChartPageComponent extends PureComponent<Props, State>
{
    state: State = {
        rangeFilter: {
            from: moment().subtract(1, 'w'),
            to: moment(),
            entryCount: 50,
            useDateFilter: false
        },
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
        if (state.rangeFilter !== this.state.rangeFilter || props.selection !== this.props.selection)
        {
            this.loadMeasurements();
        }
    }

    render()
    {
        return (
            <Row>
                <DatasetColumn>
                    <h4>Range</h4>
                    <RangeFilterSwitcher
                        rangeFilter={this.state.rangeFilter}
                        onFilterChange={this.changeRangeFilter} />
                    <h4>Selection</h4>
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
                    <h4>Projections</h4>
                    <DataSelector
                        measurements={this.props.measurements}
                        selection={this.props.selection}
                        xAxis={this.props.xAxis}
                        yAxes={this.props.yAxes}
                        onChangeXAxis={this.changeXAxis}
                        onChangeYAxes={this.changeYAxes}
                        onChangeSelection={this.changeSelection} />
                    <GroupModeSelector groupMode={this.state.groupMode}
                                       onChangeGroupMode={this.changeGroupMode} />
                </DatasetColumn>
                <BarColumn>
                    <h4>Proportionate chart</h4>
                    <BarChart measurements={this.props.measurements}
                              xAxis={this.props.xAxis}
                              yAxes={this.props.yAxes}
                              groupMode={this.state.groupMode}
                              onMeasurementsSelected={this.changeSelectedMeasurements} />
                    <MeasurementsWrapper>
                        <h4>Selected measurements</h4>
                        <MeasurementList measurements={this.state.selectedMeasurements} />
                    </MeasurementsWrapper>
                </BarColumn>
            </Row>
        );
    }

    loadMeasurements = () =>
    {
        this.props.loadMeasurements({
            user: this.props.user,
            project: this.props.project,
            rangeFilter: this.state.rangeFilter,
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
        this.props.setSelection(selection);
    }
    changeGroupMode = (groupMode: GroupMode) =>
    {
        this.setState(() => ({ groupMode }));
    }
    changeRangeFilter = (rangeFilter: RangeFilter) =>
    {
        this.setState(() => ({ rangeFilter }));
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
    xAxis: state.ui.barChartPage.xAxis,
    yAxes: state.ui.barChartPage.yAxes,
    selection: state.ui.barChartPage.selection
}), {
    loadMeasurements: loadBarChartMeasurementsAction.started,
    loadSelections: loadSelectionsAction.started,
    setXAxis: setBarChartXAxisAction,
    setYAxes: setBarChartYAxesAction,
    setSelection: setBarChartSelection
})(BarChartPageComponent));
