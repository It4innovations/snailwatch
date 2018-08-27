import React, {PureComponent} from 'react';
import MdClose from 'react-icons/lib/md/close';
import {connect} from 'react-redux';
import {Button} from 'reactstrap';
import styled from 'styled-components';
import {Selection} from '../../../lib/measurement/selection/selection';
import {Project} from '../../../lib/project/project';
import {View} from '../../../lib/view/view';
import {AppState} from '../../../state/app/reducers';
import {getSelectedProject} from '../../../state/session/project/reducer';
import {SelectionActions} from '../../../state/session/selection/actions';
import {getSelectionById, getSelections} from '../../../state/session/selection/reducer';
import {ViewActions} from '../../../state/session/view/actions';
import {getViews, getViewsState} from '../../../state/session/view/reducer';
import {Request} from '../../../util/request';
import {ResultKeysMultiselect} from '../../global/keys/result-keys-multiselect';
import {RequestComponent} from '../../global/request-component';
import {SelectionView} from '../selection-container/selection-view';
import {ViewName} from './view-name';

interface OwnProps
{
    view: View;
    onClose(): void;
}
interface StateProps
{
    views: View[];
    selections: Selection[];
    project: Project;
    viewRequest: Request;
}
interface DispatchProps
{
    updateView(view: View): void;
    deleteView(view: View): void;
    changeSelection(selection: Selection): void;
}

type Props = OwnProps & StateProps & DispatchProps;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const KeysWrapper = styled.div`
  margin: 5px 0;
`;
const DeleteButton = styled(Button)`
  width: 100px;
`;

class ViewManagerComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <>
                <Row>
                    <ViewName value={this.props.view.name}
                              onChange={this.changeName} />
                    <Button title='Close view detail' onClick={this.props.onClose}><MdClose /></Button>
                </Row>
                <SelectionView
                    selection={getSelectionById(this.props.selections, this.props.view.selection)}
                    onChange={this.props.changeSelection}
                    measurements={[]}
                    measurementKeys={this.props.project.measurementKeys} />
                <KeysWrapper>
                    <div>Y axes</div>
                    <ResultKeysMultiselect keys={this.props.project.measurementKeys}
                                           values={this.props.view.yAxes}
                                           onChange={this.changeYAxes}
                                           requireSelection={true} />
                </KeysWrapper>
                <DeleteButton onClick={this.deleteView} color='danger'>Delete</DeleteButton>
                <RequestComponent request={this.props.viewRequest} />
            </>
        );
    }

    changeName = (name: string) =>
    {
        if (name !== this.props.view.name)
        {
            this.props.updateView({ ...this.props.view, name });
        }
    }
    changeYAxes = (yAxes: string[]) =>
    {
        this.props.updateView({ ...this.props.view, yAxes });
    }
    deleteView = () =>
    {
        this.props.deleteView(this.props.view);
    }
}

export const ViewManager = connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    views: getViews(state),
    project: getSelectedProject(state),
    selections: getSelections(state),
    xAxis: state.session.pages.chartState.xAxis,
    datasets: state.session.pages.chartState.datasets,
    rangeFilter: state.session.pages.global.rangeFilter,
    viewRequest: getViewsState(state).viewRequest
}), {
    updateView: ViewActions.update.started,
    deleteView: ViewActions.delete.started,
    changeSelection: SelectionActions.update.started
})(ViewManagerComponent);
