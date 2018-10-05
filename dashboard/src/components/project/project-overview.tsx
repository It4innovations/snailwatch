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
import {ProjectActions, regenerateUploadToken, RegenerateUploadTokenParams} from '../../state/session/project/actions';
import {getSelectedProject} from '../../state/session/project/reducers';
import {getUser} from '../../state/session/user/reducers';
import {Request} from '../../util/request';
import {RequestComponent} from '../global/request/request-component';
import {ProjectForm} from './project-form';

registerLanguage('python', python);

interface StateProps
{
    user: User;
    project: Project;
    projectRequest: Request;
}
interface DispatchProps
{
    regenerateUploadToken(params: RegenerateUploadTokenParams): void;
    changeProject(project: Project): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const UploadTokenWrapper = styled.div`
  font-size: 20px;
  margin-bottom: 20px;
`;

class ProjectOverviewComponent extends PureComponent<Props & RouteComponentProps<void>>
{
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
        if (this.props.projectRequest.error)
        {
            return <div>Couldn't load upload token: {this.props.projectRequest.error}</div>;
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
                        disabled={this.props.projectRequest.loading}>
                    Regenerate token
                </Button>
            </>
        );
    }
    renderUploadToken = (): JSX.Element =>
    {
        if (this.props.projectRequest.loading)
        {
            return <div>Loading...</div>;
        }

        return (
            <>
                <Badge color='info'>
                    {this.props.project.uploadToken}
                </Badge>
                <CopyToClipboard text={this.props.project.uploadToken}
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
                        We provide a simple Python library located at <code>client/swclient</code> that
                        simplifies measurement uploads and project/user management.<br />
                        You can use the following snippet as an example how to use it to upload measurements.<br />
                        Additional details can be found in the
                        {' '}<a href='https://snailwatch.readthedocs.io/' target='_blank'>documentation</a>.
                    </div>
                    <SyntaxHighlighter language='python' style={dracula}>
{`from swclient.client import Client

client = Client(
    "${API_SERVER}", # server address
    "${this.getUploadToken()}" # upload token
)

client.upload_measurement(
    "MyAwesomeBenchmark",   # benchmark name
    {                       # environment of the measurement
        "commit": "abcdef",
        "branch": "master",
        "threads": "16"
    },
    {                       # measured results
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
        if (this.props.project && this.props.project.uploadToken)
        {
            return this.props.project.uploadToken;
        }
        return '<upload-token>';
    }

    regenerateUploadToken = () =>
    {
        this.props.regenerateUploadToken({
            project: this.props.project.id
        });
    }
}

export const ProjectOverview = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    projectRequest: state.session.project.projectRequest,
}), {
    regenerateUploadToken: regenerateUploadToken.started,
    changeProject: ProjectActions.update.started
})(ProjectOverviewComponent));
