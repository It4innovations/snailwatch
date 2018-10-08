import memoizeOne from 'memoize-one';
import React, {PureComponent, ReactNode} from 'react';
import Toggle from 'react-bootstrap-toggle';
import MdClose from 'react-icons/lib/md/close';
import {connect} from 'react-redux';
import {Button, ButtonGroup} from 'reactstrap';
import styled from 'styled-components';
import {getResultKeys, Measurement} from '../../../lib/measurement/measurement';
import {Project} from '../../../lib/project/project';
import {User} from '../../../lib/user/user';
import {createWatch, View, Watch} from '../../../lib/view/view';
import {AppState} from '../../../state/app/reducers';
import {getGlobalMeasurements} from '../../../state/session/pages/reducers';
import {getSelectedProject} from '../../../state/session/project/reducers';
import {getUser} from '../../../state/session/user/reducers';
import {ViewActions} from '../../../state/session/view/actions';
import {getViews} from '../../../state/session/view/reducers';
import {Box} from '../../global/box';
import {EditableText} from '../../global/editable-text';
import {Help} from '../../global/help';
import {ResultKeysMultiselect} from '../../global/keys/result-keys-multiselect';
import {ViewFilterManager} from './view-filter-manager';


interface OwnProps
{
    view: View;
    className?: string;
    onClose(): void;
}
interface StateProps
{
    views: View[];
    project: Project;
    user: User;
    globalMeasurements: Measurement[];
}
interface DispatchProps
{
    addView(view: View): void;
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
  max-width: 250px;
  word-break: break-all;
`;
const ActionButton = styled(Button)`
  margin-left: 10px;
`;
const LastRow = styled(Row)`
  flex-grow: 1;
  margin-top: 5px;
  justify-content: space-between;
  align-items: flex-end;
`;
const TitleRow = styled.div`
  display: flex;
  align-items: center;
`;
const TitleHelp = styled(Help)`
  margin-left: 5px;
`;
const ViewName = styled(EditableText)`
  font-size: 20px;
`;

class ViewManagerComponent extends PureComponent<Props>
{
    private keys = memoizeOne(
        (view: View) => getResultKeys(view.measurements)
    );

    render()
    {
        const email = () => !this.props.user.email ? 'your e-mail' : <b>{this.props.user.email}</b>;
        const watchHelp = (
            <>
                Enable regression detection for this view. If a regression is
                detected in your measurements, an e-mail will be sent to {email()}
                {' '}(changeable in Profile settings).<br /><br />
                Regression happens when the value of your selected Y axes increases by more than 10 % relative
                to the last group. Measurements are grouped by their commits (the commit attribute can be changed in
                Project settings, it is currently set to <b>{this.props.project.commitKey}</b>).
            </>
        );

        const measurementKeys = this.keys(this.props.view);
        return (
            <Box title={this.renderTitle()} className={this.props.className}>
                <Column>
                    <ViewFilterManager
                        key={this.props.view.id}
                        view={this.props.view}
                        onChange={this.props.changeView}
                        measurements={this.props.globalMeasurements}
                        measurementKeys={this.props.project.measurementKeys} />
                    <KeysWrapper>
                        {this.renderHelpTitle('Y axes', 'Select attributes that will be displayed on the Y axis.')}
                        <ResultKeysMultiselect keys={measurementKeys}
                                               values={this.props.view.yAxes}
                                               onChange={this.changeYAxes}
                                               requireSelection={true} />
                    </KeysWrapper>
                    <LastRow>
                        <div>
                            {this.renderHelpTitle('Watch', watchHelp)}
                            {this.renderWatch(this.props.view.watches)}
                        </div>
                        <ButtonGroup>
                            <ActionButton onClick={this.copyView} color='info' title='Copy view'>
                                Copy
                            </ActionButton>
                            <ActionButton onClick={this.deleteView} color='danger' title='Delete view'>
                                Delete
                            </ActionButton>
                        </ButtonGroup>
                    </LastRow>
                </Column>
            </Box>
        );
    }
    renderTitle = (): JSX.Element =>
    {
        return (
            <Row>
                <div title='Edit name'>
                    <ViewName key={this.props.view.id}
                              value={this.props.view.name}
                              validate={this.validateName}
                              activeColor='#7199C3'
                              onChange={this.changeName} />
                </div>
                <Button title='Close view detail'
                        size='sm'
                        onClick={this.props.onClose}>
                    <MdClose size={20} />
                </Button>
            </Row>
        );
    }
    renderHelpTitle = (title: string, help: ReactNode | string): JSX.Element =>
    {
        return (
            <TitleRow>
                <div>{title}</div>
                <TitleHelp content={help} />
            </TitleRow>
        );
    }
    renderWatch = (watches: Watch[]): JSX.Element =>
    {
        return <Toggle
            on='Enabled'
            off='Disabled'
            size='sm'
            offstyle='secondary'
            onClick={this.changeWatch}
            active={watches.length > 0}
        />;
    }

    validateName = (name: string): boolean =>
    {
        return name.trim() !== '';
    }
    changeName = (name: string) =>
    {
        if (name !== this.props.view.name)
        {
            this.props.changeView({ ...this.props.view, name });
        }
    }

    changeWatch = (enabled: boolean) =>
    {
        if (enabled)
        {
            const watch = createWatch({
                groupBy: this.props.project.commitKey
            });
            this.changeWatches([watch]);
        }
        else this.changeWatches([]);
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
    copyView = () =>
    {
        this.props.addView({
            ...this.props.view,
            name: `${this.props.view.name} (copy)`,
            filters: [...this.props.view.filters],
            yAxes: [...this.props.view.yAxes],
            watches: this.props.view.watches.map(w => createWatch({ groupBy: w.groupBy }))
        });
    }
}

export const ViewManager = connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    views: getViews(state),
    project: getSelectedProject(state),
    user: getUser(state),
    globalMeasurements: getGlobalMeasurements(state)
}), {
    addView: ViewActions.create.started,
    changeView: ViewActions.update.started,
    deleteView: ViewActions.delete.started,
})(ViewManagerComponent);
