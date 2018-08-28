import React, {PureComponent} from 'react';
import {Measurement} from '../../../lib/measurement/measurement';
import {Selection} from '../../../lib/measurement/selection/selection';
import {Switch} from '../../global/switch';
import {SelectionContainer} from './selection-container';
import {SelectionSelect} from './selection-select';

interface Props
{
    selections: Selection[];
    selection: Selection | null;
    measurements: Measurement[];
    onSelectSelection(selection: Selection | null): void;
}

const initialState = {
    editing: false
};

type State = Readonly<typeof initialState>;

export class SelectionSelectEditor extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    render()
    {
        return (
            <Switch
                useFirst={!this.state.editing}
                firstLabel='Select'
                secondLabel='Edit'
                firstComponent={
                    <SelectionSelect
                        selections={this.props.selections}
                        selection={this.props.selection}
                        onSelect={this.props.onSelectSelection} />
                }
                secondComponent={
                    <SelectionContainer
                        measurements={this.props.measurements}
                        selectedSelection={this.props.selection}
                        onSelect={this.props.onSelectSelection} />
                }
                onChange={this.changeSelectionsEditing} />
        );
    }

    changeSelectionsEditing = (showSelect: boolean) =>
    {
        this.setState(() => ({ editing: !showSelect }));
    }
}