import React, {PureComponent} from 'react';
import MdClose from 'react-icons/lib/md/close';
import {connect} from 'react-redux';
import {Button} from 'reactstrap';
import styled from 'styled-components';
import {Project} from '../../../lib/project/project';
import {View} from '../../../lib/view/view';
import {AppState} from '../../../state/app/reducers';
import {getSelectedProject} from '../../../state/session/project/reducer';
import {ViewActions} from '../../../state/session/view/actions';
import {getViews, getViewsState} from '../../../state/session/view/reducer';
import {Request} from '../../../util/request';
import {ResultKeysMultiselect} from '../../global/keys/result-keys-multiselect';
import {RequestComponent} from '../../global/request-component';
import {ViewFilterManager} from './view-filter-manager';
import {ViewName} from './view-name';

interface OwnProps
{
    view: View;
    onClose(): void;
}
interface StateProps
{
    views: View[];
    project: Project;
    viewRequest: Request;
}
interface DispatchProps
{
    changeView(view: View): void;
    deleteView(view: View): void;
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
                <ViewFilterManager
                    view={this.props.view}
                    onChange={this.props.changeView}
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
            this.props.changeView({ ...this.props.view, name });
        }
    }
    changeYAxes = (yAxes: string[]) =>
    {
        this.props.changeView({ ...this.props.view, yAxes });
    }
    deleteView = () =>
    {
        this.props.deleteView(this.props.view);
    }
}

export const ViewManager = connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    views: getViews(state),
    project: getSelectedProject(state),
    xAxis: state.session.pages.chartState.xAxis,
    rangeFilter: state.session.pages.global.rangeFilter,
    viewRequest: getViewsState(state).viewRequest
}), {
    changeView: ViewActions.update.started,
    deleteView: ViewActions.delete.started,
})(ViewManagerComponent);
