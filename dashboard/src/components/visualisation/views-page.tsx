import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {AppState} from '../../state/app/reducers';
import {createLoadMeasurementParams, LoadMeasurementParams, loadMeasurements} from '../../state/measurement/actions';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {getUser} from '../../state/user/reducer';
import {getSelectedProject} from '../../state/project/reducer';
import {BarChartPage} from './bar-chart/bar-chart-page';
import {LineChartPage} from './line-chart/line-chart-page';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import FaBarChart from 'react-icons/lib/fa/bar-chart';
import FaLineChart from 'react-icons/lib/fa/line-chart';
import moment from 'moment';
import {RangeFilter} from '../../lib/measurement/selection/range-filter';

interface StateProps
{
    user: User;
    project: Project;
}

interface DispatchProps
{
    loadMeasurements(params: LoadMeasurementParams): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const initialState = {
    rangeFilter: {
        from: moment().subtract(1, 'w'),
        to: moment(),
        entryCount: 50,
        useDateFilter: false
    }
};
type State = Readonly<typeof initialState>;

class ViewsPageComponent extends PureComponent<Props, State>
{
    readonly state = initialState;

    componentDidMount()
    {
        this.props.loadMeasurements(createLoadMeasurementParams({
            user: this.props.user,
            project: this.props.project,
            filters: [],
            reload: true
        }));
    }

    render()
    {
        return (
            <Tabs>
                <TabList>
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
                    <LineChartPage rangeFilter={this.state.rangeFilter}
                        onChangeRangeFilter={this.changeRangeFilter} />
                </TabPanel>
                <TabPanel>
                    <BarChartPage rangeFilter={this.state.rangeFilter}
                                  onChangeRangeFilter={this.changeRangeFilter} />
                </TabPanel>
            </Tabs>
        );
    }

    changeRangeFilter = (rangeFilter: RangeFilter) =>
    {
        this.setState(() => ({ rangeFilter }));
    }
}

export const ViewsPage = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state)
}), {
    loadMeasurements: loadMeasurements.started
})(ViewsPageComponent));
