import {find} from 'ramda';
import React, {PureComponent} from 'react';
import Input from 'reactstrap/lib/Input';
import {Selection} from '../../../lib/measurement/selection/selection';

interface Props
{
    selections: Selection[];
    selection: Selection;
    onSelect(view: Selection): void;
}

export class SelectionSelect extends PureComponent<Props>
{
    render()
    {
        return (
            <Input type='select'
                   bsSize='sm'
                   value={this.props.selection === null ? '' : this.props.selection.id}
                   onChange={this.handleChange}>
                <option key='' value=''>(all measurements)</option>
                {this.props.selections.map(selection =>
                    <option key={selection.id} value={selection.id}>{selection.name}</option>
                )}
            </Input>
        );
    }

    handleChange = (e: React.FormEvent<HTMLInputElement>) =>
    {
        this.props.onSelect(find(v => v.id === e.currentTarget.value, this.props.selections) || null);
    }
}
