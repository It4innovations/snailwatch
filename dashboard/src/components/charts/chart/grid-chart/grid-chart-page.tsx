import {sort} from 'ramda';
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import styled from 'styled-components';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {Project} from '../../../../lib/project/project';
import {applyFilters} from '../../../../lib/view/filter';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {SelectChartViewParams} from '../../../../state/session/pages/chart-page/actions';
import {loadGridChartMeasurements} from '../../../../state/session/pages/grid-chart-page/actions';
import {getSelectedProject} from '../../../../state/session/project/reducer';
import {getViews} from '../../../../state/session/view/reducer';
import {compareDate} from '../../../../util/date';
import {formatKey} from '../../../../util/measurement';
import {Box} from '../../../global/box';
import {MeasurementKeys} from '../../../global/keys/measurement-keys';
import {TwoColumnPage} from '../../../global/two-column-page';
import {RangeFilterSwitcher} from '../../range-filter-switcher';
import {CHART_DATE_FORMAT} from '../configuration';
import {LineChart} from '../line-chart/line-chart';
import {GridChartPageFilter} from './grid-chart-page-filter';
import {GridChartSortMode} from './grid-chart-sort-mode';

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
    sortMode: GridChartSortMode.CreationTime,
    query: ''
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
                <Box title='Range'>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.props.onChangeRangeFilter} />
                </Box>
                <Box title='X axis'>
                    <MeasurementKeys project={this.props.project}
                                     value={this.state.xAxis}
                                     onChange={this.changeXAxis} />
                </Box>
                <Box>
                    <GridChartPageFilter query={this.state.query}
                                         sortMode={this.state.sortMode}
                                         onChangeQuery={this.changeQuery}
                                         onChangeSortMode={this.changeSortMode} />
                </Box>
            </>
        );
    }
    renderContent = (): JSX.Element =>
    {
        const views = this.applyFilter(this.props.views);
        return (
            <Grid>
                {views.map(this.renderView)}
            </Grid>
        );
    }
    renderView = (view: View): JSX.Element =>
    {
        const measurements = applyFilters(this.props.measurements, view.filters);
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

    applyFilter = (views: View[]): View[] =>
    {
        const query = this.state.query.trim();
        const regex = new RegExp(query, 'i');
        const filtered = views.filter(v => regex.test(v.name));
        const sortFn: (a: View, b: View) => number = this.state.sortMode === GridChartSortMode.CreationTime ?
            (a, b) => compareDate(a.created, b.created) :
            (a, b) => a.name.localeCompare(b.name);

        return sort(sortFn, filtered);
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
    changeSortMode = (sortMode: GridChartSortMode) =>
    {
        this.setState({ sortMode });
    }
    changeQuery = (query: string) =>
    {
        this.setState({ query });
    }
}

export const GridChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    views: getViews(state),
    measurements: state.session.pages.gridChartPage.measurements
}), ({
    loadMeasurements: () => loadGridChartMeasurements.started({})
}))(GridChartPageComponent));
