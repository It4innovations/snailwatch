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
    onSelectionChange?(selection: Selection): void;
    onSelect(selection: Selection): void;
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
                selectSelection={this.props.onSelect}
                createSelection={this.createSelection}
                updateSelection={this.updateSelection}
                deleteSelection={this.deleteSelection} />
        );
    }

    createSelection = (selection: Selection) =>
    {
        this.props.createSelection(selection);
        this.notifyChange(selection);
    }
    updateSelection = (selection: Selection) =>
    {
        this.props.updateSelection(selection);
        this.notifyChange(selection);
    }

    deleteSelection = (selection: Selection) =>
    {
        this.props.deleteSelection(selection);
        this.notifyChange(selection);
    }

    private notifyChange(selection: Selection)
    {
        if (this.props.onSelectionChange)
        {
            this.props.onSelectionChange(selection);
        }
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
