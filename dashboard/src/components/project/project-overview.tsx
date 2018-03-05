import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {AppState} from '../../state/app/reducers';
import {getUser} from '../../state/user/reducer';
import {RouteComponentProps, withRouter} from 'react-router';
import {clearMeasurements} from '../../state/measurement/actions';
import {Measurement} from '../../lib/measurement/measurement';
import {getMeasurements} from '../../state/measurement/reducer';
import {Request} from '../../util/request';
import {getSelectedProject} from '../../state/project/reducer';

interface StateProps
{
    user: User;
    project: Project;
    measurements: Measurement[];
    loadProjectRequest: Request;
}
interface DispatchProps
{
    clearMeasurements(): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

class ProjectOverviewComponent extends PureComponent<Props & RouteComponentProps<void>>
{
    render()
    {
        if (this.props.loadProjectRequest.error)
        {
            return <div>{this.props.loadProjectRequest.error}</div>;
        }

        return 'Ahoj';
    }
}

export const ProjectOverview = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    measurements: getMeasurements(state),
    loadProjectRequest: state.project.loadProjectRequest
}), {
    clearMeasurements
})(ProjectOverviewComponent));
