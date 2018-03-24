import React, {PureComponent} from 'react';
import {Measurement} from '../../../lib/measurement/measurement';
import {Project} from '../../../lib/project/project';
import {User} from '../../../lib/user/user';
import {Filter} from '../../../lib/view/filter';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {Selection} from '../../../lib/view/view';
import {getUser} from '../../../state/user/reducer';
import {getSelectedProject} from '../../../state/project/reducer';
import {AppState} from '../../../state/app/reducers';
import {getMeasurements} from '../../../state/measurement/reducer';
import {getSelectedView, getSelections} from '../../../state/selection/reducer';
import {ViewManager} from './view-manager';
import {
    createSelectionAction as createViewActino, CreateSelectionParams, deleteSelectionAction, DeleteSelectionParams, loadSelectionsAction, LoadSelectionsParams,
    selectView, updateSelectionAction, UpdateSelectionParams
} from '../../../state/selection/actions';
import {Request} from '../../../util/request';
import {
    createLoadMeasurementParams, LoadMeasurementParams,
    loadMeasurements
} from '../../../state/measurement/actions';

interface StateProps
{
    user: User;
    project: Project;
    measurements: Measurement[];
    views: Selection[];
    selectedView: Selection;
    viewRequest: Request;
}

interface DispatchProps
{
    selectView(id: string): void;
    createView(params: CreateSelectionParams): void;
    deleteView(params: DeleteSelectionParams): void;
    updateView(params: UpdateSelectionParams): void;
    loadViews(params: LoadSelectionsParams): void;
    loadMeasurements(params: LoadMeasurementParams): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

class ViewContainerComponent extends PureComponent<Props>
{
    render()
    {
        return <ViewManager
                views={this.props.views}
                viewRequest={this.props.viewRequest}
                measurements={this.props.measurements}
                selectedView={this.props.selectedView}
                loadViews={this.loadViews}
                selectView={this.selectView}
                createView={this.createView}
                updateView={this.updateView}
                deleteView={this.deleteView}
                loadMeasurements={this.loadMeasurements} />;
    }

    loadMeasurements = (filters: Filter[]) =>
    {
        this.props.loadMeasurements(createLoadMeasurementParams({
            user: this.props.user,
            project: this.props.project,
            filters
        }));
    }
    loadViews = () =>
    {
        this.props.loadViews({
            user: this.props.user,
            project: this.props.project
        });
    }
    createView = (view: Selection) =>
    {
        this.props.createView({
            user: this.props.user,
            project: this.props.project,
            view
        });
    }
    updateView = (view: Selection) =>
    {
        this.props.updateView({
            user: this.props.user,
            view
        });
    }
    deleteView = (view: Selection) =>
    {
        this.props.deleteView({
            user: this.props.user,
            view
        });
    }
    selectView = (view: Selection) =>
    {
        this.props.selectView(view.id);
    }
}

export const ViewContainer = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    measurements: getMeasurements(state),
    views: getSelections(state),
    selectedView: getSelectedView(state),
    viewRequest: state.selection.selectionRequest
}), {
    selectView,
    loadViews: loadSelectionsAction.started,
    loadMeasurements: loadMeasurements.started,
    createView: createViewActino.started,
    updateView: updateSelectionAction.started,
    deleteView: deleteSelectionAction.started
})(ViewContainerComponent));
