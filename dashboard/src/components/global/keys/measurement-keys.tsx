import React, {PureComponent} from 'react';
import {Input} from 'reactstrap';
import {find, groupBy} from 'ramda';
import {formatKey} from '../../../util/measurement';

interface Props
{
    keys: string[];
    value: string;
    defaults?: string[];
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

const DEFAULTS = [
    'environment.commit',
    'timestamp'
];

export class MeasurementKeys extends PureComponent<Props>
{
    componentDidMount()
    {
        const defaults = this.props.defaults === undefined ? [...DEFAULTS] : this.props.defaults;
        if (this.props.value === '')
        {
            const def = this.findDefault(defaults, this.props.keys);
            if (def !== null && def !== '')
            {
                this.props.onChange(def);
            }
        }
    }

    render()
    {
        const groups = this.createGroups(this.props.keys);

        return (
            <Input type='select'
                   bsSize='sm'
                   value={this.props.value}
                   onChange={this.handleChange}>
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
        const filtered = keys.filter(key => !key.startsWith('result.'));
        const groups = groupBy(key => {
            if (key.startsWith('environment.')) return 'Environment';
            return 'General';
        }, filtered);

        return ['General', 'Environment'].map(heading => ({
            title: heading,
            keys: (groups[heading] || []).map(value => ({
                value,
                label: formatKey(value)
            }))
        }));
    }

    findDefault = (defaults: string[], keys: string[]): string | null =>
    {
        return find(d => keys.indexOf(d) !== -1, defaults) || null;
    }
}
