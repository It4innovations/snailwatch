import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
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
import {GridChartPage} from './chart/grid-page/grid-chart-page';

interface StateProps
{
    user: User;
    project: Project;
    rangeFilter: RangeFilter;
}
interface DispatchProps
{
    changeRangeFilter(rangeFilter: RangeFilter): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

class ViewsPageComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <Tabs>
                <TabList>
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
                                   onChangeRangeFilter={this.props.changeRangeFilter} />
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
}

export const ViewsPage = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    rangeFilter: getRangeFilter(state)
}), {
    changeRangeFilter: changeRangeFilterAction
})(ViewsPageComponent));
