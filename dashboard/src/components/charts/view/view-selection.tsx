import {sort} from 'ramda';
import React, {ChangeEvent, PureComponent} from 'react';
import MdEdit from 'react-icons/lib/md/edit';
import {connect} from 'react-redux';
import {Button, Input} from 'reactstrap';
import styled from 'styled-components';
import {Project} from '../../../lib/project/project';
import {RangeFilter} from '../../../lib/view/range-filter';
import {createView, View} from '../../../lib/view/view';
import {AppState} from '../../../state/app/reducers';
import {updateSelectedViewsAction} from '../../../state/session/pages/chart-page/actions';
import {getChartState} from '../../../state/session/pages/chart-page/reducer';
import {getRangeFilter} from '../../../state/session/pages/reducers';
import {getSelectedProject} from '../../../state/session/project/reducers';
import {ViewActions} from '../../../state/session/view/actions';
import {getViews, getViewsState} from '../../../state/session/view/reducers';
import {toggle} from '../../../util/array';
import {getResultKeys} from '../../../util/measurement';
import {Request} from '../../../util/request';

interface OwnProps
{
    onEditView(view: View): void;
}
interface StateProps
{
    views: View[];
    project: Project;
    viewRequest: Request;
    rangeFilter: RangeFilter;
    selectedViews: string[];
}
interface DispatchProps
{
    createView(view: View): void;
    updateView(view: View): void;
    deleteView(view: View): void;
    updateSelectedViews(views: string[]): void;
}

type Props = OwnProps & StateProps & DispatchProps;

const initialState =
{
    viewQuery: ''
};

type State = Readonly<typeof initialState>;

const Row = styled.div`
  display: flex;
  align-items: center;
`;
const ViewList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;
const EmptyViewList = styled.div`
  font-size: 0.8rem;
`;
const View = Row.extend`
  display: flex;
  input {
    margin-right: 5px;
  }
`;
const CreateButton = styled(Button)`
  margin-top: 5px;
`;
const NameWrapper = Row.extend`
  width: 100%;
  justify-content: space-between;
  cursor: pointer;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
  }
`;

class ViewSelectionComponent extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    render()
    {
        return (
            <div>
                <Input value={this.state.viewQuery}
                       onChange={this.changeViewQuery}
                       bsSize='sm'
                       placeholder='Use regex to filter views' />
                {this.renderViews(this.props.views, this.props.selectedViews)}
                <CreateButton size='sm' color='success' onClick={this.createView}>Create view</CreateButton>
            </div>
        );
    }
    renderViews = (views: View[], selectedViews: string[]): JSX.Element =>
    {
        const query = this.state.viewQuery.trim();
        const regex = new RegExp(query, 'i');
        const filtered = sort((a, b) => a.name.localeCompare(b.name), views.filter(v => regex.test(v.name)));

        if (views.length === 0)
        {
            return <div>There are no views available, create a new one.</div>;
        }
        if (filtered.length === 0)
        {
            return <EmptyViewList>No views containing '{query}' found.</EmptyViewList>;
        }

        return (
            <ViewList>
                {filtered.map(v =>
                    <View key={v.id}>
                        <input type='radio'
                               checked={false}
                               onChange={() => this.selectView(v)} />
                        <input type='checkbox'
                               checked={selectedViews.indexOf(v.id) !== -1}
                               onChange={() => this.toggleView(v)} />
                        <NameWrapper title='Edit view'
                                     onClick={() => this.props.onEditView(v)}>
                            <span>{v.name}</span>
                            <MdEdit />
                        </NameWrapper>
                    </View>
                )}
            </ViewList>
        );
    }

    toggleView = (view: View) =>
    {
        this.props.updateSelectedViews(toggle(this.props.selectedViews, view.id));
    }
    selectView = (view: View) =>
    {
        this.props.updateSelectedViews([view.id]);
    }
    changeViewQuery = (event: ChangeEvent<HTMLInputElement>) =>
    {
        const viewQuery = event.currentTarget.value;
        this.setState({ viewQuery });
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

export const ViewSelection = connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    views: getViews(state),
    viewRequest: getViewsState(state).viewRequest,
    project: getSelectedProject(state),
    rangeFilter: getRangeFilter(state),
    selectedViews: getChartState(state).selectedViews
}), {
    createView: ViewActions.create.started,
    updateView: ViewActions.update.started,
    deleteView: ViewActions.delete.started,
    updateSelectedViews: updateSelectedViewsAction
})(ViewSelectionComponent);
