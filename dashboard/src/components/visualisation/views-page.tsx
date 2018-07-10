import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Route, RouteComponentProps, withRouter} from 'react-router';
import {AppState} from '../../state/app/reducers';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {getUser} from '../../state/session/user/reducer';
import {getSelectedProject} from '../../state/session/project/reducer';
import {BarChartPage} from './chart/bar-chart/bar-chart-page';
import {LineChartPage} from './chart/line-chart/line-chart-page';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import FaBarChart from 'react-icons/lib/fa/bar-chart';
import FaLineChart from 'react-icons/lib/fa/line-chart';
import {RangeFilter} from '../../lib/measurement/selection/range-filter';
import {getRangeFilter} from '../../state/session/views/reducers';
import {changeRangeFilterAction} from '../../state/session/views/actions';
import FaTh from 'react-icons/lib/fa/th';
import {GridChartPage} from './chart/grid-chart/grid-chart-page';
import {SelectDatasetParams, selectLineChartDatasetAction} from '../../state/session/views/line-chart-page/actions';
import {loadProject, LoadProjectParams} from '../../state/session/project/actions';
import {loadSelectionsAction, LoadSelectionsParams} from '../../state/session/selection/actions';
import {push} from 'react-router-redux';
import {invertObj} from 'ramda';

import style from './views-page.scss';

interface StateProps
{
    user: User;
    project: Project;
    rangeFilter: RangeFilter;
}
interface DispatchProps
{
    changeRangeFilter(rangeFilter: RangeFilter): void;
    selectDataset(params: SelectDatasetParams): void;
    loadProject(params: LoadProjectParams): void;
    loadSelections(params: LoadSelectionsParams): void;
    navigate(path: string): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const chartToTab = {
    '': 0,
    'line': 1,
    'bar': 2
};

class ViewsPageComponent extends PureComponent<Props>
{
    componentDidMount()
    {
        this.props.loadProject({
            user: this.props.user,
            name: this.props.project.name
        });
        this.props.loadSelections({
            user: this.props.user,
            project: this.props.project
        });
    }

    render()
    {
        const match = this.props.match;

        return (
            <Route path={match.url + '/:chart?'}
                   exact={true}
                   render={(props: RouteComponentProps<{chart: string}>) =>
                       this.renderBody(props.match.params.chart)} />
        );
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
                </TabList>
                <TabPanel>
                    <GridChartPage rangeFilter={this.props.rangeFilter}
                                   onChangeRangeFilter={this.props.changeRangeFilter}
                                   selectDataset={this.selectDataset} />
                </TabPanel>
                <TabPanel>
                    <LineChartPage rangeFilter={this.props.rangeFilter}
                                   onChangeRangeFilter={this.props.changeRangeFilter} />
                </TabPanel>
                <TabPanel>
                    <BarChartPage rangeFilter={this.props.rangeFilter}
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
    selectDataset = (params: SelectDatasetParams) =>
    {
        this.props.selectDataset(params);
        this.moveToLineChart();
    }
    moveToLineChart = () =>
    {
        this.changeTab(1);
    }
}

export const ViewsPage = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    rangeFilter: getRangeFilter(state)
}), {
    changeRangeFilter: changeRangeFilterAction,
    selectDataset: selectLineChartDatasetAction,
    loadProject: loadProject.started,
    loadSelections: loadSelectionsAction.started,
    navigate: (path: string) => push(path)
})(ViewsPageComponent));
