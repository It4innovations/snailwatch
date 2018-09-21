import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import styled from 'styled-components';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {Project} from '../../../../lib/project/project';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {SelectChartViewParams} from '../../../../state/session/pages/chart-page/actions';
import {loadGridChartMeasurements} from '../../../../state/session/pages/grid-chart-page/actions';
import {getSelectedProject} from '../../../../state/session/project/reducer';
import {getViews} from '../../../../state/session/view/reducer';
import {RangeHelp, XAxisHelp} from '../../../../strings';
import {formatKey} from '../../../../util/measurement';
import {Box} from '../../../global/box';
import {MeasurementKeys} from '../../../global/keys/measurement-keys';
import {TwoColumnPage} from '../../../global/two-column-page';
import {RangeFilterSwitcher} from '../../range-filter/range-filter-switcher';
import {applyFilter, ViewFilter, ViewSortMode} from '../../view/view-filter/view-filter';
import {ViewFilterComponent} from '../../view/view-filter/view-filter-component';
import {CHART_DATE_FORMAT} from '../configuration';
import {LineChart} from '../line-chart/line-chart';

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

const initialState = {
    xAxis: '',
    viewFilter: {
        query: '',
        sortMode: ViewSortMode.CreationTime
    } as ViewFilter
};
type State = Readonly<typeof initialState>;

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
  padding: 10px;
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

class GridChartPageComponent extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    componentDidMount()
    {
        this.props.loadMeasurements();
    }

    render()
    {
        return (
            <TwoColumnPage
                menu={this.renderMenu}
                menuWidth='auto'
                content={this.renderContent} />
        );
    }
    renderMenu = (): JSX.Element =>
    {
        return (
            <>
                <Box title='Range' help={RangeHelp}>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.props.onChangeRangeFilter} />
                </Box>
                <Box title='X axis' help={XAxisHelp}>
                    <MeasurementKeys project={this.props.project}
                                     value={this.state.xAxis}
                                     onChange={this.changeXAxis} />
                </Box>
                <Box>
                    <ViewFilterComponent filter={this.state.viewFilter}
                                         onChange={this.changeViewFilter} />
                </Box>
            </>
        );
    }
    renderContent = (): JSX.Element =>
    {
        const views = applyFilter(this.props.views, this.state.viewFilter);
        return (
            <Grid>
                {views.length === 0 ? 'No data available, upload some measurements.' : views.map(this.renderView)}
            </Grid>
        );
    }
    renderView = (view: View): JSX.Element =>
    {
        const measurements = view.measurements;
        const datasets = view.yAxes.map(yAxis => ({
            name: `${view.name} (${formatKey(yAxis)})`,
            yAxis,
            measurements
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
                    showDeviation={false}
                    dateFormat={CHART_DATE_FORMAT} />
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
        this.setState({ xAxis });
    }
    changeViewFilter = (viewFilter: ViewFilter) =>
    {
        this.setState({ viewFilter });
    }
}

export const GridChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    views: getViews(state),
    measurements: state.session.pages.gridChartPage.measurements
}), ({
    loadMeasurements: () => loadGridChartMeasurements.started({})
}))(GridChartPageComponent));
