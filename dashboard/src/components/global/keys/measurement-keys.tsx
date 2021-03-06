import {find, groupBy, sort} from 'ramda';
import React, {PureComponent} from 'react';
import {Input} from 'reactstrap';
import {Project} from '../../../lib/project/project';
import {formatKey} from '../../../util/measurement';

interface Props
{
    value: string;
    project: Project;
    defaults?: string[];
    className?: string;
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
    'environment.sha',
    'timestamp'
];

export class MeasurementKeys extends PureComponent<Props>
{
    componentDidMount()
    {
        const defaults = this.props.defaults === undefined ? this.generateDefaults() : this.props.defaults;
        if (this.props.value === '')
        {
            const def = this.findDefault(defaults, this.props.project.measurementKeys);
            if (def !== null && def !== '')
            {
                this.props.onChange(def);
            }
        }
    }

    render()
    {
        const keys = sort((a, b) => a.localeCompare(b), this.props.project.measurementKeys);
        const groups = this.createGroups(keys);

        return (
            <div className={this.props.className}>
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
            </div>
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

    generateDefaults = (): string[] =>
    {
        const commitKey = this.props.project.commitKey.trim();
        if (commitKey === '') return [...DEFAULTS];
        return [commitKey, ...DEFAULTS];
    }
}
