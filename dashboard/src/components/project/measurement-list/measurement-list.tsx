import React, {PureComponent} from 'react';
import {Project} from '../../../lib/project/project';
import {Measurement} from '../../../lib/measurement/measurement';
import {User} from '../../../lib/user/user';
import {Panel, PanelGroup} from 'react-bootstrap';
import {contains, without} from 'ramda';

interface Props
{
    user: User;
    project: Project;
    measurements: Measurement[];
}
interface State
{
    expandedMeasurements: string[];
}

export class MeasurementList extends PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.state = {
            expandedMeasurements: []
        };
    }

    render()
    {
        return (
            <PanelGroup id='measurement-list'>
                {this.props.measurements.map(measurement =>
                    this.renderMeasurement(measurement))}
            </PanelGroup>
        );
    }

    renderMeasurement = (measurement: Measurement): JSX.Element =>
    {
        return (
            <Panel key={measurement.id}
                   expanded={contains(measurement.id, this.state.expandedMeasurements)}
                   onToggle={() => this.toggleExpand(measurement.id)}>
                <Panel.Heading>
                    <Panel.Title toggle>
                        Benchmark {measurement.benchmark} - {measurement.createdAt.format('DD. MM. YYYY HH:mm:ss')}
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Collapse>
                    <Panel.Body>
                        <div>
                            <pre>
                                {JSON.stringify({
                                    environment: measurement.environment,
                                    measurement: measurement.measurement
                                }, null, 2)}
                            </pre>
                        </div>
                    </Panel.Body>
                </Panel.Collapse>
            </Panel>
        );
    }

    toggleExpand = (id: string) =>
    {
        this.setState((state: State) => ({
            expandedMeasurements: contains(id, state.expandedMeasurements) ?
                without([id], state.expandedMeasurements) : state.expandedMeasurements.concat([id])
        }));
    }
}
