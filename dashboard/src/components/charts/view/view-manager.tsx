import React, {PureComponent} from 'react';
import MdAddBox from 'react-icons/lib/md/add-box';
import {connect} from 'react-redux';
import {Input} from 'reactstrap';
import styled from 'styled-components';
import {Selection} from '../../../lib/measurement/selection/selection';
import {Project} from '../../../lib/project/project';
import {createView, View} from '../../../lib/view/view';
import {AppState} from '../../../state/app/reducers';
import {getSelectedProject} from '../../../state/session/project/reducer';
import {getSelections} from '../../../state/session/selection/reducer';
import {ViewActions} from '../../../state/session/view/actions';
import {getViews, getViewsState} from '../../../state/session/view/reducer';
import {getResultKeys} from '../../../util/measurement';
import {Request} from '../../../util/request';
import {Box} from '../../global/box';
import {Loading} from '../../global/loading';
import {ViewComponent} from './view-component';

interface StateProps
{
    views: View[];
    selections: Selection[];
    project: Project;
    viewRequest: Request;
}
interface DispatchProps
{
    loadViews(): void;
    createView(view: View): void;
    updateView(view: View): void;
    deleteView(view: View): void;
}

type Props = StateProps & DispatchProps;

interface State
{
    selectedView: string | null;
}

const Row = styled.div`
    display: flex;
`;
const ViewWrapper = styled.div`
    margin-top: 10px;
`;

class ViewManagerComponent extends PureComponent<Props, State>
{
    readonly state: State = {
        selectedView: null
    };

    componentDidMount()
    {
        this.props.loadViews();
    }

    componentDidUpdate()
    {
        const {views} = this.props;
        const {selectedView} = this.state;
        const validSelection = selectedView !== null && this.props.views.find(v => v.id === selectedView) !== undefined;

        if (views.length === 0 && selectedView !== null)
        {
            this.setState(() => ({ selectedView: null }));
        }
        if (views.length > 0 && !validSelection)
        {
            this.setState(() => ({ selectedView: views[0].id }));
        }
    }

    render()
    {
        const selectedView = this.props.views.find(v => v.id === this.state.selectedView) || null;

        return (
            <Box title={this.renderTitle()} hideable={true}>
                <Row>
                    <Input type='select'
                           value={this.state.selectedView || ''}
                           onChange={this.changeSelectedView}>
                        {this.props.views.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </Input>
                    <div title='Add view'>
                        <MdAddBox size={38}
                                  onClick={this.createView}>Create view</MdAddBox>
                    </div>
                </Row>
                <ViewWrapper>
                    {selectedView &&
                    <ViewComponent
                        measurements={[]}
                        view={selectedView}
                        selections={this.props.selections}
                        measurementKeys={this.props.project.measurementKeys}
                        onChange={this.props.updateView}
                        onDelete={this.props.deleteView} />
                    }
                </ViewWrapper>
            </Box>
        );
    }
    renderTitle = (): JSX.Element =>
    {
        return (
            <Row>
                <div>View manager</div>
                <Loading show={this.props.viewRequest.loading} />
            </Row>
        );
    }

    changeSelectedView = (e: React.FormEvent<HTMLInputElement>) =>
    {
        const selectedView = e.currentTarget.value;
        this.setState(() => ({ selectedView }));
    }

    createView = () =>
    {
        const keys = getResultKeys(this.props.project.measurementKeys);
        const yAxes = keys.length === 0 ? [] : [keys[0]];

        const view = createView({
            name: `View #${this.props.views.length + 1}`,
            yAxes
        });

        this.props.createView(view);
    }
}

export const ViewManager = connect<StateProps, DispatchProps>((state: AppState) => ({
    views: getViews(state),
    viewRequest: getViewsState(state).viewRequest,
    project: getSelectedProject(state),
    selections: getSelections(state)
}), {
    loadViews: ViewActions.load.started,
    createView: ViewActions.create.started,
    updateView: ViewActions.update.started,
    deleteView: ViewActions.delete.started
})(ViewManagerComponent);
