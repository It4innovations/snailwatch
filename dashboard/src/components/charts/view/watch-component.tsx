import React, {PureComponent} from 'react';
import {Button} from 'reactstrap';
import styled from 'styled-components';
import {Project} from '../../../lib/project/project';
import {Watch} from '../../../lib/view/view';
import {MeasurementKeys} from '../../global/keys/measurement-keys';

interface Props
{
    watch: Watch;
    project: Project;
    onChange(watch: Watch): void;
    onDelete(watch: Watch): void;
}

const Row = styled.div`
  display: flex;
  align-items: center;
`;

export class WatchComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <Row>
                Group by:
                <MeasurementKeys value={this.props.watch.groupBy}
                                 project={this.props.project}
                                 onChange={this.changeWatch} />
                <Button color='danger' onClick={this.deleteWatch}>Delete</Button>
            </Row>
        );
    }

    changeWatch = (groupBy: string) =>
    {
        this.props.onChange({ ...this.props.watch, groupBy });
    }
    deleteWatch = () =>
    {
        this.props.onDelete(this.props.watch);
    }
}
