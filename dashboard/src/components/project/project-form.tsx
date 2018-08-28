import {equals} from 'ramda';
import React, {ChangeEvent, PureComponent} from 'react';
import {Button, Input, InputGroup, InputGroupAddon, InputGroupAddonProps} from 'reactstrap';
import styled from 'styled-components';
import {Project} from '../../lib/project/project';

interface Props
{
    project: Project;
    onChange(project: Project): void;
}

interface State
{
    project: Project;
}

const Label = styled(InputGroupAddon as React.ComponentType<InputGroupAddonProps & {className?: string; }>)`
  width: 120px;
  span {
    width: 100%;
  }
`;
const SaveButton = styled(Button)`
  margin-top: 5px;
`;

export class ProjectForm extends PureComponent<Props, Readonly<State>>
{
    constructor(props: Props)
    {
        super(props);

        this.state = {
            project: {...props.project}
        };
    }

    componentDidUpdate(prevProps: Props)
    {
        if (prevProps.project !== this.props.project)
        {
            this.setState(() => ({
                project: {...this.props.project}
            }));
        }
    }

    render()
    {
        const {project} = this.state;
        return (
            <div>
                <InputGroup>
                    <Label addonType='prepend'>Name</Label>
                    <Input value={project.name} disabled />
                </InputGroup>
                <InputGroup>
                    <Label addonType='prepend'>Id</Label>
                    <Input value={project.id} disabled />
                </InputGroup>
                <InputGroup>
                    <Label addonType='prepend' title='URL of your repository'>Repository</Label>
                    <Input value={project.repository}
                           onChange={this.changeProjectAttribute('repository')} />
                </InputGroup>
                <InputGroup>
                    <Label addonType='prepend' title='Key in uploaded measurements that contains the commit ID'>
                        Commit key</Label>
                    <Input value={project.commitKey}
                           onChange={this.changeProjectAttribute('commitKey')} />
                </InputGroup>
                {this.isDirty() && <SaveButton color='success' onClick={this.saveProject}>Save</SaveButton>}
            </div>
        );
    }

    changeProjectAttribute = (key: keyof Project) => (event: ChangeEvent<HTMLInputElement>) =>
    {
        const value = event.currentTarget.value;
        this.setState(() => ({
            project: {...this.state.project, [key]: value.trim()}
        }));
    }
    isDirty = () =>
    {
        return !equals(this.props.project, this.state.project);
    }
    saveProject = () =>
    {
        this.props.onChange(this.state.project);
    }
}
