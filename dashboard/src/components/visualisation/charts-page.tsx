import React, {PureComponent} from 'react';
import {ViewContainer} from './view-container/view-container';
import styled from 'styled-components';
import {LineChart} from './chart/line-chart';
import {Measurement} from '../../lib/measurement/measurement';
import {View} from '../../lib/view/view';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {getMeasurements, getTotalMeasurements} from '../../state/measurement/reducer';
import {AppState} from '../../state/app/reducers';
import {getSelectedView} from '../../state/view/reducer';
import {MeasurementInfo} from './measurement-info';
import {createLoadMeasurementParams, LoadMeasurementParams, loadMeasurements} from '../../state/measurement/actions';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {getUser} from '../../state/user/reducer';
import {getSelectedProject} from '../../state/project/reducer';
import {ChartSettings} from './chart/chart-settings';

interface StateProps
{
    user: User;
    project: Project;
    measurements: Measurement[];
    totalMeasurements: number;
    selectedView: View;
}

interface DispatchProps
{
    loadMeasurements(params: LoadMeasurementParams): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    groupByEnvironment: boolean;
}

const Container = styled.div`
  display: flex;
`;
const Expander = styled.div`
  flex-grow: 1;
`;

class ChartsPageComponent extends PureComponent<Props, State>
{
    state: State = {
        groupByEnvironment: true
    };

    componentDidMount()
    {
        this.props.loadMeasurements(createLoadMeasurementParams({
            user: this.props.user,
            project: this.props.project,
            filters: this.props.selectedView !== null ? this.props.selectedView.filters : [],
            reload: true
        }));
    }

    render()
    {
        return (
            <Container>
                <Expander>
                    <ViewContainer />
                </Expander>
                {this.props.selectedView &&
                    <Expander>
                        <LineChart
                            measurements={this.props.measurements}
                            view={this.props.selectedView}
                            groupByEnvironment={this.state.groupByEnvironment} />
                        <ChartSettings
                            groupByEnvironment={this.state.groupByEnvironment}
                            onChangeGroup={this.handleChangeGroup} />
                    </Expander>
                }
                <MeasurementInfo
                    measurements={this.props.measurements}
                    totalMeasurements={this.props.totalMeasurements}
                    loadMore={this.loadMoreMeasurements} />
            </Container>
        );
    }

    loadMoreMeasurements = () =>
    {
        this.props.loadMeasurements(createLoadMeasurementParams({
            user: this.props.user,
            project: this.props.project,
            filters: this.props.selectedView.filters,
            reload: false
        }));
    }

    handleChangeGroup = (groupByEnvironment: boolean) =>
    {
        this.setState(() => ({
            groupByEnvironment
        }));
    }
}

export const ChartsPage = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    measurements: getMeasurements(state),
    totalMeasurements: getTotalMeasurements(state),
    selectedView: getSelectedView(state)
}), {
    loadMeasurements: loadMeasurements.started
})(ChartsPageComponent));