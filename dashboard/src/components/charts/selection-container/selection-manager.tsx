import {equals, sort} from 'ramda';
import React, {PureComponent} from 'react';
import {Measurement} from '../../../lib/measurement/measurement';
import {Filter} from '../../../lib/measurement/selection/filter';
import {createSelection, Selection} from '../../../lib/measurement/selection/selection';
import {Request} from '../../../util/request';
import {isBlank} from '../../../util/string';
import {ErrorBox} from '../../global/error-box';
import {Loading} from '../../global/loading';
import {FilterList} from './filter/filter-list';
import {SelectionControls} from './selection-controls';
import {SelectionName} from './selection-name';
import {SelectionSelect} from './selection-select';

interface Props
{
    measurements: Measurement[];
    measurementKeys: string[];
    selections: Selection[];
    selectionRequest: Request;
    selectedSelection: Selection;
    selectSelection(selection: Selection): void;
    createSelection(selection: Selection): void;
    updateSelection(selection: Selection): void;
    deleteSelection(selection: Selection): void;
}

interface State
{
    editing: boolean;
    createdNamePending: string;
    selection: Selection;
    selectionError: string;
}

export class SelectionManager extends PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.state = {
            editing: false,
            selection: createSelection(),
            createdNamePending: null,
            selectionError: ''
        };
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State>
    {
        if (prevState.createdNamePending !== null)
        {
            const selection = nextProps.selections.find(s => s.name === prevState.createdNamePending);
            if (selection !== undefined)
            {
                return {
                    editing: true,
                    selection: {...selection},
                    createdNamePending: null
                };
            }
        }
        return null;
    }

    componentDidUpdate(oldProps: Props, prevState: State)
    {
        if (prevState.createdNamePending !== null && this.state.createdNamePending === null)
        {
            this.props.selectSelection(this.state.selection);
        }
    }

    render()
    {
        const selection = this.getSelectedSelection();
        const selections = this.sortSelections(this.props.selections);

        return (
            <>
                <SelectionSelect
                    selections={selections}
                    selection={this.props.selectedSelection}
                    onSelect={this.handleSelectionSelect} />
                {this.renderSelectionContent(selection)}
                <SelectionControls
                    editing={this.canEdit()}
                    selected={selection !== null}
                    dirty={!equals(this.props.selectedSelection, this.state.selection)}
                    onCreate={this.createSelection}
                    onCopy={this.copySelection}
                    onSave={this.updateSelection}
                    onDelete={this.deleteSelection}
                    onStartEdit={this.startEdit}
                    onCancelEdit={this.stopEdit} />
                <Loading show={this.props.selectionRequest.loading} />
                <ErrorBox error={this.props.selectionRequest.error} />
                <ErrorBox error={this.state.selectionError} />
            </>
        );
    }
    renderSelectionContent = (selection: Selection): JSX.Element =>
    {
        if (selection === null)
        {
            return <div>Create or choose a selection</div>;
        }

        return (
            <div>
                <SelectionName
                    selection={selection}
                    editable={this.canEdit()}
                    onChange={this.handleNameChange} />
                <div>
                    <h4>Filters</h4>
                    <FilterList
                        filters={selection.filters}
                        measurementKeys={this.props.measurementKeys}
                        measurements={this.props.measurements}
                        editable={this.canEdit()}
                        onChange={this.handleFilterChange} />
                </div>
            </div>
        );
    }

    getSelectedSelection = (): Selection =>
    {
        if (this.props.selectedSelection === null) return null;

        return this.state.editing ? this.state.selection : this.props.selectedSelection;
    }
    selectSelection = (selection: Selection) =>
    {
        this.props.selectSelection(selection);
    }
    startEdit = () =>
    {
        this.setState(() => ({
            editing: true,
            selection: {...this.props.selectedSelection}
        }));
    }
    stopEdit = () =>
    {
        this.setState(() => ({
            editing: false,
            selectionError: ''
        }));
    }

    createSelection = () =>
    {
        const name = this.generateName(this.props.selections);
        this.setState(() => ({
            createdNamePending: name
        }));
        this.props.createSelection(createSelection(null, name));
    }
    copySelection = () =>
    {
        const selection: Selection = {
            ...this.props.selectedSelection,
            id: null,
            name: `${this.props.selectedSelection.name} (copy)`
        };

        this.setState(() => ({
            createdNamePending: selection.name
        }));
        this.props.createSelection(selection);
    }
    deleteSelection = () =>
    {
        this.props.deleteSelection(this.props.selectedSelection);
        this.props.selectSelection(null);
        this.stopEdit();
    }
    updateSelection = () =>
    {
        try
        {
            this.checkSelection(this.state.selection);
            this.props.updateSelection(this.state.selection);
            this.stopEdit();
        }
        catch (e)
        {
            this.setState(() => ({
                selectionError: e.message
            }));
        }
    }

    handleNameChange = (name: string) =>
    {
        this.changeSelection({ name });
    }
    handleFilterChange = (filters: Filter[]) =>
    {
        this.changeSelection({ filters });
    }
    handleSelectionSelect = (selection: Selection) =>
    {
        this.stopEdit();
        this.selectSelection(selection);
    }
    changeSelection = (change: Partial<Selection>) =>
    {
        this.setState(state => ({
            selection: {...state.selection, ...change}
        }));
    }

    generateName = (selections: Selection[]): string =>
    {
        for (let i = 1; true; i++)
        {
            const name = `Selection ${i}`;
            if (selections.find(s => s.name === name) === undefined)
            {
                return name;
            }
        }
    }
    canEdit = () =>
    {
        return !this.props.selectionRequest.loading && this.state.editing;
    }

    sortSelections = (selections: Selection[]): Selection[] =>
    {
        return sort((a, b) => a.name.localeCompare(b.name), selections);
    }

    checkSelection = (selection: Selection) =>
    {
        if (isBlank(selection.name))
        {
            throw Error('You have to fill in selection name');
        }

        for (const filter of selection.filters)
        {
            if (isBlank(filter.path))
            {
                throw Error('You have to fill in filter path');
            }
        }
    }
}
