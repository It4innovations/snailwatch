import React, {PureComponent} from 'react';
import {Project} from '../../../lib/project/project';
import {Measurement} from '../../../lib/measurement/measurement';
import {User} from '../../../lib/user/user';
import {sort} from 'ramda';
import {MeasurementEntry} from './measurement-entry';
import {Button, PanelGroup} from 'react-bootstrap';
import {LoadMeasurementParams, loadMeasurements} from '../../../state/measurement/actions';
import {connect} from 'react-redux';
import {Request} from '../../../util/request';
import {getUser} from '../../../state/user/reducer';
import {AppState} from '../../../state/app/reducers';
import {getSelectedProject} from '../../../state/project/reducer';
import {getMeasurements} from '../../../state/measurement/reducer';
import {RouteComponentProps, withRouter} from 'react-router';

interface StateProps
{
    user: User;
    project: Project;
    measurements: Measurement[];
    loadMeasurementsRequest: Request;
}

interface DispatchProps
{
    loadMeasurements(params: LoadMeasurementParams): void;
}

type Props = StateProps & DispatchProps;

class MeasurementListComponent extends PureComponent<Props & RouteComponentProps<{}>>
{
    componentDidMount()
    {
        this.loadMeasurements();
    }

    render()
    {
        const request = this.props.loadMeasurementsRequest;
        return (
            <div>
                {this.renderMeasurements()}
                {request.error && <div>{request.error}</div>}
                {request.loading && 'Loading measurements...'}
                {!request.loading &&
                <Button onClick={this.loadMeasurements}>Load more</Button>}
            </div>
        );
    }

    renderMeasurements = () =>
    {
        const request = this.props.loadMeasurementsRequest;
        const measurements = sort((m1: Measurement, m2: Measurement) =>
            m1.timestamp.isBefore(m2.timestamp) ? 1 : -1, this.props.measurements);

        if (!request.loading && !request.error && measurements.length === 0)
        {
            return <div>No measurements found</div>;
        }

        return (
            <PanelGroup id='measurement-list'>
                {measurements.map(measurement =>
                    <MeasurementEntry key={measurement.id} measurement={measurement} />)}
            </PanelGroup>
        );
    }

    loadMeasurements = () =>
    {
        this.props.loadMeasurements({
            user: this.props.user,
            project: this.props.project,
            filters: []
        });
    }
}

export const MeasurementList = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    measurements: getMeasurements(state),
    loadMeasurementsRequest: state.measurement.loadMeasurementsRequest,
}), ({
    loadMeasurements: loadMeasurements.started
}))(MeasurementListComponent));
