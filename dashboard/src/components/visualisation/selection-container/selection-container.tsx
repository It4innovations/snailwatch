import React, {PureComponent} from 'react';
import {Project} from '../../../lib/project/project';
import {User} from '../../../lib/user/user';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {Selection} from '../../../lib/measurement/selection/selection';
import {getUser} from '../../../state/user/reducer';
import {getSelectedProject} from '../../../state/project/reducer';
import {AppState} from '../../../state/app/reducers';
import {getSelections} from '../../../state/selection/reducer';
import {SelectionManager} from './selection-manager';
import {
    createSelectionAction, CreateSelectionParams, deleteSelectionAction, DeleteSelectionParams,
    updateSelectionAction, UpdateSelectionParams
} from '../../../state/selection/actions';
import {Request} from '../../../util/request';
import {Measurement} from '../../../lib/measurement/measurement';

interface OwnProps
{
    measurements: Measurement[];
    selectedSelection: Selection | null;
    selectSelection(selection: Selection): void;
}
interface StateProps
{
    user: User;
    project: Project;
    selections: Selection[];
    selectionRequest: Request;
}
interface DispatchProps
{
    createSelection(params: CreateSelectionParams): void;
    deleteSelection(params: DeleteSelectionParams): void;
    updateSelection(params: UpdateSelectionParams): void;
}

type Props = StateProps & DispatchProps & OwnProps & RouteComponentProps<void>;

class SelectionContainerComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <SelectionManager
                measurements={this.props.measurements}
                measurementKeys={this.props.project.measurementKeys}
                selections={this.props.selections}
                selectionRequest={this.props.selectionRequest}
                selectedSelection={this.props.selectedSelection}
                selectSelection={this.props.selectSelection}
                createSelection={this.createSelection}
                updateSelection={this.updateSelection}
                deleteSelection={this.deleteSelection} />
        );
    }

    createSelection = (selection: Selection) =>
    {
        this.props.createSelection({
            user: this.props.user,
            project: this.props.project,
            selection
        });
    }
    updateSelection = (selection: Selection) =>
    {
        this.props.updateSelection({
            user: this.props.user,
            selection
        });
    }
    deleteSelection = (selection: Selection) =>
    {
        this.props.deleteSelection({
            user: this.props.user,
            selection
        });
    }
}

export const SelectionContainer = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    selections: getSelections(state),
    selectionRequest: state.selection.selectionRequest
}), {
    createSelection: createSelectionAction.started,
    updateSelection: updateSelectionAction.started,
    deleteSelection: deleteSelectionAction.started
})(SelectionContainerComponent));
