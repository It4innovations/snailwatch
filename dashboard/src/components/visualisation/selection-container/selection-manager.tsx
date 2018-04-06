import React, {PureComponent} from 'react';
import {FilterList} from './filter/filter-list';
import {createSelection, Selection} from '../../../lib/measurement/selection/selection';
import {SelectionSelect} from './selection-select';
import {SelectionControls} from './selection-controls';
import {SelectionName} from './selection-name';
import {Filter} from '../../../lib/measurement/selection/filter';
import {Request} from '../../../util/request';
import {sort, equals} from 'ramda';
import {Measurement} from '../../../lib/measurement/measurement';
import {getAllKeysMerged} from '../../../util/object';

interface Props
{
    measurements: Measurement[];
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
    measurementKeys: string[];
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
            measurementKeys: []
        };
    }

    componentWillReceiveProps(props: Props)
    {
        if (this.state.createdNamePending !== null)
        {
            const selection = props.selections.find(s => s.name === this.state.createdNamePending);
            if (selection !== undefined)
            {
                this.setState(() => ({
                    editing: true,
                    selection: {...selection},
                    createdNamePending: null
                }));

                this.props.selectSelection(selection);
            }
        }

        if (this.props.measurements !== props.measurements)
        {
            this.setState(() => ({
                measurementKeys: this.calculateKeys(props.measurements)
            }));
        }
    }

    render()
    {
        const selection = this.getSelectedSelection();
        const selections = this.sortSelections(this.props.selections);

        return (
            <div>
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
                {this.props.selectionRequest.loading && <div>Loading...</div>}
                {this.props.selectionRequest.error && <div>{this.props.selectionRequest.error}</div>}
            </div>
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
                    <h2>Filters</h2>
                    <FilterList
                        filters={selection.filters}
                        measurementKeys={this.state.measurementKeys}
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
            editing: false
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
        this.props.updateSelection(this.state.selection);
        this.stopEdit();
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

    calculateKeys = (measurements: Measurement[]): string[] =>
    {
        return getAllKeysMerged(measurements, m => ({
            timestamp: '',
            benchmark: m.benchmark,
            environment: m.environment,
            result: m.result
        }));
    }
}
