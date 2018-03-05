import React, {PureComponent} from 'react';
import {ViewProjection} from './projection/view-projection';
import {FilterList} from './filter/filter-list';
import {createView, View} from '../../../lib/view/view';
import {ViewSelect} from './view-select';
import {ViewControls} from './view-controls';
import {ViewName} from './view-name';
import {Filter} from '../../../lib/view/filter';
import {Projection} from '../../../lib/view/projection';
import {Request} from '../../../util/request';
import {sort, equals} from 'ramda';
import {Measurement} from '../../../lib/measurement/measurement';
import {getAllKeysMerged} from '../../../util/object';

interface Props
{
    views: View[];
    viewRequest: Request;
    selectedView: View;
    measurements: Measurement[];
    loadViews(): void;
    selectView(view: View): void;
    createView(view: View): void;
    updateView(view: View): void;
    deleteView(view: View): void;
    loadMeasurements(filters: Filter[]): void;
}

interface State
{
    editing: boolean;
    createdNamePending: string;
    view: View;
    measurementKeys: string[];
}

export class ViewManager extends PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.state = {
            editing: false,
            view: createView(),
            createdNamePending: null,
            measurementKeys: this.calculateKeys(props.measurements)
        };
    }

    componentDidMount()
    {
        this.props.loadViews();
    }

    componentWillReceiveProps(props: Props)
    {
        if (this.state.createdNamePending !== null)
        {
            const view = props.views.find(v => v.name === this.state.createdNamePending);
            if (view !== undefined)
            {
                this.setState(() => ({
                    editing: true,
                    view: {...view},
                    createdNamePending: null
                }));

                this.props.selectView(view);
            }
        }
        else if (props.views.length > 0 && props.selectedView === null)
        {
            const views = this.sortViews(props.views);
            this.selectView(views[0]);
        }

        if (props.measurements !== this.props.measurements)
        {
            this.setState(() => ({
                measurementKeys: this.calculateKeys(props.measurements)
            }));
        }
    }

    render()
    {
        const view = this.getSelectedView();
        const views = this.sortViews(this.props.views);

        return (
            <div>
                <ViewSelect
                    views={views}
                    selectedView={this.props.selectedView}
                    onSelect={this.handleViewSelect} />
                {this.renderViewContent(view)}
                <ViewControls
                    editing={this.canEdit()}
                    selected={view !== null}
                    dirty={!equals(this.props.selectedView, this.state.view)}
                    onCreate={this.createView}
                    onCopy={this.copyView}
                    onSave={this.updateView}
                    onDelete={this.deleteView}
                    onStartEdit={this.startEdit}
                    onCancelEdit={this.stopEdit} />
                {this.props.viewRequest.loading && <div>Loading...</div>}
                {this.props.viewRequest.error && <div>{this.props.viewRequest.error}</div>}
            </div>
        );
    }

    renderViewContent = (view: View): JSX.Element =>
    {
        if (view === null)
        {
            return <div>No view selected</div>;
        }

        return (
            <div>
                <ViewName
                    view={view}
                    editable={this.canEdit()}
                    onChange={this.handleNameChange} />
                <div>
                    <h2>Filters</h2>
                    <FilterList
                        filters={view.filters}
                        measurementKeys={this.state.measurementKeys}
                        measurements={this.props.measurements}
                        editable={this.canEdit()}
                        onChange={this.handleFilterChange} />
                </div>
                <div>
                    <h2>Projection</h2>
                    <ViewProjection
                        projection={view.projection}
                        measurementKeys={this.state.measurementKeys}
                        editable={this.canEdit()}
                        onChange={this.handleProjectionChange} />
                </div>
            </div>
        );
    }

    getSelectedView = (): View =>
    {
        if (this.props.selectedView === null) return null;

        return this.state.editing ? this.state.view : this.props.selectedView;
    }
    selectView = (view: View) =>
    {
        this.props.selectView(view);
        this.loadMeasurements(view);
    }
    startEdit = () =>
    {
        this.setState(() => ({
            editing: true,
            view: {...this.props.selectedView}
        }));
    }
    stopEdit = () =>
    {
        this.setState(() => ({
            editing: false
        }));
    }

    loadMeasurements = (view: View) =>
    {
        this.props.loadMeasurements(view.filters);
    }
    createView = () =>
    {
        const name = this.generateName(this.props.views);
        this.setState(() => ({
            createdNamePending: name
        }));
        this.props.createView(createView(null, name));
    }
    copyView = () =>
    {
        const view: View = {
            ...this.props.selectedView,
            id: null,
            name: `${this.props.selectedView.name} (copy)`
        };

        this.setState(() => ({
            createdNamePending: view.name
        }));
        this.props.createView(view);
    }
    deleteView = () =>
    {
        this.props.deleteView(this.props.selectedView);
        this.stopEdit();
    }
    updateView = () =>
    {
        this.props.updateView(this.state.view);
        this.stopEdit();
        this.loadMeasurements(this.state.view);
    }

    handleNameChange = (name: string) =>
    {
        this.changeView({ name });
    }
    handleFilterChange = (filters: Filter[]) =>
    {
        this.changeView({ filters });
    }
    handleProjectionChange = (projection: Projection) =>
    {
        this.changeView({ projection });
    }
    handleViewSelect = (view: View) =>
    {
        this.stopEdit();
        this.selectView(view);
    }
    changeView = (change: Partial<View>) =>
    {
        this.setState(state => ({
            view: {...state.view, ...change}
        }));
    }

    generateName = (views: View[]): string =>
    {
        for (let i = 1; true; i++)
        {
            const name = `View ${i}`;
            if (views.find(v => v.name === name) === undefined)
            {
                return name;
            }
        }
    }
    canEdit = () =>
    {
        return !this.props.viewRequest.loading && this.state.editing;
    }

    sortViews = (views: View[]): View[] =>
    {
        return sort((a, b) => a.name.localeCompare(b.name), views);
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