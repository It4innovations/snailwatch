import React, {PureComponent} from 'react';
import {Project} from '../../lib/project/project';
import {Input, InputGroup, Collapse, Button, Card, CardBody} from 'reactstrap';
import {User} from '../../lib/user/user';
import {RouteComponentProps, withRouter} from 'react-router';
import {getUser} from '../../state/user/reducer';
import { getSelectedProject} from '../../state/project/reducer';
import {AppState} from '../../state/app/reducers';
import {connect} from 'react-redux';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/light';
import python from 'react-syntax-highlighter/languages/hljs/python';
import {dracula} from 'react-syntax-highlighter/styles/hljs';
import styled from 'styled-components';
import {PasswordForm} from './password-form';
import {changePassword, ChangePasswordParams} from '../../state/user/actions';
import {Request} from '../../util/request';

registerLanguage('python', python);

interface StateProps
{
    user: User;
    selectedProject: Project | null;
    changePasswordRequest: Request;
}
interface DispatchProps
{
    changePassword(params: ChangePasswordParams): void;
}

interface State
{
    measurementOpened: boolean;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const Section = styled.div`
  margin-bottom: 5px;
`;
const SectionButton = styled(Button)`
  margin-bottom: 5px;
`;

class ProfileComponent extends PureComponent<Props, State>
{
    state: State = {
        measurementOpened: false
    };

    render()
    {
        return (
            <div>
                <Section>
                    <h4>Account details</h4>
                    <InputGroup>
                        <InputGroupAddon addonType='prepend'>Username</InputGroupAddon>
                        <Input id='username' value={this.props.user.username} disabled />
                    </InputGroup>
                </Section>
                <Section>
                    <h4>Change password</h4>
                    <PasswordForm
                        changePasswordRequest={this.props.changePasswordRequest}
                        onChangePassword={this.onChangePassword} />
                </Section>
                <Section>
                    <SectionButton color='primary'
                                   onClick={this.toggleMeasurementOpened}>
                        Measurement tutorial
                    </SectionButton>
                    <Collapse isOpen={this.state.measurementOpened}>
                        {this.renderMeasurementHint()}
                    </Collapse>
                </Section>
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
{`from collect import create_context, send_measurements

ctx = create_context(
    "https://snailwatch.it4i.cz/api",
    ${this.getProjectId()},  # project id
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

    getProjectId = (): string =>
    {
        if (this.props.selectedProject !== null)
        {
            return `"${this.props.selectedProject.id}"`;
        }
        return '<project-id>';
    }

    onChangePassword = (oldPassword: string, newPassword: string) =>
    {
        this.props.changePassword({
            user: this.props.user,
            oldPassword,
            newPassword
        });
    }


    toggleMeasurementOpened = () =>
    {
        this.setState(state => ({
            measurementOpened: !state.measurementOpened
        }));
    }
}

export const Profile = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    selectedProject: getSelectedProject(state),
    changePasswordRequest: state.user.changePasswordRequest
}), {
    changePassword: changePassword.started
})(ProfileComponent));
