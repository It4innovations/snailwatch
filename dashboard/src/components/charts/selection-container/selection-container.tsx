import React, {PureComponent} from 'react';
import {Project} from '../../../lib/project/project';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {Selection} from '../../../lib/measurement/selection/selection';
import {getSelectedProject} from '../../../state/session/project/reducer';
import {AppState} from '../../../state/app/reducers';
import {getSelections} from '../../../state/session/selection/reducer';
import {SelectionManager} from './selection-manager';
import {SelectionActions} from '../../../state/session/selection/actions';
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
    project: Project;
    selections: Selection[];
    selectionRequest: Request;
}
interface DispatchProps
{
    createSelection(selection: Selection): void;
    deleteSelection(selection: Selection): void;
    updateSelection(selection: Selection): void;
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
        this.props.createSelection(selection);
    }
    updateSelection = (selection: Selection) =>
    {
        this.props.updateSelection(selection);
    }
    deleteSelection = (selection: Selection) =>
    {
        this.props.deleteSelection(selection);
    }
}

export const SelectionContainer = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    selections: getSelections(state),
    selectionRequest: state.session.selection.selectionRequest
}), {
    createSelection: SelectionActions.create.started,
    updateSelection: SelectionActions.update.started,
    deleteSelection: SelectionActions.delete.started
})(SelectionContainerComponent));
