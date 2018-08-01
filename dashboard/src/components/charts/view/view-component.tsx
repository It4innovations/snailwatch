import React, {PureComponent} from 'react';
import {View} from '../../../lib/view/view';
import {SelectionSelect} from '../selection-container/selection-select';
import {Selection} from '../../../lib/measurement/selection/selection';
import {getSelectionById} from '../../../state/session/selection/reducer';
import {ResultKeysMultiselect} from '../../global/keys/result-keys-multiselect';
import {ViewName} from './view-name';
import {Button} from 'reactstrap';

interface Props
{
    view: View;
    selections: Selection[];
    measurementKeys: string[];
    onChange(view: View): void;
    onDelete(view: View): void;
}

const initialState = {
    editing: false
};

type State = Readonly<typeof initialState>;

export class ViewComponent extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    render()
    {
        return (
            <div>
                <ViewName value={this.props.view.name}
                          onChange={this.changeName} />
                <SelectionSelect selections={this.props.selections}
                                 selection={getSelectionById(this.props.selections, this.props.view.selection)}
                                 onSelect={this.changeSelection} />
                <ResultKeysMultiselect keys={this.props.measurementKeys}
                                       values={this.props.view.yAxes}
                                       onChange={this.changeYAxes} />
                <Button onClick={this.deleteView}>Delete</Button>
            </div>
        );
    }

    changeName = (name: string) =>
    {
        this.props.onChange({ ...this.props.view, name });
    }
    changeSelection = (selection: Selection | null) =>
    {
        const id = selection === null ? null : selection.id;
        this.props.onChange({ ...this.props.view, selection: id });
    }
    changeYAxes = (yAxes: string[]) =>
    {
        this.props.onChange({ ...this.props.view, yAxes });
    }
    deleteView = () =>
    {
        this.props.onDelete(this.props.view);
    }
}
