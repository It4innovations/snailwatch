import React, {PureComponent} from 'react';
import {getResultKeys, formatKey} from '../../../util/measurement';
import {FormGroup, Input, Label} from 'reactstrap';
import {without} from 'ramda';

interface Props
{
    keys: string[];
    values: string[];
    onChange(keys: string[]): void;
}

export class ResultKeysMultiselect extends PureComponent<Props>
{
    componentDidMount()
    {
        const keys = getResultKeys(this.props.keys);
        if (this.props.values.length === 0 && keys.length > 0)
        {
            this.props.onChange([keys[0]]);
        }
    }

    render()
    {
        const keys = getResultKeys(this.props.keys);
        if (keys.length === 0) return <div>No result keys available, upload some measurements</div>;

        return (
            <div>
                {keys.map(key =>
                    <FormGroup check>
                    <Label check>
                        <Input type='checkbox'
                               bsSize='sm'
                               value={key}
                               onChange={this.handleChange} />
                        {' '}{formatKey(key)}
                    </Label>
                    </FormGroup>
                )}
            </div>
        );
    }

    handleChange = (e: React.SyntheticEvent<HTMLInputElement>) =>
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
