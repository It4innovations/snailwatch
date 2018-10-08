import {Dictionary} from 'ramda';
import React, {PureComponent} from 'react';
import FaBarChart from 'react-icons/lib/fa/bar-chart';
import FaLineChart from 'react-icons/lib/fa/line-chart';
import FaList from 'react-icons/lib/fa/list';
import FaTh from 'react-icons/lib/fa/th';
import {connect} from 'react-redux';
import {Redirect, Route, RouteComponentProps, Switch, withRouter} from 'react-router';
import {push} from 'react-router-redux';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import styled from 'styled-components';
import {Project} from '../../lib/project/project';
import {RangeFilter} from '../../lib/view/range-filter';
import {AppState} from '../../state/app/reducers';
import {Navigation} from '../../state/nav/routes';
import {changeRangeFilterAction} from '../../state/session/pages/actions';
import {
    selectChartViewAction,
    SelectChartViewParams,
    selectViewAction,
    SelectViewParams
} from '../../state/session/pages/chart-page/actions';
import {getRangeFilter} from '../../state/session/pages/reducers';
import {getSelectedProject} from '../../state/session/project/reducers';
import {Request} from '../../util/request';
import {MultiRequestComponent} from '../global/request/multi-request-component';
import {ProjectGate} from '../project/project-gate';
import {BarChartPage} from './chart/bar-chart/bar-chart-page';
import {DATE_FORMAT_DAY, DateFormat} from './chart/date-format';
import {GridChartPage} from './chart/grid-chart/grid-chart-page';
import {LineChartPage} from './chart/line-chart/line-chart-page';
import {TrendsPage} from './chart/trends/trends-page';
import style from './charts-page.scss';

interface StateProps
{
    project: Project;
    rangeFilter: RangeFilter;
    measurementRequest: Request;
    viewRequest: Request;
}
interface DispatchProps
{
    changeRangeFilter(rangeFilter: RangeFilter): void;
    selectDataset(params: SelectChartViewParams): void;
    selectView(params: SelectViewParams): void;
    navigate(path: string): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const initialState = {
    xAxis: '',
    dateFormat: DATE_FORMAT_DAY as DateFormat
};
type State = Readonly<typeof initialState>;

interface TabSection
{
    index: number;
    header: string;
}

const chartToTab: Dictionary<TabSection> = {
    '': {
        index: 0,
        header: 'Grid overview'
    },
    'line': {
        index: 1,
        header: 'Line chart'
    },
    'bar': {
        index: 2,
        header: 'Bar chart'
    },
    'trends': {
        index: 3,
        header: 'Trends'
    }
};

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const SectionHeader = styled.div`
  margin-left: 45px;
  font-size: 1.5em;
`;


class ChartsPageComponent extends PureComponent<Props, State>
{
    readonly state = initialState;

    render()
    {
        const match = this.props.match;
        const paths = Object.keys(chartToTab);

        return (
            <ProjectGate>
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
            </ProjectGate>
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
        const activeTab = chartToTab[chart] || chartToTab[''];

        return (
            <Tabs selectedIndex={activeTab.index}
                  onSelect={this.changeTab}>
                <Row>
                    <Row>
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
                        <SectionHeader>{activeTab.header}</SectionHeader>
                    </Row>
                    <MultiRequestComponent requests={[this.props.viewRequest, this.props.measurementRequest]} />
                </Row>
                <TabPanel>
                    <GridChartPage rangeFilter={this.props.rangeFilter}
                                   onChangeRangeFilter={this.props.changeRangeFilter}
                                   xAxis={this.state.xAxis}
                                   onChangeXAxis={this.changeXAxis}
                                   dateFormat={this.state.dateFormat}
                                   onChangeDateFormat={this.changeDateFormat}
                                   selectView={this.selectDataset} />
                </TabPanel>
                <TabPanel>
                    <LineChartPage rangeFilter={this.props.rangeFilter}
                                   onChangeRangeFilter={this.props.changeRangeFilter}
                                   xAxis={this.state.xAxis}
                                   onChangeXAxis={this.changeXAxis}
                                   dateFormat={this.state.dateFormat}
                                   onChangeDateFormat={this.changeDateFormat}
                    />
                </TabPanel>
                <TabPanel>
                    <BarChartPage rangeFilter={this.props.rangeFilter}
                                  onChangeRangeFilter={this.props.changeRangeFilter}
                                  xAxis={this.state.xAxis}
                                  onChangeXAxis={this.changeXAxis}
                                  dateFormat={this.state.dateFormat}
                                  onChangeDateFormat={this.changeDateFormat} />
                </TabPanel>
                <TabPanel>
                    <TrendsPage rangeFilter={this.props.rangeFilter}
                                onChangeRangeFilter={this.props.changeRangeFilter}
                                xAxis={this.state.xAxis}
                                onChangeXAxis={this.changeXAxis}
                                dateFormat={this.state.dateFormat}
                                onChangeDateFormat={this.changeDateFormat} />
                </TabPanel>
            </Tabs>
        );
    }

    changeTab = (selectedTab: number) =>
    {
        let path = Object.keys(chartToTab).filter(k => chartToTab[k].index === selectedTab)[0];
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
        this.changeTab(chartToTab['line'].index);
    }

    changeXAxis = (xAxis: string) =>
    {
        this.setState({ xAxis });
    }
    changeDateFormat = (dateFormat: DateFormat) =>
    {
        this.setState({ dateFormat });
    }
}

export const ChartsPage = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    project: getSelectedProject(state),
    rangeFilter: getRangeFilter(state),
    measurementRequest: state.session.pages.chartState.measurementsRequest,
    viewRequest: state.session.view.viewRequest
}), {
    changeRangeFilter: changeRangeFilterAction,
    selectDataset: selectChartViewAction,
    selectView: selectViewAction,
    navigate: (path: string) => push(path)
})(ChartsPageComponent));
