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
import {DateFormat} from '../date-format';
import {XAxisSelector} from '../x-axis-selector';
import {TrendsTable} from './trends-table';

interface OwnProps
{
    rangeFilter: RangeFilter;
    xAxis: string;
    dateFormat: DateFormat;
    onChangeRangeFilter(rangeFilter: RangeFilter): void;
    onChangeXAxis(xAxis: string): void;
    onChangeDateFormat(dateFormat: DateFormat): void;
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
                menuWidth='auto'
                content={this.renderContent}
                alignMenuToTop={false} />
        );
    }
    renderContent = (): JSX.Element =>
    {
        return (
            <TrendsTable
                views={this.props.views}
                measurements={this.props.measurements}
                project={this.props.project}
                axisX={this.props.xAxis}
                dateFormat={this.props.dateFormat}
                trendWindow={10} />
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
                                   xAxis={this.props.xAxis}
                                   dateFormat={this.props.dateFormat}
                                   onChangeXAxis={this.props.onChangeXAxis}
                                   onChangeDateFormat={this.props.onChangeDateFormat} />
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
