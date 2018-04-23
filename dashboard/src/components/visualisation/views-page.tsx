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
import {SelectDatasetParams, selectLineChartDatasetAction} from '../../state/session/views/line-chart-page/actions';

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
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const initialState = {
    selectedTab: 0
};

class ViewsPageComponent extends PureComponent<Props, Readonly<typeof initialState>>
{
    readonly state = { ...initialState };

    render()
    {
        return (
            <Tabs selectedIndex={this.state.selectedTab}
                  onSelect={this.changeTab}>
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
        this.setState(() => ({ selectedTab }));
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
    selectDataset: selectLineChartDatasetAction
})(ViewsPageComponent));
