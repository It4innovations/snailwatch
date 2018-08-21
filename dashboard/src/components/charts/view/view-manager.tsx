import {sort} from 'ramda';
import React, {PureComponent} from 'react';
import MdClose from 'react-icons/lib/md/close';
import MdEdit from 'react-icons/lib/md/edit';
import {connect} from 'react-redux';
import {Badge, Button} from 'reactstrap';
import styled from 'styled-components';
import {RangeFilter} from '../../../lib/measurement/selection/range-filter';
import {Selection} from '../../../lib/measurement/selection/selection';
import {Project} from '../../../lib/project/project';
import {createView, View} from '../../../lib/view/view';
import {AppState} from '../../../state/app/reducers';
import {
    addChartDatasetAction,
    AddDatasetParams,
    deleteChartDatasetAction,
    setChartXAxisAction
} from '../../../state/session/pages/chart-page/actions';
import {getSelectedProject} from '../../../state/session/project/reducer';
import {SelectionActions} from '../../../state/session/selection/actions';
import {getSelections} from '../../../state/session/selection/reducer';
import {ViewActions} from '../../../state/session/view/actions';
import {getViews, getViewsState} from '../../../state/session/view/reducer';
import {getResultKeys} from '../../../util/measurement';
import {Request} from '../../../util/request';
import {Box} from '../../global/box';
import {MeasurementKeys} from '../../global/keys/measurement-keys';
import {Loading} from '../../global/loading';
import {SuggestInput} from '../../global/suggest-input';
import {ChartDataset} from '../chart/chart-dataset';
import {ViewComponent} from './view-component';

interface StateProps
{
    views: View[];
    selections: Selection[];
    project: Project;
    viewRequest: Request;
    xAxis: string;
    datasets: ChartDataset[];
    rangeFilter: RangeFilter;
}
interface DispatchProps
{
    loadViews(): void;
    changeXAxis(xAxis: string): void;
    createView(view: View): void;
    updateView(view: View): void;
    deleteView(view: View): void;
    addChartDataset(params: AddDatasetParams): void;
    deleteChartDataset(dataset: ChartDataset): void;
    changeSelection(selection: Selection): void;
}

type Props = StateProps & DispatchProps;

interface State
{
    selectedView: string | null;
    viewQuery: string;
}

const Row = styled.div`
  display: flex;
  align-items: center;
`;
const AlignTopRow = styled.div`
  display: flex;
  align-items: flex-start;
`;
const LeftColumn = styled.div`
  max-width: 30%;
`;
const ViewWrapper = styled.div`
  margin-left: 20px;
  padding-left: 20px;
  border-left: 1px solid #000000;
`;
const Keys = styled(MeasurementKeys)`
  width: auto;
  margin-left: 10px;
`;
const DatasetBadge = styled(Badge)`
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  margin: 10px 5px 0 0;
  padding: 4px 6px;
`;
const DatasetButton = styled.div`
  margin-left: 10px;
`;

class ViewManagerComponent extends PureComponent<Props, State>
{
    readonly state: State = {
        selectedView: null,
        viewQuery: ''
    };

    componentDidMount()
    {
        this.props.loadViews();
    }

    componentDidUpdate()
    {
        const {views} = this.props;
        const {selectedView} = this.state;
        const invalidSelection = views.find(v => v.id === selectedView) === undefined;

        if (selectedView && invalidSelection)
        {
            this.setState(() => ({ selectedView: null }));
        }
    }

    render()
    {
        const selectedView = this.props.views.find(v => v.id === this.state.selectedView) || null;
        const keys = sort((a, b) => a.localeCompare(b), this.props.project.measurementKeys);

        return (
            <Box title={this.renderTitle()} hideable={false}>
                <AlignTopRow>
                    <LeftColumn>
                        <Row>
                            <span>X axis:</span>
                            <Keys keys={keys}
                                  value={this.props.xAxis}
                                  onChange={this.props.changeXAxis} />
                        </Row>
                        <div>
                            <div>Views</div>
                            <Row>
                                <SuggestInput value={this.state.viewQuery}
                                              onChange={this.changeViewQuery}
                                              onSuggestionSelected={this.addViewDataset}
                                              getSuggestionValue={this.getViewSuggestionValue}
                                              calculateSuggestions={this.calculateViewSuggestions} />
                                <Button outline={true}
                                        color='success'
                                        size='sm'
                                        onClick={this.createView}>Create new view</Button>
                            </Row>
                            {this.props.datasets.map(this.renderDataset)}
                        </div>
                    </LeftColumn>
                    {selectedView &&
                        <ViewWrapper>
                            <ViewComponent
                                measurements={[]}
                                view={selectedView}
                                selections={this.props.selections}
                                measurementKeys={this.props.project.measurementKeys}
                                onChangeView={this.props.updateView}
                                onChangeSelection={this.props.changeSelection}
                                onDelete={this.props.deleteView} />
                        </ViewWrapper>
                    }
                </AlignTopRow>
            </Box>
        );
    }
    renderDataset = (dataset: ChartDataset): JSX.Element =>
    {
        const view = this.props.views.find(v => v.id === dataset.view);
        if (!view) return null;

        return (
            <DatasetBadge key={dataset.id}>
                <div>{view.name}</div>
                <DatasetButton title='Edit'>
                    <MdEdit onClick={() => this.setState(() => ({ selectedView: dataset.view }))} />
                </DatasetButton>
                <DatasetButton title='Deselect'>
                    <MdClose onClick={() => this.deleteChartDataset(dataset)} />
                </DatasetButton>
            </DatasetBadge>
        );
    }
    renderTitle = (): JSX.Element =>
    {
        return (
            <Row>
                <div>View manager</div>
                <Loading show={this.props.viewRequest.loading} />
            </Row>
        );
    }

    changeSelectedView = (e: React.FormEvent<HTMLInputElement>) =>
    {
        const selectedView = e.currentTarget.value;
        this.setState(() => ({ selectedView }));
    }
    changeViewQuery = (viewQuery: string) =>
    {
        this.setState(() => ({ viewQuery }));
    }
    deleteChartDataset = (dataset: ChartDataset) =>
    {
        this.props.deleteChartDataset(dataset);
        if (this.state.selectedView && this.state.selectedView === dataset.view)
        {
            this.setState(() => ({ selectedView: null }));
        }
    }

    getViewSuggestionValue = (view: View) =>
    {
        return view.name;
    }
    calculateViewSuggestions = (query: string): View[] =>
    {
        if (query === '') return [];

        const selectedIds = this.props.datasets.map(d => d.view);
        const views = this.props.views
            .filter(v => selectedIds.indexOf(v.id) === -1);

        query = query.toLocaleLowerCase();
        return views.filter(v => v.name.toLocaleLowerCase().includes(query));
    }

    addViewDataset = (view: View) =>
    {
        this.setState(() => ({ viewQuery: '' }));
        this.props.addChartDataset({
            rangeFilter: this.props.rangeFilter,
            view: view.id
        });
    }
    createView = () =>
    {
        const keys = getResultKeys(this.props.project.measurementKeys);
        const yAxes = keys.length === 0 ? [] : [keys[0]];

        const view = createView({
            name: `View #${this.props.views.length + 1}`,
            yAxes
        });

        this.props.createView(view);
    }
}

export const ViewManager = connect<StateProps, DispatchProps>((state: AppState) => ({
    views: getViews(state),
    viewRequest: getViewsState(state).viewRequest,
    project: getSelectedProject(state),
    selections: getSelections(state),
    xAxis: state.session.pages.chartState.xAxis,
    datasets: state.session.pages.chartState.datasets,
    rangeFilter: state.session.pages.global.rangeFilter
}), {
    loadViews: ViewActions.load.started,
    createView: ViewActions.create.started,
    updateView: ViewActions.update.started,
    deleteView: ViewActions.delete.started,
    changeXAxis: setChartXAxisAction,
    addChartDataset: addChartDatasetAction.started,
    deleteChartDataset: deleteChartDatasetAction,
    changeSelection: SelectionActions.update.started
})(ViewManagerComponent);
