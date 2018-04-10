import React, {PureComponent} from 'react';
import {LineChartDataset} from './line-chart-dataset';
import Button from 'reactstrap/lib/Button';
import {Selection} from '../../../lib/measurement/selection/selection';

interface Props
{
    selections: Selection[];
    datasets: LineChartDataset[];
    addDataset(): void;
    deleteDataset(dataset: LineChartDataset): void;
    updateDataset(oldDataset: LineChartDataset, newDataset: LineChartDataset): void;
}

export class DatasetManager extends PureComponent<Props>
{
    render()
    {
        return (
            <Button onClick={this.props.addDataset}>Add dataset</Button>
        );
    }
}
