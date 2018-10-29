import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import styled from 'styled-components';
import {RangeHelp, XAxisHelp} from '../../../../help';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Project} from '../../../../lib/project/project';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {SelectChartViewParams, setAllViewsActiveAction} from '../../../../state/session/pages/chart-page/actions';
import {getSelectedProject} from '../../../../state/session/project/reducers';
import {getViews} from '../../../../state/session/view/reducers';
import {formatKey} from '../../../../util/measurement';
import {Box} from '../../../global/box';
import {TwoColumnPage} from '../../../global/two-column-page';
import {RangeFilterSwitcher} from '../../range-filter/range-filter-switcher';
import {applyFilter, ViewFilter, ViewSortMode} from '../../view/view-filter/view-filter';
import {ViewFilterComponent} from '../../view/view-filter/view-filter-component';
import {LineChart} from '../line-chart/line-chart';
import {LineChartSettings} from '../line-chart/line-chart-settings';
import {XAxisSelector} from '../x-axis-selector';
import {XAxisSettings} from '../x-axis-settings';

interface OwnProps
{
    rangeFilter: RangeFilter;
    xAxisSettings: XAxisSettings;
    onChangeRangeFilter(rangeFilter: RangeFilter): void;
    onChangeXAxisSettings(settings: XAxisSettings): void;
    selectView(view: SelectChartViewParams): void;
}
interface StateProps
{
    project: Project;
    views: View[];
}
interface DispatchProps
{
    setAllViewsActive(): void;
}

type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<void>;

const initialState = {
    viewFilter: {
        query: '',
        sortMode: ViewSortMode.CreationTime,
        hideEmpty: true
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
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin: 0 4px 4px 0;
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

    private settings: LineChartSettings = {
        connectPoints: true,
        showPoints: false,
        showErrorBars: false,
        showAverageTrend: false
    };

    componentDidMount()
    {
        this.props.setAllViewsActive();
    }

    render()
    {
        return (
            <TwoColumnPage
                menu={this.renderMenu}
                menuWidth='auto'
                content={this.renderContent}
                alignMenuToTop={false} />
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
                    <XAxisSelector project={this.props.project}
                                   settings={this.props.xAxisSettings}
                                   onChange={this.props.onChangeXAxisSettings} />
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

        if (this.state.viewFilter.hideEmpty && measurements.length === 0) return null;

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
                    xAxis={this.props.xAxisSettings.xAxis}
                    width={300}
                    height={150}
                    preview={true}
                    groupMode={GroupMode.AxisX}
                    sortMode={this.props.xAxisSettings.sortMode}
                    settings={this.settings}
                    dateFormat={this.props.xAxisSettings.dateFormat} />
            </Dataset>
        );
    }

    selectView = (view: View) =>
    {
        this.props.selectView({
            view,
            xAxis: this.props.xAxisSettings.xAxis
        });
    }

    changeViewFilter = (viewFilter: ViewFilter) =>
    {
        this.setState({ viewFilter });
    }
}

export const GridChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    views: getViews(state)
}), {
    setAllViewsActive: setAllViewsActiveAction
})(GridChartPageComponent));
