import {without} from 'ramda';
import React, {PureComponent} from 'react';
import {FormGroup, Input, Label} from 'reactstrap';
import {formatKey, getResultKeys} from '../../../util/measurement';

interface Props
{
    keys: string[];
    values: string[];
    requireSelection?: boolean;
    onChange(keys: string[]): void;
}

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
                        <FormGroup check key={key}>
                            <Label check>
                                <Input type='checkbox'
                                       value={key}
                                       checked={checked}
                                       disabled={checked && disableChecked}
                                       onChange={this.handleChange} />
                                {' '}{formatKey(key)}
                            </Label>
                        </FormGroup>
                    );
                })}
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
