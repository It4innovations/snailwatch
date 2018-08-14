import React, {PureComponent} from 'react';
import styled from 'styled-components';
import {Measurement} from '../../../lib/measurement/measurement';
import {View} from '../../../lib/view/view';
import {SelectionContainer} from '../selection-container/selection-container';
import {Selection} from '../../../lib/measurement/selection/selection';
import {getSelectionById} from '../../../state/session/selection/reducer';
import {ResultKeysMultiselect} from '../../global/keys/result-keys-multiselect';
import {ViewName} from './view-name';
import {Button} from 'reactstrap';

interface Props
{
    view: View;
    selections: Selection[];
    measurements: Measurement[];
    measurementKeys: string[];
    onChange(view: View): void;
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
                <SelectionContainer
                    selectedSelection={getSelectionById(this.props.selections, this.props.view.selection)}
                    onSelect={this.changeSelection}
                    onSelectionChange={this.onSelectionChange}
                    measurements={this.props.measurements} />
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
        this.props.onChange({ ...this.props.view, name });
    }
    changeSelection = (selection: Selection | null) =>
    {
        const id = selection === null ? null : selection.id;
        this.props.onChange({ ...this.props.view, selection: id });
    }
    changeYAxes = (yAxes: string[]) =>
    {
        this.props.onChange({ ...this.props.view, yAxes });
    }
    deleteView = () =>
    {
        this.props.onDelete(this.props.view);
    }

    onSelectionChange = (selection: Selection) =>
    {
        const id = selection === null ? null : selection.id;
        if (selection.id === id)
        {
            this.props.onChange({ ...this.props.view });
        }
    }
}
