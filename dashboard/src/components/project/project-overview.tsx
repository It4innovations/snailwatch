import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {AppState} from '../../state/app/reducers';
import {getUser} from '../../state/session/user/reducer';
import {RouteComponentProps, withRouter} from 'react-router';
import {Request} from '../../util/request';
import {getSelectedProject, getUploadToken} from '../../state/session/project/reducer';
import {Button, Card, CardBody, Input, InputGroup, InputGroupAddon} from 'reactstrap';
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/light';
import python from 'react-syntax-highlighter/languages/hljs/python';
import {dracula} from 'react-syntax-highlighter/styles/hljs';
import {API_SERVER} from '../../configuration';
import Badge from 'reactstrap/lib/Badge';
import {loadUploadToken, regenerateUploadToken, UploadTokenParams} from '../../state/session/project/actions';
import styled from 'styled-components';
import CopyToClipboard from 'react-copy-to-clipboard';
import {toast, ToastContainer} from 'react-toastify';
import MdContentCopy from 'react-icons/lib/md/content-copy';
import CardHeader from 'reactstrap/lib/CardHeader';

registerLanguage('python', python);

interface StateProps
{
    user: User;
    project: Project;
    loadProjectRequest: Request;
    uploadToken: string | null;
    uploadTokenRequest: Request;
}
interface DispatchProps
{
    loadUploadToken(params: UploadTokenParams): void;
    regenerateUploadToken(params: UploadTokenParams): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const UploadTokenWrapper = styled.div`
  font-size: 20px;
  margin-bottom: 20px;
`;

class ProjectOverviewComponent extends PureComponent<Props & RouteComponentProps<void>>
{
    componentDidMount()
    {
        this.props.loadUploadToken({
            user: this.props.user,
            project: this.props.project
        });
    }

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
                <ToastContainer position={toast.POSITION.TOP_RIGHT} autoClose={false} />
                <Card>
                    <CardHeader>Project overview</CardHeader>
                    <CardBody>
                        <InputGroup>
                            <InputGroupAddon addonType='prepend'>Name</InputGroupAddon>
                            <Input value={this.props.project.name} disabled />
                        </InputGroup>
                        <InputGroup>
                            <InputGroupAddon addonType='prepend'>Id</InputGroupAddon>
                            <Input value={this.props.project.id} disabled />
                        </InputGroup>
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>Upload token</CardHeader>
                    <CardBody>
                        {this.renderUploadTokenSection()}
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>Measurement tutorial</CardHeader>
                    <CardBody>
                        {this.renderMeasurementHint()}
                    </CardBody>
                </Card>
            </div>
        );
    }
    renderUploadTokenSection = (): JSX.Element =>
    {
        if (this.props.uploadTokenRequest.error)
        {
            return <div>Couldn't load upload token: {this.props.uploadTokenRequest.error}</div>;
        }

        return (
            <>
                <div>
                    This token is needed to upload measurements to this project.
                </div>
                <UploadTokenWrapper>
                    {this.renderUploadToken()}
                </UploadTokenWrapper>
                <div>You can create a new token if you want. This will revoke the previous token.</div>
                <Button color='danger'
                        onClick={this.regenerateUploadToken}
                        disabled={this.props.uploadTokenRequest.loading}>
                    Regenerate token
                </Button>
            </>
        );
    }
    renderUploadToken = (): JSX.Element =>
    {
        if (this.props.uploadTokenRequest.loading)
        {
            return <div>Loading...</div>;
        }

        return (
            <>
                <Badge color='info'>
                    {this.props.uploadToken}
                </Badge>
                <CopyToClipboard text={this.props.uploadToken}
                                 onCopy={() => toast.info('Upload token copied to clipboard!')}>
                    <span title='Copy upload token to clipboard'>
                        <MdContentCopy size={22} />
                    </span>
                </CopyToClipboard>
            </>
        );
    }
    renderMeasurementHint = (): JSX.Element =>
    {
        return (
            <>
                    <div>
                        We provide a simple Python library located at <code>python/sw-client</code> that can
                        simplify measurement uploads and user creation.<br />
                        You can use the following snippet as an example how to use it.
                    </div>
                    <SyntaxHighlighter language='python' style={dracula}>
{`from swclient.session import Session

session = Session(
    "${API_SERVER}", # server address
    "${this.getUploadToken()}" # upload token
)

session.upload_measurement(
    "MyAwesomeBenchmark",   # benchmark name
    {                       # environment of the measurement
        "commit": "abcdef",
        "branch": "master",
        "threads": "16"
    },
    {                    # measured results
        "executionTime": {
            "value": "13.37",
            "type": "time"
        }
    }
)`}
                    </SyntaxHighlighter>
            </>
        );
    }

    getUploadToken = (): string =>
    {
        if (this.props.uploadToken !== null)
        {
            return this.props.uploadToken;
        }
        return '<upload-token>';
    }

    regenerateUploadToken = () =>
    {
        this.props.regenerateUploadToken({
            user: this.props.user,
            project: this.props.project
        });
    }
}

export const ProjectOverview = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    loadProjectRequest: state.session.project.loadProjectRequest,
    uploadToken: getUploadToken(state),
    uploadTokenRequest: state.session.project.uploadTokenRequest
}), {
    loadUploadToken: loadUploadToken.started,
    regenerateUploadToken: regenerateUploadToken.started
})(ProjectOverviewComponent));
