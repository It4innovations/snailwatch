import React, {PureComponent} from 'react';
import {LineChartDataset} from './line-chart-dataset';
import Button from 'reactstrap/lib/Button';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {MeasurementKeys} from '../../../global/measurement-keys';
import {SelectionSelectEditor} from '../../selection-container/selection-select-editor';
import {Box} from '../../../global/box';
import MdDelete from 'react-icons/lib/md/delete';
import styled from 'styled-components';
import {getSelectionById} from '../../../../state/selection/reducer';

interface Props
{
    selections: Selection[];
    datasets: LineChartDataset[];
    measurementKeys: string[];
    maxDatasetCount: number;
    addDataset(): void;
    deleteDataset(dataset: LineChartDataset): void;
    updateDataset(oldDataset: LineChartDataset, newDataset: LineChartDataset): void;
}

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;
const AddButton = styled(Button)`
  margin-top: 5px;
`;
const SelectWrapper = styled.div`
  margin-top: 5px;
`;

export class DatasetManager extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                {this.props.datasets.map(this.renderDataset)}
                {this.props.datasets.length < this.props.maxDatasetCount &&
                    <AddButton
                        size='sm'
                        color='success'
                        onClick={this.props.addDataset}>Add dataset</AddButton>
                }
            </div>
        );
    }
    renderDataset = (dataset: LineChartDataset, index: number): JSX.Element =>
    {
        return (
            <Box key={`${dataset.name}.${index}`} title={this.renderHeader(dataset)}>
                <div>Y axis</div>
                <MeasurementKeys keys={this.props.measurementKeys}
                                 value={dataset.yAxis}
                                 onChange={(value) => this.changeYAxis(dataset, value)} />
                <SelectWrapper>
                    <SelectionSelectEditor
                        selections={this.props.selections}
                        selection={getSelectionById(this.props.selections, dataset.selectionId)}
                        measurements={dataset.measurements}
                        onSelectSelection={(selection) => this.changeSelection(dataset, selection)} />
                </SelectWrapper>
            </Box>
        );
    }
    renderHeader = (dataset: LineChartDataset): JSX.Element =>
    {
        return (
            <Header>
                <div>Dataset {dataset.name}</div>
                <MdDelete size={20} onClick={() => this.props.deleteDataset(dataset)} />
            </Header>
        );
    }

    changeYAxis = (dataset: LineChartDataset, yAxis: string) =>
    {
        this.props.updateDataset(dataset, {
            ...dataset,
            yAxis
        });
    }
    changeSelection = (dataset: LineChartDataset, selection: Selection) =>
    {
        this.props.updateDataset(dataset, {
            ...dataset,
            selectionId: selection === null ? '' : selection.id
        });
    }
}
