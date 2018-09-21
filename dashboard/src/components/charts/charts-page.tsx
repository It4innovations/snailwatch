import {invertObj} from 'ramda';
import React, {PureComponent} from 'react';
import FaBarChart from 'react-icons/lib/fa/bar-chart';
import FaLineChart from 'react-icons/lib/fa/line-chart';
import FaTh from 'react-icons/lib/fa/th';
import FaList from 'react-icons/lib/fa/list';
import {connect} from 'react-redux';
import {Redirect, Route, RouteComponentProps, Switch, withRouter} from 'react-router';
import {push} from 'react-router-redux';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import {RangeFilter} from '../../lib/view/range-filter';
import {Project} from '../../lib/project/project';
import {AppState} from '../../state/app/reducers';
import {Navigation} from '../../state/nav/routes';
import {changeRangeFilterAction} from '../../state/session/pages/actions';
import {
    selectChartViewAction,
    SelectChartViewParams, selectViewAction,
    SelectViewParams
} from '../../state/session/pages/chart-page/actions';
import {getRangeFilter} from '../../state/session/pages/reducers';
import {getSelectedProject} from '../../state/session/project/reducer';
import {BarChartPage} from './chart/bar-chart/bar-chart-page';
import {GridChartPage} from './chart/grid-chart/grid-chart-page';
import {LineChartPage} from './chart/line-chart/line-chart-page';
import {TrendsPage} from './chart/trends/trends-page';
import style from './charts-page.scss';

interface StateProps
{
    project: Project;
    rangeFilter: RangeFilter;
}
interface DispatchProps
{
    changeRangeFilter(rangeFilter: RangeFilter): void;
    selectDataset(params: SelectChartViewParams): void;
    selectView(params: SelectViewParams): void;
    navigate(path: string): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const chartToTab = {
    '': 0,
    'line': 1,
    'bar': 2,
    'trends': 3
};

class ChartsPageComponent extends PureComponent<Props>
{
    render()
    {
        const match = this.props.match;
        const paths = Object.keys(chartToTab);

        return (
            <Switch>
                {paths.map(path =>
                    <Route key={`route/${path}`}
                           path={`${match.url}/${path}/:viewId`}
                           exact={true}
                           render={(props) => this.selectViewAndRedirect(path, props)} />
                )}
                <Route path={`${match.url}/:chart?`}
                       render={(props: RouteComponentProps<{chart: string}>) =>
                           this.renderBody(props.match.params.chart)} />
            </Switch>
        );
    }
    selectViewAndRedirect = (path: string, props: RouteComponentProps<{viewId: string}>): JSX.Element =>
    {
        const viewId = props.match.params.viewId;
        this.props.selectView({
            viewId
        });

        return <Redirect to={`${Navigation.Dashboard}/${path}`} />;
    }

    renderBody = (chart: string): JSX.Element =>
    {
        const index = chartToTab[chart] || 0;

        return (
            <Tabs selectedIndex={index}
                  onSelect={this.changeTab}>
                <TabList className={style.tabList}>
                    <Tab>
                        <div title='Chart overview'>
                            <FaTh size={26} />
                        </div>
                    </Tab>
                    <Tab>
                        <div title='Line chart'>
                            <FaLineChart size={26} />
                        </div>
                    </Tab>
                    <Tab>
                        <div title='Stacked bar chart'>
                            <FaBarChart size={26} />
                        </div>
                    </Tab>
                    <Tab>
                        <div title='Trends'>
                            <FaList size={26} />
                        </div>
                    </Tab>
                </TabList>
                <TabPanel>
                    <GridChartPage rangeFilter={this.props.rangeFilter}
                                   onChangeRangeFilter={this.props.changeRangeFilter}
                                   selectView={this.selectDataset} />
                </TabPanel>
                <TabPanel>
                    <LineChartPage rangeFilter={this.props.rangeFilter}
                                   onChangeRangeFilter={this.props.changeRangeFilter} />
                </TabPanel>
                <TabPanel>
                    <BarChartPage rangeFilter={this.props.rangeFilter}
                                  onChangeRangeFilter={this.props.changeRangeFilter} />
                </TabPanel>
                <TabPanel>
                    <TrendsPage rangeFilter={this.props.rangeFilter}
                                onChangeRangeFilter={this.props.changeRangeFilter} />
                </TabPanel>
            </Tabs>
        );
    }

    changeTab = (selectedTab: number) =>
    {
        let path = invertObj(chartToTab)[selectedTab];
        if (path !== '')
        {
            path = `/${path}`;
        }
        this.props.navigate(`${this.props.match.url}${path}`);
    }
    selectDataset = (params: SelectChartViewParams) =>
    {
        this.props.selectDataset(params);
        this.moveToLineChart();
    }
    moveToLineChart = () =>
    {
        this.changeTab(chartToTab['line']);
    }
}

export const ChartsPage = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    project: getSelectedProject(state),
    rangeFilter: getRangeFilter(state)
}), {
    changeRangeFilter: changeRangeFilterAction,
    selectDataset: selectChartViewAction,
    selectView: selectViewAction,
    navigate: (path: string) => push(path)
})(ChartsPageComponent));
