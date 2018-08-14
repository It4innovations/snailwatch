import React, {PureComponent} from 'react';
import MdDelete from 'react-icons/lib/md/delete';
import {Button, Input} from 'reactstrap';
import styled from 'styled-components';
import {View} from '../../../lib/view/view';
import {ChartDataset} from './chart-dataset';

interface Props
{
    views: View[];
    datasets: ChartDataset[];
    measurementKeys: string[];
    maxDatasetCount: number;
    canAdd: boolean;
    addDataset(): void;
    deleteDataset(dataset: ChartDataset): void;
    updateDataset(oldDataset: ChartDataset, newDataset: ChartDataset): void;
}

const Row = styled.div`
  display: flex;
  align-items: center;
`;
const AddButton = styled(Button)`
  margin-top: 5px;
`;

export class DatasetManager extends PureComponent<Props>
{
    render()
    {
        const {datasets} = this.props;
        return (
            <div>
                {datasets.map(this.renderDataset)}
                {datasets.length < this.props.maxDatasetCount &&
                    this.props.canAdd &&
                    <AddButton
                        size='sm'
                        color='success'
                        onClick={this.props.addDataset}>Add dataset</AddButton>
                }
            </div>
        );
    }
    renderDataset = (dataset: ChartDataset): JSX.Element =>
    {
        return (
            <Row key={dataset.id}>
                <Input type='select'
                       value={dataset.view}
                       onChange={event => this.changeView(dataset, event.currentTarget.value)}>
                    {this.props.views.map(v =>
                        <option key={v.id} value={v.id}>{v.name}</option>
                    )}
                </Input>
                <MdDelete size={26} onClick={() => this.props.deleteDataset(dataset)} />
            </Row>
        );
    }

    changeView = (dataset: ChartDataset, view: string | null) =>
    {
        this.props.updateDataset(dataset, {
            ...dataset,
            view: view === null ? null : view
        });
    }
}
