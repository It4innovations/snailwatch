import React, {PureComponent} from 'react';
import {Selection} from '../../../lib/measurement/selection/selection';
import Input from 'reactstrap/lib/Input';
import InputGroup from 'reactstrap/lib/InputGroup';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';
import styled from 'styled-components';

interface Props
{
    selection: Selection;
    editable: boolean;
    onChange(name: string): void;
}

const Wrapper = styled(InputGroup)`
  margin-top: 5px;
`;

export class SelectionName extends PureComponent<Props>
{
    render()
    {
        return (
            <Wrapper size='sm'>
                <InputGroupAddon addonType='prepend'>Name</InputGroupAddon>
                {this.renderName()}
            </Wrapper>
        );
    }

    renderName = (): JSX.Element =>
    {
        return <Input bsSize='sm'
                      type='text'
                      required={true}
                      value={this.props.selection.name}
                      onChange={this.handleChange}
                      disabled={!this.props.editable} />;
    }

    handleChange = (e: React.FormEvent<HTMLInputElement>) =>
    {
        this.props.onChange(e.currentTarget.value);
    }
}
