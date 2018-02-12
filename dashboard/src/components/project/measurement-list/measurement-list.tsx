import React, {PureComponent} from 'react';
import {Project} from '../../../lib/project/project';
import {Measurement} from '../../../lib/measurement/measurement';
import {User} from '../../../lib/user/user';
import {sort} from 'ramda';
import {MeasurementEntry} from './measurement-entry';
import {PanelGroup} from 'react-bootstrap';

interface Props
{
    user: User;
    project: Project;
    measurements: Measurement[];
}

export class MeasurementList extends PureComponent<Props>
{
    render()
    {
        const measurements = sort((m1: Measurement, m2: Measurement) =>
            m1.timestamp.isBefore(m2.timestamp) ? 1 : -1, this.props.measurements);
        return (
            <PanelGroup id='measurement-list'>
                {measurements.map(measurement =>
                    this.renderMeasurement(measurement))}
            </PanelGroup>
        );
    }

    renderMeasurement = (measurement: Measurement): JSX.Element =>
    {
        return (
            <MeasurementEntry key={measurement.id} measurement={measurement} />
        );
    }
}
