import React, {PureComponent} from 'react';
import {Button} from 'reactstrap';
import {RouteComponentProps, withRouter} from 'react-router';
import {AppState} from '../../state/app/reducers';
import {connect} from 'react-redux';
import {getAnalyses} from '../../state/session/analysis/reducer';
import {Analysis, createAnalysis} from '../../lib/analysis/analysis';
import {AnalysisView} from './analysis-view';
import {AnalysisActions} from '../../state/session/analysis/actions';
import {RequestView} from '../global/request-view';
import {Request} from '../../util/request';
import styled from 'styled-components';
import {sort} from 'ramda';
import {compareDate} from '../../util/date';

interface StateProps
{
    analyses: Analysis[];
    analysisRequest: Request;
}

interface DispatchProps
{
    loadAnalyses(): void;
    createAnalysis(analysis: Analysis): void;
    updateAnalysis(analysis: Analysis): void;
    deleteAnalysis(analysis: Analysis): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const initialState = {
    showCreateAnalysis: false
};

type State = Readonly<typeof initialState>;

const Wrapper = styled.div`
  width: 600px;
`;

export class AnalysisPageComponent extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    componentDidMount()
    {
        this.props.loadAnalyses();
    }

    render()
    {
        const analysesByDate = sort((a, b) => compareDate(a.created, b.created), this.props.analyses);
        return (
            <Wrapper>
                {analysesByDate.map(analysis =>
                    <AnalysisView key={analysis.id}
                                  analysis={analysis}
                                  onChange={this.props.updateAnalysis}
                                  onDelete={this.props.deleteAnalysis} />)}
                <Button onClick={this.createAnalysis} color='success'>Create analysis</Button>
                <RequestView request={this.props.analysisRequest} />
            </Wrapper>
        );
    }

    createAnalysis = () =>
    {
        this.props.createAnalysis(createAnalysis({
            name: `Analysis #${this.props.analyses.length + 1}`
        }));
    }
}

export const AnalysisPage = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    analyses: getAnalyses(state),
    analysisRequest: state.session.analysis.analysisRequest
}), {
    loadAnalyses: AnalysisActions.load.started,
    createAnalysis: AnalysisActions.create.started,
    updateAnalysis: AnalysisActions.update.started,
    deleteAnalysis: AnalysisActions.delete.started
})(AnalysisPageComponent));
