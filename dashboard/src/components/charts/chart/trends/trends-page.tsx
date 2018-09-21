import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {Measurement} from '../../../../lib/measurement/measurement';
import {Project} from '../../../../lib/project/project';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';
import {AppState} from '../../../../state/app/reducers';
import {getGlobalMeasurements} from '../../../../state/session/pages/reducers';
import {getSelectedProject} from '../../../../state/session/project/reducer';
import {getViews} from '../../../../state/session/view/reducer';
import {Box} from '../../../global/box';
import {MeasurementKeys} from '../../../global/keys/measurement-keys';
import {TwoColumnPage} from '../../../global/two-column-page';
import {RangeHelp, TrendGroupHelp} from '../../../../strings';
import {RangeFilterSwitcher} from '../../range-filter/range-filter-switcher';
import {TrendsTable} from './trends-table';

interface OwnProps
{
    rangeFilter: RangeFilter;
    onChangeRangeFilter(rangeFilter: RangeFilter): void;
}
interface StateProps
{
    project: Project;
    views: View[];
    measurements: Measurement[];
}

type Props = OwnProps & StateProps & RouteComponentProps<void>;

const initialState = {
    xAxis: '',
};
type State = Readonly<typeof initialState>;

class TrendsPageComponent extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    render()
    {
        return (
            <TwoColumnPage
                menu={this.renderMenu}
                menuWidth='auto'
                content={this.renderContent} />
        );
    }
    renderContent = (): JSX.Element =>
    {
        return (
            <TrendsTable
                views={this.props.views}
                measurements={this.props.measurements}
                project={this.props.project}
                axisX={this.state.xAxis}
                trendWindow={5} />
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
                    <MeasurementKeys value={this.state.xAxis}
                                     project={this.props.project}
                                     onChange={this.changeXAxis} />
                </Box>
            </>
        );
    }

    changeXAxis = (xAxis: string) =>
    {
        this.setState({ xAxis });
    }
}

export const TrendsPage = withRouter(connect<StateProps, {}, OwnProps>((state: AppState) => ({
    project: getSelectedProject(state),
    views: getViews(state),
    measurements: getGlobalMeasurements(state)
}))(TrendsPageComponent));
