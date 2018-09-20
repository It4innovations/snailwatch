import React, {PureComponent} from 'react';
import MdClose from 'react-icons/lib/md/close';
import {connect} from 'react-redux';
import {Button} from 'reactstrap';
import styled from 'styled-components';
import {Measurement} from '../../../lib/measurement/measurement';
import {Project} from '../../../lib/project/project';
import {createWatch, View, Watch} from '../../../lib/view/view';
import {AppState} from '../../../state/app/reducers';
import {getGlobalMeasurements} from '../../../state/session/pages/reducers';
import {getSelectedProject} from '../../../state/session/project/reducer';
import {ViewActions} from '../../../state/session/view/actions';
import {getViews, getViewsState} from '../../../state/session/view/reducer';
import {Request} from '../../../util/request';
import {ResultKeysMultiselect} from '../../global/keys/result-keys-multiselect';
import {RequestComponent} from '../../global/request-component';
import {ViewFilterManager} from './view-filter-manager';
import {ViewName} from './view-name';
import {WatchComponent} from './watch-component';

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
    globalMeasurements: Measurement[];
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
const Column = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;
const KeysWrapper = styled.div`
  margin: 5px 0;
`;
const DeleteButton = styled(Button)`
  width: 100px;
`;
const LastRow = styled(Row)`
  flex-grow: 1;
  align-items: flex-end;
`;

class ViewManagerComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <Column>
                <Row>
                    <ViewName value={this.props.view.name}
                              onChange={this.changeName} />
                    <Button title='Close view detail' onClick={this.props.onClose}><MdClose /></Button>
                </Row>
                <ViewFilterManager
                    view={this.props.view}
                    onChange={this.props.changeView}
                    measurements={this.props.globalMeasurements}
                    measurementKeys={this.props.project.measurementKeys} />
                <KeysWrapper>
                    <div>Y axes</div>
                    <ResultKeysMultiselect keys={this.props.project.measurementKeys}
                                           values={this.props.view.yAxes}
                                           onChange={this.changeYAxes}
                                           requireSelection={true} />
                </KeysWrapper>
                <div>
                    <div>Watches</div>
                    {this.props.view.watches.map(watch =>
                        <WatchComponent key={watch.id}
                                        project={this.props.project}
                                        watch={watch}
                                        onChange={this.changeWatch}
                                        onDelete={this.deleteWatch} />
                    )}
                    <Button color='success' onClick={this.addWatch}>Add watch</Button>
                </div>
                <LastRow>
                    <div>
                        <DeleteButton onClick={this.deleteView} color='danger' title='Delete view'>
                            Delete
                        </DeleteButton>
                    </div>
                    <RequestComponent request={this.props.viewRequest} />
                </LastRow>
            </Column>
        );
    }

    changeName = (name: string) =>
    {
        if (name !== this.props.view.name)
        {
            this.props.changeView({ ...this.props.view, name });
        }
    }
    addWatch = () =>
    {
        const watch = createWatch({
            groupBy: this.props.project.commitKey
        });
        this.changeWatches([...this.props.view.watches, watch]);
    }
    changeWatch = (watch: Watch) =>
    {
        this.changeWatches(this.props.view.watches.map(w => w.id === watch.id ? watch : w));
    }
    deleteWatch = (watch: Watch) =>
    {
        this.changeWatches(this.props.view.watches.filter(w => w.id !== watch.id));
    }

    changeWatches = (watches: Watch[]) =>
    {
        this.props.changeView({ ...this.props.view, watches });
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
    viewRequest: getViewsState(state).viewRequest,
    globalMeasurements: getGlobalMeasurements(state)
}), {
    changeView: ViewActions.update.started,
    deleteView: ViewActions.delete.started,
})(ViewManagerComponent);
