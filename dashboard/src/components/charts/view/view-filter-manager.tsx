import {equals} from 'ramda';
import React, {PureComponent} from 'react';
import MdCheck from 'react-icons/lib/md/check';
import MdEdit from 'react-icons/lib/md/edit';
import styled from 'styled-components';
import {Measurement} from '../../../lib/measurement/measurement';
import {Filter} from '../../../lib/view/filter';
import {createView, View} from '../../../lib/view/view';
import {FilterList} from '../filter/filter-list';

interface Props
{
    view: View;
    measurements: Measurement[];
    measurementKeys: string[];
    onChange(view: View): void;
}

const initialState = {
    editing: false,
    view: createView(),
    viewError: ''
};

type State = Readonly<typeof initialState>;

const Row = styled.div`
    display: flex;
    align-items: center;
`;

export class ViewFilterManager extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    componentDidUpdate(prevProps: Props)
    {
        if (prevProps.view !== this.props.view && this.state.editing)
        {
            this.setState((state, props) => ({
                view: props.view
            }));
        }
    }

    render()
    {
        const view = this.getSelectedView();
        return (
            <div>
                <Row>Filters {this.renderEditButton()}</Row>
                <FilterList
                    filters={view.filters}
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

    getSelectedView = (): View =>
    {
        return this.state.editing ? this.state.view : this.props.view;
    }

    startEdit = () =>
    {
        this.setState((state, props) => ({
            editing: true,
            view: {...props.view}
        }));
    }
    stopEdit = () =>
    {
        this.setState({
            editing: false,
            viewError: ''
        });
    }

    commitSelection = () =>
    {
        const view = this.cleanView(this.state.view);
        if (!equals(view, this.props.view))
        {
            this.props.onChange(view);
        }

        this.stopEdit();
    }

    cleanView = (view: View): View =>
    {
        return {
            ...view,
            filters: view.filters.filter(f => f.path.trim() !== '')
        };
    }

    handleFilterChange = (filters: Filter[]) =>
    {
        this.changeView({ filters });
    }
    changeView = (change: Partial<View>) =>
    {
        this.setState(state => ({
            view: {...state.view, ...change}
        }));
    }
}
