import React, {PureComponent} from 'react';
import {Project} from '../../../lib/project/project';
import {Measurement} from '../../../lib/measurement/measurement';
import {User} from '../../../lib/user/user';
import {sort} from 'ramda';
import {
    LoadMeasurementParams, loadMeasurements, createLoadMeasurementParams,
    DeleteMeasurementParams, deleteMeasurement
} from '../../../state/measurement/actions';
import {connect} from 'react-redux';
import {Request, combineRequests} from '../../../util/request';
import {getUser} from '../../../state/user/reducer';
import {AppState} from '../../../state/app/reducers';
import {getSelectedProject} from '../../../state/project/reducer';
import {getMeasurements, getTotalMeasurements, MEASUREMENT_PAGE_SIZE} from '../../../state/measurement/reducer';
import {RouteComponentProps, withRouter} from 'react-router';
import ReactTable, {ControlledStateOverrideProps, RowInfo} from 'react-table';
import {createFilter, Filter} from '../../../lib/view/filter';
import {Button} from 'react-bootstrap';

interface StateProps
{
    user: User;
    project: Project;
    measurements: Measurement[];
    totalMeasurements: number;
    measurementRequests: Request;
}

interface DispatchProps
{
    loadMeasurements(params: LoadMeasurementParams): void;
    deleteMeasurement(params: DeleteMeasurementParams): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const DATETIME_FORMAT = 'DD. MM. YYYY HH:mm:ss';

class MeasurementListComponent extends PureComponent<Props>
{
    componentDidMount()
    {
        this.loadMeasurements();
    }

    render()
    {
        const request = this.props.measurementRequests;
        return (
            <div>
                {this.renderMeasurements()}
                {request.error && <div>{request.error}</div>}
            </div>
        );
    }

    renderMeasurements = () =>
    {
        const measurements = sort((m1: Measurement, m2: Measurement) =>
            m1.timestamp.isBefore(m2.timestamp) ? 1 : -1, this.props.measurements);

        const columns = [{
            id: 'benchmark',
            Header: 'Benchmark',
            filterable: true,
            accessor: (m: Measurement) => m.benchmark
        }, {
            id: 'timestamp',
            Header: 'Date',
            accessor: (m: Measurement) => m.timestamp.format(DATETIME_FORMAT)
        }, {
            id: 'delete',
            Header: 'Delete',
            Cell: (data: {original: Measurement}) => {
                return <Button bsStyle='danger' onClick={() => this.deleteMeasurement(data.original)}>Delete</Button>;
            },
            accessor: (m: Measurement) => m,
            sortable: false,
            width: 80
        }];

        return (
            <ReactTable
                data={measurements}
                noDataText='No measurements found'
                columns={columns}
                loading={this.props.measurementRequests.loading}
                showPageSizeOptions={false}
                defaultPageSize={MEASUREMENT_PAGE_SIZE}
                minRows={0}
                sortable={true}
                filterable={false}
                pages={Math.ceil(this.props.totalMeasurements / MEASUREMENT_PAGE_SIZE)}
                manual={true}
                multiSort={false}
                onFetchData={this.fetchData}
                SubComponent={this.renderSubcomponent} />
        );
    }
    renderSubcomponent = (rowInfo: RowInfo): JSX.Element =>
    {
        const measurement: Measurement = rowInfo['original'];
        return (
            <pre>
                {JSON.stringify({
                    benchmark: measurement.benchmark,
                    timestamp: measurement.timestamp.format(DATETIME_FORMAT),
                    environment: measurement.environment,
                    result: measurement.result
                }, null, 2)}
            </pre>
        );
    }

    fetchData = (state: ControlledStateOverrideProps, instance: {}) =>
    {
        const sortParam = state.sorted.map(s => (s.desc ? '-' : '') + s.id);
        const filters = state.filtered.map(filter => createFilter(filter.id, 'contains', filter.value));

        this.loadMeasurements(filters, sortParam.length > 0 ? sortParam[0] : '', state.page);
    }

    loadMeasurements = (filters: Filter[] = [], sortParam: string = '', page: number = null) =>
    {
        this.props.loadMeasurements(createLoadMeasurementParams({
            user: this.props.user,
            project: this.props.project,
            filters,
            sort: sortParam,
            page
        }));
    }
    deleteMeasurement = (measurement: Measurement) =>
    {
        this.props.deleteMeasurement({
            user: this.props.user,
            measurement
        });
    }
}

export const MeasurementList = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    measurements: getMeasurements(state),
    totalMeasurements: getTotalMeasurements(state),
    measurementRequests: combineRequests(
        state.measurement.loadMeasurementsRequest,
        state.measurement.deleteMeasurementRequest
    )
}), ({
    loadMeasurements: loadMeasurements.started,
    deleteMeasurement: deleteMeasurement.started
}))(MeasurementListComponent));
