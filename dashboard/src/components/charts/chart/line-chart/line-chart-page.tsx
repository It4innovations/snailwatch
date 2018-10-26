import memoizeOne from 'memoize-one';
import {chain} from 'ramda';
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {LineChartSettingsHelp, RangeHelp, ViewListHelp, XAxisHelp} from '../../../../help';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {Project} from '../../../../lib/project/project';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {updateLineChartSettings} from '../../../../state/session/pages/chart-page/actions';
import {getChartState} from '../../../../state/session/pages/chart-page/reducer';
import {getSelectedProject} from '../../../../state/session/project/reducers';
import {getViews} from '../../../../state/session/view/reducers';
import {formatKey} from '../../../../util/measurement';
import {Box} from '../../../global/box';
import {TwoColumnPage} from '../../../global/two-column-page';
import {RangeFilterSwitcher} from '../../range-filter/range-filter-switcher';
import {ViewSelection} from '../../view/view-selection';
import {ChartBottomPanel} from '../chart-bottom-panel';
import {ChartToolbarWrapper} from '../toolbar/chart-toolbar-wrapper';
import {XAxisSelector} from '../x-axis-selector';
import {XAxisSettings} from '../x-axis-settings';
import {LineChart, LineChartDataset} from './line-chart';
import {LineChartSettings} from './line-chart-settings';
import {LineChartSettingsComponent} from './line-chart-settings-component';

interface OwnProps
{
    rangeFilter: RangeFilter;
    xAxisSettings: XAxisSettings;
    onChangeRangeFilter(rangeFilter: RangeFilter): void;
    onChangeXAxisSettings(settings: XAxisSettings): void;
}
interface StateProps
{
    project: Project;
    views: View[];
    selectedViews: string[];
    lineChartSettings: LineChartSettings;
}
interface DispatchProps
{
    updateLineChartSettings(settings: LineChartSettings): void;
}
type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    groupMode: GroupMode;
    selectedMeasurements: Measurement[];
    selectedView: string | null;
}

class LineChartPageComponent extends PureComponent<Props, State>
{
    readonly state: State = {
        groupMode: GroupMode.AxisX,
        selectedMeasurements: [],
        selectedView: null,
    };

    private datasets = memoizeOne(
        (views: View[], selectedViews: string[]) =>
            this.expandDatasets(selectedViews)
    );

    render()
    {
        return (
            <TwoColumnPage
                menu={this.renderOptions}
                menuWidth='auto'
                content={this.renderGraph}
                alignMenuToTop={false} />
        );
    }
    renderOptions = (): JSX.Element =>
    {
        return (
            <>
                <Box title='Range' help={RangeHelp}>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.props.onChangeRangeFilter} />
                </Box>
                <Box title='X axis' help={XAxisHelp}>
                    <XAxisSelector project={this.props.project}
                                   settings={this.props.xAxisSettings}
                                   onChange={this.props.onChangeXAxisSettings} />
                </Box>
                <Box title='View list' help={ViewListHelp}>
                    <ViewSelection onEditView={this.setSelectedView} />
                </Box>
                <Box title='Settings' help={LineChartSettingsHelp}>
                    <LineChartSettingsComponent
                        settings={this.props.lineChartSettings}
                        onChangeSettings={this.props.updateLineChartSettings} />
                </Box>
            </>
        );
    }
    renderGraph = (): JSX.Element =>
    {
        const datasets = this.datasets(
            this.props.views,
            this.props.selectedViews
        );
        const view = this.props.views.find(v => v.id === this.state.selectedView) || null;

        return (
            <>
                <ChartToolbarWrapper>
                    {(ref, settings) =>
                        <LineChart
                            xAxis={this.props.xAxisSettings.xAxis}
                            responsive={settings.responsive}
                            height={400}
                            width={1000}
                            groupMode={this.state.groupMode}
                            settings={this.props.lineChartSettings}
                            onMeasurementsSelected={this.changeSelectedMeasurements}
                            datasets={datasets}
                            dateFormat={this.props.xAxisSettings.dateFormat}
                            sortMode={this.props.xAxisSettings.sortMode}
                            fitToDomain={settings.fitToDomain}
                            chartRef={ref} />
                    }
                </ChartToolbarWrapper>
                <ChartBottomPanel
                    view={view}
                    project={this.props.project}
                    selectedMeasurements={this.state.selectedMeasurements}
                    deselectView={this.deselectView}
                    deselectMeasurements={this.deselectMeasurements} />
            </>
        );
    }

    expandDatasets = (viewIds: string[]): LineChartDataset[] =>
    {
        return chain(viewId => {
            const view = this.props.views.find(v => v.id === viewId);
            if (view === undefined)
            {
                return [];
            }

            return view.yAxes.map(yAxis => ({
                name: `${view.name} (${formatKey(yAxis)})`,
                yAxis,
                measurements: view.measurements
            }));
        }, viewIds);
    }

    deselectMeasurements = () =>
    {
        this.changeSelectedMeasurements([]);
    }
    changeSelectedMeasurements = (selectedMeasurements: Measurement[]) =>
    {
        this.setState({ selectedMeasurements  });
    }

    setSelectedView = (selectedView: View) =>
    {
        this.setState({ selectedView: selectedView.id });
    }
    deselectView = () =>
    {
        this.setState({ selectedView: null });
    }
}

export const LineChartPage = withRouter(connect<StateProps, DispatchProps, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    views: getViews(state),
    selectedViews: getChartState(state).selectedViews,
    lineChartSettings: getChartState(state).lineChartSettings
}), {
    updateLineChartSettings
})(LineChartPageComponent));
