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
import {Button, Card, CardBody, Collapse, Input, InputGroup, InputGroupAddon} from 'reactstrap';
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/light';
import python from 'react-syntax-highlighter/languages/hljs/python';
import {dracula} from 'react-syntax-highlighter/styles/hljs';
import {API_SERVER} from '../../configuration';

registerLanguage('python', python);

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
interface State
{
    measurementOpened: boolean;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

class ProjectOverviewComponent extends PureComponent<Props & RouteComponentProps<void>, State>
{
    state: State = {
        measurementOpened: false
    };

    render()
    {
        if (this.props.loadProjectRequest.error)
        {
            return <div>{this.props.loadProjectRequest.error}</div>;
        }
        if (this.props.loadProjectRequest.loading)
        {
            return <div>Loading...</div>;
        }

        return (
            <div>
                <div>
                    <h4>Project overview</h4>
                    <InputGroup>
                        <InputGroupAddon addonType='prepend'>Name</InputGroupAddon>
                        <Input value={this.props.project.name} disabled />
                    </InputGroup>
                    <InputGroup>
                        <InputGroupAddon addonType='prepend'>Id</InputGroupAddon>
                        <Input value={this.props.project.id} disabled />
                    </InputGroup>
                </div>
                <div>
                    <Button color='primary'
                            onClick={this.toggleMeasurementOpened}>
                        Measurement tutorial
                    </Button>
                    <Collapse isOpen={this.state.measurementOpened}>
                        {this.renderMeasurementHint()}
                    </Collapse>
                </div>
            </div>
        );
    }

    renderMeasurementHint = (): JSX.Element =>
    {
        return (
            <Card>
                <CardBody>
                    We provide a simple Python script located at <code>server/scripts/collect.py</code> to
                    simplify measurement results uploads.<br />
                    You can use the following snippet as an example how to use it.
                    <SyntaxHighlighter language='python' style={dracula}>
                        {`from collect import create_context, send_measurement

ctx = create_context(
    "${API_SERVER}", # server address
    "${this.props.project.id}", # project id
    "${this.props.user.token}" # session token
)

send_measurement(ctx,
    "MyAwesomeBenchmark",   # benchmark name
    {                       # environment of the measurement
        "commit": "abcdef",
        "branch": "master",
        "threads": "16"
    }, {                    # measured results
        "executionTime": {
            "value": "13.37",
            "type": "time"
        }
    })`}
                    </SyntaxHighlighter>
                </CardBody>
            </Card>
        );
    }

    toggleMeasurementOpened = () =>
    {
        this.setState(state => ({
            measurementOpened: !state.measurementOpened
        }));
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
