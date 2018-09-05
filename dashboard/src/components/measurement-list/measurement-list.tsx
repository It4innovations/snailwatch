import Download from '@axetroy/react-download';
import React, {PureComponent} from 'react';
import MdDelete from 'react-icons/lib/md/delete';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import json from 'react-syntax-highlighter/languages/hljs/json';
import {registerLanguage} from 'react-syntax-highlighter/light';
import ReactTable, {RowInfo} from 'react-table';
import {Button} from 'reactstrap';
import styled from 'styled-components';
import {exportCSV} from '../../lib/export/export';
import {Measurement} from '../../lib/measurement/measurement';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {RangeFilter} from '../../lib/view/range-filter';
import {View} from '../../lib/view/view';
import {AppState} from '../../state/app/reducers';
import {changeRangeFilterAction} from '../../state/session/pages/actions';
import {
    deleteAllMeasurementsAction,
    deleteMeasurementAction,
    loadMeasurementsAction
} from '../../state/session/pages/measurements-page/actions';
import {getMeasurementsPageView} from '../../state/session/pages/measurements-page/reducer';
import {getRangeFilter} from '../../state/session/pages/reducers';
import {getSelectedProject} from '../../state/session/project/reducer';
import {getUser} from '../../state/session/user/reducer';
import {Request} from '../../util/request';
import {RangeFilterSwitcher} from '../charts/range-filter-switcher';
import {Box} from '../global/box';
import {ErrorBox} from '../global/error-box';
import {MeasurementRecord} from '../global/measurement-record';
import {TwoColumnPage} from '../global/two-column-page';

registerLanguage('json', json);

interface StateProps
{
    user: User;
    project: Project;
    measurements: Measurement[];
    measurementRequest: Request;
    rangeFilter: RangeFilter;
    view: View | null;
}

interface DispatchProps
{
    loadMeasurements(): void;
    deleteMeasurement(measurement: Measurement): void;
    deleteAllMeasurements(): void;
    changeRangeFilter(rangeFilter: RangeFilter): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const initialState = {
    csvExport: ''
};

type State = Readonly<typeof initialState>;

const DATETIME_FORMAT = 'DD. MM. YYYY HH:mm:ss';

const Expander = styled.div`
  display: flex;
  justify-content: center;
`;
const DeleteIcon = styled(MdDelete)`
  cursor: pointer;
`;

class MeasurementListComponent extends PureComponent<Props, State>
{
    readonly state: State = {
        csvExport: exportCSV([])
    };

    componentDidMount()
    {
        this.props.loadMeasurements();
    }
    componentDidUpdate(oldProps: Props)
    {
        if (oldProps.measurements !== this.props.measurements)
        {
            this.setState((state, props) => ({
                csvExport: exportCSV(props.measurements)
            }));
        }
        if (oldProps.view !== this.props.view ||
            oldProps.rangeFilter !== this.props.rangeFilter)
        {
            this.props.loadMeasurements();
        }
    }

    render()
    {
        const request = this.props.measurementRequest;
        return (
            <div>
                <TwoColumnPage
                    menu={this.renderMenu}
                    menuWidth='auto'
                    content={
                        <div>
                            <ErrorBox error={request.error} />
                            {this.renderMeasurements()}
                        </div>
                    } />
            </div>
        );
    }
    renderMenu = (): JSX.Element =>
    {
        return (
            <div>
                <Box title='Range'>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.props.changeRangeFilter} />
                </Box>
                <Box title='Export'>
                    <Download file='measurements.csv' content={this.state.csvExport}>
                        <Button>CSV</Button>
                    </Download>
                </Box>
                <Box title='Actions'>
                    <Button onClick={this.deleteAllMeasurements} color='danger'>Delete all data</Button>
                </Box>
            </div>
        );
    }
    renderMeasurements = (): JSX.Element =>
    {
        const columns = [{
            id: 'benchmark',
            Header: 'Benchmark',
            filterable: true,
            accessor: (m: Measurement) => m.benchmark
        }, {
            id: 'timestamp',
            Header: 'Date',
            filterable: true,
            accessor: (m: Measurement) => m.timestamp.format(DATETIME_FORMAT)
        }, {
            id: 'delete',
            Header: 'Delete',
            Cell: this.renderDeleteButton,
            accessor: (m: Measurement) => m,
            sortable: false,
            width: 60
        }];

        return (
            <ReactTable
                data={this.props.measurements}
                noDataText='No measurements found'
                columns={columns}
                loading={this.props.measurementRequest.loading}
                defaultPageSize={50}
                minRows={5}
                filterable={false}
                multiSort={false}
                defaultSorted={[{
                    id: 'timestamp',
                    desc: true
                }]}
                SubComponent={this.renderSubcomponent} />
        );
    }
    renderDeleteButton = (data: {original: Measurement}): JSX.Element =>
    {
        return (
            <Expander title='Delete measurement'>
                <DeleteIcon
                    onClick={() => this.deleteMeasurement(data.original)}
                    size={30}>
                    Delete
                </DeleteIcon>
            </Expander>
        );
    }
    renderSubcomponent = (rowInfo: RowInfo): JSX.Element =>
    {
        const measurement: Measurement = rowInfo['original'];
        return <MeasurementRecord measurement={measurement} project={this.props.project} />;
    }

    deleteMeasurement = (measurement: Measurement) =>
    {
        this.props.deleteMeasurement(measurement);
    }
    deleteAllMeasurements = () =>
    {
        const response = confirm('Do you really want to delete all measurements?');
        if (response)
        {
            this.props.deleteAllMeasurements();
        }
    }
}

export const MeasurementList = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    measurements: state.session.pages.measurementsPage.measurements,
    measurementRequest: state.session.pages.measurementsPage.measurementsRequest,
    rangeFilter: getRangeFilter(state),
    view: getMeasurementsPageView(state)
}), ({
    loadMeasurements: () => loadMeasurementsAction.started({}),
    deleteMeasurement: deleteMeasurementAction.started,
    deleteAllMeasurements: () => deleteAllMeasurementsAction.started({}),
    changeRangeFilter: changeRangeFilterAction,
}))(MeasurementListComponent));
