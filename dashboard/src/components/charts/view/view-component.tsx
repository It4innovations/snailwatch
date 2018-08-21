import React, {PureComponent} from 'react';
import {Button} from 'reactstrap';
import styled from 'styled-components';
import {Measurement} from '../../../lib/measurement/measurement';
import {Selection} from '../../../lib/measurement/selection/selection';
import {View} from '../../../lib/view/view';
import {getSelectionById} from '../../../state/session/selection/reducer';
import {ResultKeysMultiselect} from '../../global/keys/result-keys-multiselect';
import {SelectionView} from '../selection-container/selection-view';
import {ViewName} from './view-name';

interface Props
{
    view: View;
    selections: Selection[];
    measurements: Measurement[];
    measurementKeys: string[];
    onChangeView(view: View): void;
    onChangeSelection(selection: Selection): void;
    onDelete(view: View): void;
}

const initialState = {
    editing: false
};

type State = Readonly<typeof initialState>;

const KeysWrapper = styled.div`
    margin: 10px;
`;

export class ViewComponent extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    render()
    {
        return (
            <div>
                <ViewName value={this.props.view.name}
                          onChange={this.changeName} />
                <SelectionView
                    selection={getSelectionById(this.props.selections, this.props.view.selection)}
                    onChange={this.props.onChangeSelection}
                    measurements={this.props.measurements}
                    measurementKeys={this.props.measurementKeys} />
                <KeysWrapper>
                    <ResultKeysMultiselect keys={this.props.measurementKeys}
                                           values={this.props.view.yAxes}
                                           onChange={this.changeYAxes}
                                           requireSelection={true} />
                </KeysWrapper>
                <Button onClick={this.deleteView} color='danger'>Delete</Button>
            </div>
        );
    }

    changeName = (name: string) =>
    {
        if (name !== this.props.view.name)
        {
            this.props.onChangeView({ ...this.props.view, name });
        }
    }
    changeYAxes = (yAxes: string[]) =>
    {
        this.props.onChangeView({ ...this.props.view, yAxes });
    }
    deleteView = () =>
    {
        this.props.onDelete(this.props.view);
    }
}
