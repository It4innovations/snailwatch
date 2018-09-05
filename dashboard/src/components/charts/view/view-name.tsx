import React, {PureComponent} from 'react';
import MdCheck from 'react-icons/lib/md/check';
import MdEdit from 'react-icons/lib/md/edit';
import styled from 'styled-components';
import {EditableText} from '../../global/editable-text';

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
    width: 250px;
    font-size: 20px;
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
            return (
                <div title='Confirm'>
                    <MdCheck onClick={this.commit} size={26} />
                </div>
            );
        }
        else return (
            <div title='Edit'>
                <MdEdit onClick={this.startEdit} />
            </div>
        );
    }

    onChange = (value: string) =>
    {
        this.setState({ value });
    }
    startEdit = () =>
    {
        this.setState((state, props) => ({
            editing: true,
            value: props.value
        }));
    }
    commit = () =>
    {
        this.setState({ editing: false });
        this.props.onChange(this.state.value);
    }
}
