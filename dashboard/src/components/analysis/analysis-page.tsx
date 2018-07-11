import React, {PureComponent} from 'react';
import {Button} from 'reactstrap';
import {RouteComponentProps, withRouter} from 'react-router';
import {AppState} from '../../state/app/reducers';
import {connect} from 'react-redux';
import {getAnalyses} from '../../state/session/analysis/reducer';
import {Analysis} from '../../lib/analysis/analysis';

interface StateProps
{
    analyses: Analysis[];
}

interface DispatchProps
{

}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const initialState = {
    showCreateAnalysis: false
};

type State = Readonly<typeof initialState>;

export class AnalysisPageComponent extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    render()
    {
        return (
            <div>
                <Button onClick={this.showCreateAnalysis} color='success'>Create analysis</Button>
            </div>
        );
    }

    showCreateAnalysis = () =>
    {
        this.setState(() => ({ showCreateAnalysis: true }));
    }
}

export const AnalysisPage = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    analyses: getAnalyses(state)
}), {

})(AnalysisPageComponent));
