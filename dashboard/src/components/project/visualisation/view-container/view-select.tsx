import React, {PureComponent} from 'react';
import {View} from '../../../../lib/view/view';
import {find, sort} from 'ramda';

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
            <select value={this.props.selectedView === null ? '' : this.props.selectedView.id}
                    onChange={this.handleChange}>
                {this.props.views.map(view => <option key={view.id} value={view.id}>{view.name}</option>)}
            </select>
        );
    }

    handleChange = (e: React.FormEvent<HTMLSelectElement>) =>
    {
        this.props.onSelect(find(v => v.id === e.currentTarget.value, this.props.views) || null);
    }
}
