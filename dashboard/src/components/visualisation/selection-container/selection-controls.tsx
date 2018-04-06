import React, {PureComponent} from 'react';
import {Button, ButtonGroup} from 'reactstrap';

interface Props
{
    editing: boolean;
    selected: boolean;
    dirty: boolean;
    onStartEdit(): void;
    onCancelEdit(): void;
    onCreate(): void;
    onCopy(): void;
    onDelete(): void;
    onSave(): void;
}

export class SelectionControls extends PureComponent<Props>
{
    render()
    {
        return (
            <ButtonGroup>
                {this.renderEditButton()}
                {this.renderEditCancelButton()}
                {this.renderCreateButton()}
                {this.renderCopyButton()}
                {this.renderDeleteButton()}
            </ButtonGroup>
        );
    }

    renderEditButton = (): JSX.Element =>
    {
        if (!this.props.selected)
        {
            return null;
        }

        const label = this.props.editing ? 'Save' : 'Edit';
        const callback = this.props.editing ? this.props.onSave : this.props.onStartEdit;
        const disabled = this.props.editing && !this.props.dirty;

        return (
            <Button key='edit'
                    color='primary'
                    disabled={disabled}
                    onClick={callback}>{label}</Button>
        );
    }
    renderEditCancelButton = (): JSX.Element =>
    {
        if (!this.props.editing)
        {
            return null;
        }

        return (
            <Button key='edit-cancel'
                    color='secondary'
                    onClick={this.props.onCancelEdit}>Cancel</Button>
        );
    }
    renderCreateButton = (): JSX.Element =>
    {
        if (this.props.editing)
        {
            return null;
        }

        return (
            <Button key='create'
                    color='success'
                    onClick={this.props.onCreate}>Create</Button>
        );
    }
    renderCopyButton = (): JSX.Element =>
    {
        if (!this.props.selected || this.props.editing)
        {
            return null;
        }

        return (
            <Button key='copy'
                    color='info'
                    onClick={this.props.onCopy}>Copy</Button>
        );
    }
    renderDeleteButton = (): JSX.Element =>
    {
        if (!this.props.selected || this.props.editing)
        {
            return null;
        }

        return (
            <Button key='delete'
                    color='danger'
                    onClick={this.props.onDelete}>Delete</Button>
        );
    }
}
