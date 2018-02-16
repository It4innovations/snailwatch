import React, {PureComponent} from 'react';
import {Measurement} from '../../../../lib/measurement/measurement';
import {Project} from '../../../../lib/project/project';
import {User} from '../../../../lib/user/user';
import {Filter} from '../../../../lib/view/filter';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {View} from '../../../../lib/view/view';
import {getUser} from '../../../../state/user/reducer';
import {getSelectedProject} from '../../../../state/project/reducer';
import {AppState} from '../../../../state/app/reducers';
import {getMeasurements} from '../../../../state/measurement/reducer';
import {getSelectedView, getViews} from '../../../../state/view/reducer';
import {ViewManager} from './view-manager';
import {
    createView as createViewActino, CreateViewParams, deleteView, DeleteViewParams, loadViews, LoadViewsParams,
    selectView, updateView, UpdateViewParams
} from '../../../../state/view/actions';
import {Request} from '../../../../util/request';
import {LoadMeasurementParams, loadMeasurements} from '../../../../state/measurement/actions';

interface StateProps
{
    user: User;
    project: Project;
    measurements: Measurement[];
    views: View[];
    selectedView: View;
    viewRequest: Request;
}

interface DispatchProps
{
    selectView(id: string): void;
    createView(params: CreateViewParams): void;
    deleteView(params: DeleteViewParams): void;
    updateView(params: UpdateViewParams): void;
    loadViews(params: LoadViewsParams): void;
    loadMeasurements(params: LoadMeasurementParams): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

class ViewContainerComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                <ViewManager
                    views={this.props.views}
                    viewRequest={this.props.viewRequest}
                    measurements={this.props.measurements}
                    selectedView={this.props.selectedView}
                    loadViews={this.loadViews}
                    selectView={this.selectView}
                    createView={this.createView}
                    updateView={this.updateView}
                    deleteView={this.deleteView}
                    loadMeasurements={this.loadMeasurements} />
            </div>
        );
    }

    loadMeasurements = (filters: Filter[]) =>
    {
        this.props.loadMeasurements({
            user: this.props.user,
            project: this.props.project,
            filters,
            reload: true
        });
    }
    loadViews = () =>
    {
        this.props.loadViews({
            user: this.props.user,
            project: this.props.project
        });
    }
    createView = (view: View) =>
    {
        this.props.createView({
            user: this.props.user,
            project: this.props.project,
            view
        });
    }
    updateView = (view: View) =>
    {
        this.props.updateView({
            user: this.props.user,
            view
        });
    }
    deleteView = (view: View) =>
    {
        this.props.deleteView({
            user: this.props.user,
            view
        });
    }
    selectView = (view: View) =>
    {
        this.props.selectView(view.id);
    }
}

export const ViewContainer = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    measurements: getMeasurements(state),
    views: getViews(state),
    selectedView: getSelectedView(state),
    viewRequest: state.view.viewRequest
}), {
    selectView,
    loadViews: loadViews.started,
    loadMeasurements: loadMeasurements.started,
    createView: createViewActino.started,
    updateView: updateView.started,
    deleteView: deleteView.started
})(ViewContainerComponent));
