import React, {PureComponent} from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import MdContentCopy from 'react-icons/lib/md/content-copy';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import python from 'react-syntax-highlighter/languages/hljs/python';
import SyntaxHighlighter, {registerLanguage} from 'react-syntax-highlighter/light';
import {dracula} from 'react-syntax-highlighter/styles/hljs';
import {toast, ToastContainer} from 'react-toastify';
import {Button, Card, CardBody} from 'reactstrap';
import Badge from 'reactstrap/lib/Badge';
import CardHeader from 'reactstrap/lib/CardHeader';
import styled from 'styled-components';
import {API_SERVER} from '../../configuration';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {AppState} from '../../state/app/reducers';
import {loadUploadToken, ProjectActions, regenerateUploadToken} from '../../state/session/project/actions';
import {getSelectedProject, getUploadToken} from '../../state/session/project/reducer';
import {getUser} from '../../state/session/user/reducer';
import {Request} from '../../util/request';
import {RequestComponent} from '../global/request-component';
import {ProjectForm} from './project-form';

registerLanguage('python', python);

interface StateProps
{
    user: User;
    project: Project;
    projectRequest: Request;
    uploadToken: string | null;
    uploadTokenRequest: Request;
}
interface DispatchProps
{
    loadUploadToken(): void;
    regenerateUploadToken(): void;
    changeProject(project: Project): void;
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
        this.props.loadUploadToken();
    }

    render()
    {
        return (
            <div>
                <ToastContainer position={toast.POSITION.TOP_RIGHT} autoClose={false} />
                <RequestComponent request={this.props.projectRequest} />
                <Card>
                    <CardHeader>Project overview</CardHeader>
                    <CardBody>
                        <ProjectForm project={this.props.project}
                                     onChange={this.props.changeProject} />
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
        this.props.regenerateUploadToken();
    }
}

export const ProjectOverview = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    projectRequest: state.session.project.projectRequest,
    uploadToken: getUploadToken(state),
    uploadTokenRequest: state.session.project.uploadTokenRequest
}), {
    loadUploadToken: () => loadUploadToken.started({}),
    regenerateUploadToken: () => regenerateUploadToken.started({}),
    changeProject: ProjectActions.update.started
})(ProjectOverviewComponent));
