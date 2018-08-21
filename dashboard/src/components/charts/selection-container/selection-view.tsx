import {equals} from 'ramda';
import React, {PureComponent} from 'react';
import MdCheck from 'react-icons/lib/md/check';
import MdEdit from 'react-icons/lib/md/edit';
import styled from 'styled-components';
import {Measurement} from '../../../lib/measurement/measurement';
import {Filter} from '../../../lib/measurement/selection/filter';
import {createSelection, Selection} from '../../../lib/measurement/selection/selection';
import {FilterList} from './filter/filter-list';

interface Props
{
    selection: Selection;
    measurements: Measurement[];
    measurementKeys: string[];
    onChange(selection: Selection): void;
}

const initialState = {
    editing: false,
    selection: createSelection(),
    selectionError: ''
};

type State = Readonly<typeof initialState>;

const Row = styled.div`
    display: flex;
    align-items: center;
`;

export class SelectionView extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    componentDidUpdate(prevProps: Props)
    {
        if (prevProps.selection !== this.props.selection && this.state.editing)
        {
            this.setState(() => ({
                selection: this.props.selection
            }));
        }
    }

    render()
    {
        const selection = this.getSelectedSelection();
        return (
            <div>
                <Row>Filters {this.renderEditButton()}</Row>
                <FilterList
                    filters={selection.filters}
                    measurementKeys={this.props.measurementKeys}
                    measurements={this.props.measurements}
                    editable={this.state.editing}
                    onChange={this.handleFilterChange} />
            </div>
        );
    }
    renderEditButton = (): JSX.Element =>
    {
        if (this.state.editing)
        {
            return (
                <div title='Save'>
                    <MdCheck onClick={this.commitSelection} />
                </div>
            );
        }
        else return (
            <div title='Edit'>
                <MdEdit onClick={this.startEdit} />
            </div>
        );
    }

    getSelectedSelection = (): Selection =>
    {
        return this.state.editing ? this.state.selection : this.props.selection;
    }

    startEdit = () =>
    {
        this.setState(() => ({
            editing: true,
            selection: {...this.props.selection}
        }));
    }
    stopEdit = () =>
    {
        this.setState(() => ({
            editing: false,
            selectionError: ''
        }));
    }

    commitSelection = () =>
    {
        const selection = this.cleanSelection(this.state.selection);
        if (!equals(selection, this.props.selection))
        {
            this.props.onChange(selection);
        }

        this.stopEdit();
    }

    cleanSelection = (selection: Selection): Selection =>
    {
        return {
            ...selection,
            filters: selection.filters.filter(f => f.path.trim() !== '')
        };
    }

    handleFilterChange = (filters: Filter[]) =>
    {
        this.changeSelection({ filters });
    }
    changeSelection = (change: Partial<Selection>) =>
    {
        this.setState(state => ({
            selection: {...state.selection, ...change}
        }));
    }
}
