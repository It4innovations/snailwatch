import {without} from 'ramda';
import React, {PureComponent} from 'react';
import styled from 'styled-components';
import {formatKey, getResultKeys} from '../../../util/measurement';

interface Props
{
    keys: string[];
    values: string[];
    requireSelection?: boolean;
    onChange(keys: string[]): void;
}

const RowLabel = styled.div`
  display: flex;
  align-items: center;
  padding-left: 0;
  
  input {
    margin-right: 5px;
  }
`;

export class ResultKeysMultiselect extends PureComponent<Props>
{
    componentDidMount()
    {
        const keys = getResultKeys(this.props.keys);
        if (this.props.values.length === 0 && keys.length > 0 && this.props.requireSelection)
        {
            this.props.onChange([keys[0]]);
        }
    }

    render()
    {
        const keys = getResultKeys(this.props.keys);
        if (keys.length === 0) return <div>No result keys available, upload some measurements</div>;

        const disableChecked = this.props.values.length === 1;

        return (
            <div>
                {keys.map(key => {
                    const checked = this.props.values.indexOf(key) !== -1;
                    return (
                        <RowLabel key={key}>
                            <input type='radio'
                                   value={key}
                                   checked={false}
                                   onChange={this.selectSingle} />
                            <input type='checkbox'
                                   value={key}
                                   checked={checked}
                                   disabled={checked && disableChecked}
                                   onChange={this.handleChange} />
                            {' '}{formatKey(key)}
                        </RowLabel>
                    );
                })}
            </div>
        );
    }

    selectSingle = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        this.props.onChange([e.currentTarget.value]);
    }
    handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        const value = e.currentTarget.value;
        let values = [...this.props.values];
        const checked = e.currentTarget.checked;
        if (checked)
        {
            values.push(value);
        }
        else values = without([value], values);

        this.props.onChange(values);
    }
}
