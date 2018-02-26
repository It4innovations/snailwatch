import React, {PureComponent} from 'react';
import {View} from '../../../../lib/view/view';
import {find} from 'ramda';
import Input from 'reactstrap/lib/Input';

interface Props
{
    views: View[];
    selectedView: View;
    onSelect(view: View): void;
}

export class ViewSelect extends PureComponent<Props>
{
    render()
    {
        return (
            <Input type='select'
                   value={this.props.selectedView === null ? '' : this.props.selectedView.id}
                   onChange={this.handleChange}>
                {this.props.views.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
            </Input>
        );
    }

    handleChange = (e: React.FormEvent<HTMLInputElement>) =>
    {
        this.props.onSelect(find(v => v.id === e.currentTarget.value, this.props.views) || null);
    }
}
