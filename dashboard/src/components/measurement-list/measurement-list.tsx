import React, {PureComponent} from 'react';
import MdDelete from 'react-icons/lib/md/delete';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import json from 'react-syntax-highlighter/languages/hljs/json';
import {registerLanguage} from 'react-syntax-highlighter/light';
import ReactTable, {RowInfo} from 'react-table';
import {Button, Input} from 'reactstrap';
import styled from 'styled-components';
import {API_SERVER} from '../../configuration';
import {Measurement} from '../../lib/measurement/measurement';
import {Project} from '../../lib/project/project';
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
import {getSelectedProject} from '../../state/session/project/reducers';
import {getToken} from '../../state/session/user/reducers';
import {Request} from '../../util/request';
import {RangeFilterSwitcher} from '../charts/range-filter/range-filter-switcher';
import {Box} from '../global/box';
import {ErrorBox} from '../global/error-box';
import {MeasurementRecord} from '../global/measurement-record';
import {TwoColumnPage} from '../global/two-column-page';
import {ExportHelp, RangeHelp} from '../../help';
import {ProjectGate} from '../project/project-gate';

registerLanguage('json', json);

interface StateProps
{
    token: string;
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

const DATETIME_FORMAT = 'DD. MM. YYYY HH:mm:ss';

const Expander = styled.div`
  display: flex;
  justify-content: center;
`;
const DeleteIcon = styled(MdDelete)`
  cursor: pointer;
`;
const ExportButton = styled(Button)`
  margin-top: 5px;
`;

class MeasurementListComponent extends PureComponent<Props>
{
    componentDidMount()
    {
        this.props.loadMeasurements();
    }
    componentDidUpdate(oldProps: Props)
    {
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
            <ProjectGate>
                <TwoColumnPage
                    menu={this.renderMenu}
                    menuWidth='auto'
                    content={
                        <div>
                            <ErrorBox error={request.error} />
                            {this.renderMeasurements()}
                        </div>
                    } />
            </ProjectGate>
        );
    }
    renderMenu = (): JSX.Element =>
    {
        return (
            <div>
                <Box title='Range' help={RangeHelp}>
                    <RangeFilterSwitcher
                        rangeFilter={this.props.rangeFilter}
                        onFilterChange={this.props.changeRangeFilter} />
                </Box>
                <Box title='Export' help={ExportHelp}>
                    {this.renderExport()}
                </Box>
                <Box title='Actions'>
                    <Button onClick={this.deleteAllMeasurements} color='danger'>Delete all data</Button>
                </Box>
            </div>
        );
    }
    renderExport = (): JSX.Element =>
    {
        return (
            <form method='post' action={`${API_SERVER}/projects/${this.props.project.id}/export-measurements`}>
                <input type='hidden' name='token' value={this.props.token} />
                <Input type='select' name='format' bsSize='sm'>
                    <option value='csv'>CSV</option>
                    <option value='json'>JSON</option>
                </Input>
                <ExportButton type='submit' title='Export all measurements'>Export</ExportButton>
            </form>
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
        const response = confirm('Do you really want to delete all ' +
        `measurements from ${this.props.project.name}?`);
        if (response)
        {
            this.props.deleteAllMeasurements();
        }
    }
}

export const MeasurementList = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    token: getToken(state),
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
