import Download from '@axetroy/react-download';
import {sort} from 'ramda';
import React, {PureComponent} from 'react';
import MdDelete from 'react-icons/lib/md/delete';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import json from 'react-syntax-highlighter/languages/hljs/json';
import SyntaxHighlighter, {registerLanguage} from 'react-syntax-highlighter/light';
import {dracula} from 'react-syntax-highlighter/styles/hljs';
import ReactTable, {RowInfo} from 'react-table';
import {Button} from 'reactstrap';
import styled from 'styled-components';
import {exportCSV} from '../../lib/export/export';
import {Measurement} from '../../lib/measurement/measurement';
import {RangeFilter} from '../../lib/measurement/selection/range-filter';
import {Selection} from '../../lib/measurement/selection/selection';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {AppState} from '../../state/app/reducers';
import {changeRangeFilterAction} from '../../state/session/pages/actions';
import {
    deleteAllMeasurementsAction,
    deleteMeasurementAction,
    loadMeasurementsAction,
    setMeasurementsSelectionAction
} from '../../state/session/pages/measurements-page/actions';
import {getMeasurementsPageSelection} from '../../state/session/pages/measurements-page/reducer';
import {getRangeFilter} from '../../state/session/pages/reducers';
import {getSelectedProject} from '../../state/session/project/reducer';
import {getSelections} from '../../state/session/selection/reducer';
import {getUser} from '../../state/session/user/reducer';
import {Request} from '../../util/request';
import {RangeFilterSwitcher} from '../charts/range-filter-switcher';
import {SelectionSelectEditor} from '../charts/selection-container/selection-select-editor';
import {Box} from '../global/box';
import {ErrorBox} from '../global/error-box';
import {TwoColumnPage} from '../global/two-column-page';

registerLanguage('json', json);

interface StateProps
{
    user: User;
    project: Project;
    measurements: Measurement[];
    measurementRequest: Request;
    rangeFilter: RangeFilter;
    selections: Selection[];
    selection: Selection | null;
}

interface DispatchProps
{
    loadMeasurements(): void;
    deleteMeasurement(measurement: Measurement): void;
    deleteAllMeasurements(): void;
    changeRangeFilter(rangeFilter: RangeFilter): void;
    changeSelection(selectionId: string): void;
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
            this.setState(() => ({
                csvExport: exportCSV(this.props.measurements)
            }));
        }
        if (oldProps.selection !== this.props.selection ||
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
                <Box title='Selection'>
                    <SelectionSelectEditor
                        selections={this.props.selections}
                        selection={this.props.selection}
                        measurements={this.props.measurements}
                        onSelectSelection={this.changeSelection} />
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
                data={measurements}
                noDataText='No measurements found'
                columns={columns}
                loading={this.props.measurementRequest.loading}
                defaultPageSize={50}
                minRows={5}
                filterable={false}
                multiSort={false}
                sorted={[{
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
                    size={30}>Delete</DeleteIcon>
            </Expander>
        );
    }
    renderSubcomponent = (rowInfo: RowInfo): JSX.Element =>
    {
        const measurement: Measurement = rowInfo['original'];
        return (
            <SyntaxHighlighter language='json' style={dracula}>
                {JSON.stringify({
                    benchmark: measurement.benchmark,
                    timestamp: measurement.timestamp.format(DATETIME_FORMAT),
                    environment: measurement.environment,
                    result: measurement.result
                }, null, 2)}
            </SyntaxHighlighter>
        );
    }

    changeSelection = (selection: Selection) =>
    {
        this.props.changeSelection(selection === null ? null : selection.id);
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
    selections: getSelections(state),
    selection: getMeasurementsPageSelection(state)
}), ({
    loadMeasurements: () => loadMeasurementsAction.started({}),
    deleteMeasurement: deleteMeasurementAction.started,
    deleteAllMeasurements: () => deleteAllMeasurementsAction.started({}),
    changeRangeFilter: changeRangeFilterAction,
    changeSelection: setMeasurementsSelectionAction
}))(MeasurementListComponent));
