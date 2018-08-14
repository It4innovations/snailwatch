import React, {PureComponent} from 'react';
import {Measurement} from '../../../../lib/measurement/measurement';
import {RangeFilter} from '../../../../lib/measurement/selection/range-filter';
import {RouteComponentProps, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {SelectChartViewParams} from '../../../../state/session/pages/chart-page/actions';
import {loadGridChartMeasurements} from '../../../../state/session/pages/grid-chart-page/actions';
import {getSelections} from '../../../../state/session/selection/reducer';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {getViews} from '../../../../state/session/view/reducer';
import {formatKey} from '../../../../util/measurement';
import {MeasurementKeys} from '../../../global/keys/measurement-keys';
import {LineChart} from '../line-chart/line-chart';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {TwoColumnPage} from '../../../global/two-column-page';
import {Box} from '../../../global/box';
import {RangeFilterSwitcher} from '../../range-filter-switcher';
import {Project} from '../../../../lib/project/project';
import {getSelectedProject} from '../../../../state/session/project/reducer';
import styled from 'styled-components';

interface OwnProps
{
    rangeFilter: RangeFilter;
    onChangeRangeFilter(rangeFilter: RangeFilter): void;
    selectView(view: SelectChartViewParams): void;
}
interface StateProps
{
    project: Project;
    views: View[];
    measurements: Measurement[];
}
interface DispatchProps
{
    loadMeasurements(): void;
}

type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    selection: Selection;
    xAxis: string;
}

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-top: 1px;
  padding-left: 1px;
`;
const Dataset = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 4px;
  padding: 20px;
  border: 1px solid #8c8c8c;
  border-radius: 5px;

  &:hover {
    border-color: transparent;
    box-shadow: 0 0 15px -2px #8c8c8c;
  }
`;
const Label = styled.div`
  text-align: center;
`;

class GridChartPageComponent extends PureComponent<Props, Readonly<State>>
{
    readonly state: State = {
        selection: null,
        xAxis: ''
    };

    componentDidMount()
    {
        this.props.loadMeasurements();
    }

    render()
    {
        return (
            <TwoColumnPage
                menu={this.renderMenu}
                content={this.renderContent} />
        );
    }
    renderMenu = (): JSX.Element =>
    {
        return (
            <>
                <Box title='Range'>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.changeRangeFilter} />
                </Box>
                <Box title='X axis'>
                    <MeasurementKeys keys={this.props.project.measurementKeys}
                                     value={this.state.xAxis}
                                     onChange={this.changeXAxis} />
                </Box>
            </>
        );
    }
    renderContent = (): JSX.Element =>
    {
        const views = this.props.views.sort((a: View, b: View) => a.name.localeCompare(b.name));
        return (
            <Grid>
                {views.map(this.renderView)}
            </Grid>
        );
    }
    renderView = (view: View): JSX.Element =>
    {
        const datasets = view.yAxes.map(yAxis => ({
            name: `${view.name} (${formatKey(yAxis)})`,
            yAxis,
            measurements: this.props.measurements
        }));
        return (
            <Dataset key={view.id}
                     title={`Select ${view.name}`}
                     onClick={() => this.selectView(view)}>
                <Label>{view.name}</Label>
                <LineChart
                    datasets={datasets}
                    xAxis={this.state.xAxis}
                    width={300}
                    height={150}
                    preview={true}
                    groupMode={GroupMode.AxisX}
                    connectPoints={true}
                    showPoints={false}
                    showDeviation={false} />
            </Dataset>
        );
    }

    selectView = (view: View) =>
    {
        this.props.selectView({
            view,
            xAxis: this.state.xAxis
        });
    }

    changeXAxis = (xAxis: string) =>
    {
        this.setState(() => ({ xAxis }));
    }
    changeRangeFilter = (rangeFilter: RangeFilter) =>
    {
        this.props.onChangeRangeFilter(rangeFilter);
        this.props.loadMeasurements();
    }
}

export const GridChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    selections: getSelections(state),
    views: getViews(state),
    measurements: state.session.pages.gridChartPage.measurements
}), ({
    loadMeasurements: () => loadGridChartMeasurements.started({})
}))(GridChartPageComponent));
