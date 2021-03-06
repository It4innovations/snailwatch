import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {RangeHelp, TrendGroupHelp} from '../../../../help';
import {Measurement} from '../../../../lib/measurement/measurement';
import {Project} from '../../../../lib/project/project';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {getGlobalMeasurements} from '../../../../state/session/pages/reducers';
import {getSelectedProject} from '../../../../state/session/project/reducers';
import {getViews} from '../../../../state/session/view/reducers';
import {Box} from '../../../global/box';
import {TwoColumnPage} from '../../../global/two-column-page';
import {RangeFilterSwitcher} from '../../range-filter/range-filter-switcher';
import {SubpageHeader} from '../../shared';
import {XAxisSelector} from '../x-axis-selector';
import {XAxisSettings} from '../x-axis-settings';
import {TrendsTable} from './trends-table';

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
    measurements: Measurement[];
}

type Props = OwnProps & StateProps & RouteComponentProps<void>;

class TrendsPageComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <TwoColumnPage
                menu={this.renderMenu}
                content={this.renderContent}
                alignMenuToTop={false} />
        );
    }
    renderContent = (): JSX.Element =>
    {
        return (
            <div>
                <SubpageHeader>Trends</SubpageHeader>
                <TrendsTable
                    views={this.props.views}
                    measurements={this.props.measurements}
                    project={this.props.project}
                    axisX={this.props.xAxisSettings.xAxis}
                    dateFormat={this.props.xAxisSettings.dateFormat}
                    trendWindow={10} />
            </div>
        );
    }
    renderMenu = (): JSX.Element =>
    {
        return (
            <>
                <Box title='Range' help={RangeHelp}>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.props.onChangeRangeFilter} />
                </Box>
                <Box title='Group by' help={TrendGroupHelp}>
                    <XAxisSelector project={this.props.project}
                                   settings={this.props.xAxisSettings}
                                   onChange={this.props.onChangeXAxisSettings} />
                </Box>
            </>
        );
    }
}

export const TrendsPage = withRouter(connect<StateProps, {}, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    views: getViews(state),
    measurements: getGlobalMeasurements(state)
}))(TrendsPageComponent));
