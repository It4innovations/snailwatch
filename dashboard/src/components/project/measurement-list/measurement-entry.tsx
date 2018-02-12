import React, {PureComponent} from 'react';
import {Measurement} from '../../../lib/measurement/measurement';
import {Panel} from 'react-bootstrap';

interface Props
{
    measurement: Measurement;
}

interface State
{
    expanded: boolean;
}

export class MeasurementEntry extends PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.state = {
            expanded: false
        };
    }

    render()
    {
        const measurement = this.props.measurement;
        return (
            <Panel key={measurement.id}
                      expanded={this.state.expanded}
                      onToggle={() => this.toggleExpand()}>
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

    toggleExpand = () =>
    {
        this.setState(state => ({
            expanded: !state.expanded
        }));
    }
}
