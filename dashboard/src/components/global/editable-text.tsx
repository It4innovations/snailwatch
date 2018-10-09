import React, {Component} from 'react';
import {InputType} from 'reactstrap/lib/Input';
import styled from 'styled-components';

interface Props
{
    value: string;
    className?: string;
    type?: InputType;
    activeColor?: string;
    validate(value: string): boolean;
    onChange(value: string): void;
}

const Text = styled.div<{activeColor: string}>`
  &:hover, &:focus {
    color: ${props => props.activeColor}
  }
`;

export class EditableText extends Component<Props>
{
    private text: React.RefObject<HTMLDivElement> = React.createRef();

    render()
    {
        return <Text innerRef={this.text}
                     activeColor={this.props.activeColor || '#000000'}
                     className={this.props.className}
                     contentEditable={true}
                     suppressContentEditableWarning={true}
                     onKeyPress={this.handleInput}
                     onBlur={this.handleBlur}>{this.props.value}</Text>;
    }

    handleInput = (e: React.KeyboardEvent<HTMLDivElement>) =>
    {
        if (e.key === 'Enter')
        {
            e.preventDefault();
            this.text.current.blur();
        }
    }
    handleBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    {
        const value = e.currentTarget.textContent;
        if (value === this.props.value) return;

        if (this.props.validate(value))
        {
            this.props.onChange(value);
        }
        else this.text.current.textContent = this.props.value;
    }
}
