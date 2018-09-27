import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import styled from 'styled-components';
import {AppState} from '../../state/app/reducers';
import {isProjectInitialized} from '../../state/session/project/reducers';
import {Loading} from '../global/loading';

interface StateProps
{
    initialized: boolean;
}

type Props = StateProps & RouteComponentProps<void>;

const LoadingWrapper = styled.div`
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export class ProjectGateComponent extends PureComponent<Props>
{
    render()
    {

        if (!this.props.initialized)
        {
            return (
                <LoadingWrapper>
                    <Loading width={48} height={48} />
                    <div>Loading project...</div>
                </LoadingWrapper>
            );
        }

        return <>{this.props.children}</>;
    }
}

export const ProjectGate = withRouter(connect<StateProps>((state: AppState) => ({
    initialized: isProjectInitialized(state)
}))(ProjectGateComponent));
