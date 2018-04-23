import React, {PureComponent} from 'react';
import {RangeFilter} from '../../../../lib/measurement/selection/range-filter';
import {RouteComponentProps, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {AppState} from '../../../../state/app/reducers';
import {getSelections} from '../../../../state/session/selection/reducer';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {LineChart} from '../line-chart/line-chart';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {LineChartDataset, nameDataset} from '../line-chart/line-chart-dataset';
import {TwoColumnPage} from '../../../global/two-column-page';
import {Box} from '../../../global/box';
import {RangeFilterSwitcher} from '../../range-filter-switcher';
import {
    loadGridChartDatasetsAction,
    setGridChartXAxisAction, setGridChartYAxisAction
} from '../../../../state/session/views/grid-chart-page/actions';
import {
    getGridChartDatasets,
    getGridChartXAxis,
    getGridChartYAxis
} from '../../../../state/session/views/grid-chart-page/reducer';
import {DataSelector} from './data-selector';
import {Project} from '../../../../lib/project/project';
import {getSelectedProject} from '../../../../state/session/project/reducer';
import styled from 'styled-components';
import {SelectionContainer} from '../../selection-container/selection-container';
import {SelectDatasetParams} from '../../../../state/session/views/line-chart-page/actions';

interface OwnProps
{
    rangeFilter: RangeFilter;
    onChangeRangeFilter(rangeFilter: RangeFilter): void;
    selectDataset(dataset: SelectDatasetParams): void;
}
interface StateProps
{
    project: Project;
    xAxis: string;
    yAxis: string;
    datasets: LineChartDataset[];
    selections: Selection[];
}
interface DispatchProps
{
    loadDatasets(): void;
    changeXAxis(axis: string): void;
    changeYAxis(axis: string): void;
}

type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    selection: Selection;
}

const Grid = styled.div`
  display: flex;
`;
const Dataset = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 20px;
  margin-left: 10px;
  border: 1px solid #00000000;
  
  &:hover {
    border: 1px solid #000000;
    border-radius: 5px;
  }
`;
const Label = styled.div`
  text-align: center;
`;

class GridChartPageComponent extends PureComponent<Props, Readonly<State>>
{
    readonly state: State = {
        selection: null
    };

    componentDidMount()
    {
        this.props.loadDatasets();
    }
    componentDidUpdate(oldProps: Props)
    {
        if (this.props.selections !== oldProps.selections ||
            this.props.rangeFilter !== oldProps.rangeFilter)
        {
            this.props.loadDatasets();
        }
    }

    render()
    {
        return (
            <TwoColumnPage
                menu={this.renderMenu}
                content={this.renderContent} />
        );
    }
    renderMenu = (): JSX.Element =>
    {
        const measurements = this.props.datasets.length === 0 ? [] : this.props.datasets[0].measurements;

        return (
            <>
                <Box title='Range'>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.props.onChangeRangeFilter} />
                </Box>
                <Box title='Axes'>
                    <DataSelector
                        measurementKeys={this.props.project.measurementKeys}
                        xAxis={this.props.xAxis}
                        yAxis={this.props.yAxis}
                        onChangeXAxis={this.props.changeXAxis}
                        onChangeYAxis={this.props.changeYAxis} />
                </Box>
                <Box title='Selections'>
                    <SelectionContainer
                        measurements={measurements}
                        selectedSelection={this.state.selection}
                        selectSelection={this.changeSelection} />
                </Box>
            </>
        );
    }
    renderContent = (): JSX.Element =>
    {
        if (this.props.datasets.length === 0)
        {
            return <div>You have no selections</div>;
        }

        return (
            <Grid>
                {this.props.datasets.map(this.renderDataset)}
            </Grid>
        );
    }
    renderDataset = (dataset: LineChartDataset): JSX.Element =>
    {
        const mapped = nameDataset({
            ...dataset,
            yAxis: this.props.yAxis
        }, this.props.selections);

        return (
            <Dataset key={mapped.name} title={`Select ${mapped.name}`} onClick={() => this.selectDataset(dataset)}>
                <Label>{mapped.name}</Label>
                <LineChart
                    datasets={[mapped]}
                    xAxis={this.props.xAxis}
                    width={300}
                    height={150}
                    preview={true}
                    groupMode={GroupMode.AxisX}
                    connectPoints={true}
                    showPoints={false}
                    showDeviation={false} />
            </Dataset>
        );
    }

    selectDataset = (dataset: LineChartDataset) =>
    {
        this.props.selectDataset({
            dataset: {
                ...dataset,
                yAxis: this.props.yAxis
            },
            xAxis: this.props.xAxis
        });
    }

    changeSelection = (selection: Selection) =>
    {
        this.setState(() => ({ selection }));
    }
}

export const GridChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    selections: getSelections(state),
    datasets: getGridChartDatasets(state),
    xAxis: getGridChartXAxis(state),
    yAxis: getGridChartYAxis(state)
}), {
    loadDatasets: () => loadGridChartDatasetsAction.started({}),
    changeXAxis: setGridChartXAxisAction,
    changeYAxis: setGridChartYAxisAction
})(GridChartPageComponent));
