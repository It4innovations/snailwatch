import React, {PureComponent} from 'react';
import {Input} from 'reactstrap';
import {formatKey, getResultKeys} from '../../../util/measurement';

interface Props
{
    keys: string[];
    value: string;
    onChange(key: string): void;
}

export class ResultKeys extends PureComponent<Props>
{
    componentDidMount()
    {
        const keys = this.filterKeys(this.props.keys);
        const validSelection = this.isSelectionValid(this.props.value, keys);

        if (!validSelection && keys.length > 0 && keys[0] !== '')
        {
            this.props.onChange(keys[0]);
        }
    }

    render()
    {
        const keys = this.filterKeys(this.props.keys);
        if (keys.length === 0) return <div>No result keys available, upload some measurements</div>;

        return (
            <Input type='select'
                   bsSize='sm'
                   value={this.props.value}
                   onChange={this.handleChange}>
                {keys.map(k =>
                    <option key={k} value={k}>{formatKey(k)}</option>
                )}
            </Input>
        );
    }

    handleChange = (e: React.SyntheticEvent<HTMLInputElement>) =>
    {
        this.props.onChange(e.currentTarget.value);
    }

    filterKeys = (keys: string[]): string[] =>
    {
        return getResultKeys(keys);
    }

    isSelectionValid = (value: string, keys: string[]): boolean =>
    {
        return value !== '' && keys.indexOf(value) !== -1;
    }
}
