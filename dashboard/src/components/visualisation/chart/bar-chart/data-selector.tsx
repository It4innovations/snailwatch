import React, {PureComponent} from 'react';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {sort} from 'ramda';
import {MeasurementKeys} from '../../../global/keys/measurement-keys';
import {ResultKeysMultiselect} from '../../../global/keys/result-keys-multiselect';

interface Props
{
    measurementKeys: string[];
    selection: Selection | null;
    xAxis: string;
    yAxes: string[];
    onChangeXAxis(xAxis: string): void;
    onChangeYAxes(yAxes: string[]): void;
    onChangeSelection(selection: Selection): void;
}

export class DataSelector extends PureComponent<Props>
{
    render()
    {
        const keys = sort((a, b) => a.localeCompare(b), this.props.measurementKeys);

        return (
            <div>
                <div>X axis</div>
                <MeasurementKeys keys={keys}
                                 value={this.props.xAxis}
                                 onChange={this.props.onChangeXAxis} />
                <div>Y axes</div>
                <ResultKeysMultiselect keys={this.props.measurementKeys}
                                       values={this.props.yAxes}
                                       onChange={this.props.onChangeYAxes} />
            </div>
        );
    }
}
