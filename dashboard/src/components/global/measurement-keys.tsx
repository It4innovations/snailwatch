import React, {PureComponent} from 'react';
import {Input} from 'reactstrap';
import {groupBy} from 'ramda';
import {formatKey} from '../../util/measurement';

interface Props
{
    keys: string[];
    value: string;
    onChange(key: string): void;
}

interface Group
{
    title: string;
    keys: {
        value: string;
        label: string;
    }[];
}

export class MeasurementKeys extends PureComponent<Props>
{
    render()
    {
        const groups = this.createGroups(this.props.keys);
        return (
            <Input type='select'
                   bsSize='sm'
                   value={this.props.value}
                   onChange={this.handleChange}>
                <option key='' value='' />
                {groups.map(group =>
                    <optgroup key={group.title} label={group.title}>
                        {group.keys.map(key =>
                            <option key={key.value} value={key.value}>{key.label}</option>
                        )}
                    </optgroup>
                )}
            </Input>
        );
    }

    handleChange = (e: React.SyntheticEvent<HTMLInputElement>) =>
    {
        this.props.onChange(e.currentTarget.value);
    }

    createGroups = (keys: string[]): Group[] =>
    {
        const filtered = keys.filter(key => !key.match(/^result\..*type$/));
        const groups = groupBy(key => {
            if (key.startsWith('environment.')) return 'Environment';
            if (key.startsWith('result.')) return 'Result';
            return 'Metadata';
        }, filtered);

        return ['Metadata', 'Environment', 'Result'].map(heading => ({
            title: heading,
            keys: (groups[heading] || []).map(value => ({
                value,
                label: formatKey(value)
            }))
        }));
    }
}
