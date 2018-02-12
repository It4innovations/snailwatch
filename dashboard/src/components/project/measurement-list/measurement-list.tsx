import React, {PureComponent} from 'react';
import {Project} from '../../../lib/project/project';
import {Measurement} from '../../../lib/measurement/measurement';
import {User} from '../../../lib/user/user';
import {Panel, PanelGroup} from 'react-bootstrap';
import {contains, without, sort} from 'ramda';

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
            <Panel key={measurement.id}
                   expanded={contains(measurement.id, this.state.expandedMeasurements)}
                   onToggle={() => this.toggleExpand(measurement.id)}>
                <Panel.Heading>
                    <Panel.Title toggle>
                        Benchmark {measurement.benchmark} - {measurement.timestamp.format('DD. MM. YYYY HH:mm:ss')}
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Collapse>
                    <Panel.Body>
                        <div>
                            <pre>
                                {JSON.stringify({
                                    benchmark: measurement.benchmark,
                                    environment: measurement.environment,
                                    result: measurement.result
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
