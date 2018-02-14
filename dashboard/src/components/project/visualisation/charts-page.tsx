import React, {PureComponent} from 'react';
import {ViewContainer} from './view-container/view-container';
import styled from 'styled-components';
import {LineChart} from './chart/line-chart';
import {Measurement} from '../../../lib/measurement/measurement';
import {View} from '../../../lib/view/view';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {getMeasurements, getTotalMeasurements} from '../../../state/measurement/reducer';
import {AppState} from '../../../state/app/reducers';
import {getSelectedView} from '../../../state/view/reducer';
import {MeasurementInfo} from './measurement-info';
import {LoadMeasurementParams, loadMeasurements} from '../../../state/measurement/actions';
import {Project} from '../../../lib/project/project';
import {User} from '../../../lib/user/user';
import {getUser} from '../../../state/user/reducer';
import {getSelectedProject} from '../../../state/project/reducer';

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

const Container = styled.div`
  display: flex;
`;

class ChartsPageComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <Container>
                <ViewContainer />
                <MeasurementInfo
                    measurements={this.props.measurements}
                    totalMeasurements={this.props.totalMeasurements}
                    loadMore={this.loadMoreMeasurements} />
                {this.props.selectedView &&
                    <LineChart
                        measurements={this.props.measurements}
                        view={this.props.selectedView} />}
            </Container>
        );
    }

    loadMoreMeasurements = () =>
    {
        this.props.loadMeasurements({
            user: this.props.user,
            project: this.props.project,
            filters: this.props.selectedView.filters,
            reload: false
        });
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
