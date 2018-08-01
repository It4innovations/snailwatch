import React, {PureComponent} from 'react';
import MdCheck from 'react-icons/lib/md/check';
import MdEdit from 'react-icons/lib/md/edit';
import {EditableText} from '../../global/editable-text';
import styled from 'styled-components';

interface Props
{
    value: string;
    onChange(value: string): void;
}

const initialState = {
    editing: false,
    value: ''
};

type State = Readonly<typeof initialState>;

const Row = styled.div`
    display: flex;
    align-items: center;
`;

export class ViewName extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    render()
    {
        const value = this.state.editing ? this.state.value : this.props.value;
        return (
            <Row>
                <EditableText editing={this.state.editing}
                              value={value}
                              onChange={this.onChange} />
                {this.renderIcon()}
            </Row>
        );
    }
    renderIcon = () =>
    {
        if (this.state.editing)
        {
            return <MdCheck onClick={this.commit} />;
        }
        else return <MdEdit onClick={this.startEdit} />;
    }

    onChange = (value: string) =>
    {
        this.setState(() => ({ value }));
    }
    startEdit = () =>
    {
        this.setState(() => ({
            editing: true,
            value: this.props.value
        }));
    }
    commit = () =>
    {
        this.setState(() => ({
            editing: false
        }));
        this.props.onChange(this.state.value);
    }
}
