import React, {PureComponent} from 'react';
import {Measurement} from '../../../lib/measurement/measurement';
import ReactTable, {RowInfo} from 'react-table';
import {sort} from 'ramda';
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/light';
import {dracula} from 'react-syntax-highlighter/styles/hljs';
import json from 'react-syntax-highlighter/languages/hljs/json';

registerLanguage('json', json);

interface Props
{
    measurements: Measurement[];
}

const DATETIME_FORMAT = 'DD. MM. YYYY HH:mm:ss';

export class MeasurementList extends PureComponent<Props>
{
    render()
    {
        const measurements = sort((m1: Measurement, m2: Measurement) =>
            m1.timestamp.isBefore(m2.timestamp) ? 1 : -1, this.props.measurements);

        const columns = [{
            id: 'benchmark',
            Header: 'Benchmark',
            accessor: (m: Measurement) => m.benchmark
        }, {
            id: 'timestamp',
            Header: 'Date',
            accessor: (m: Measurement) => m.timestamp.format(DATETIME_FORMAT)
        }];

        return (
            <ReactTable
                data={measurements}
                noDataText='No measurements selected'
                columns={columns}
                minRows={5}
                defaultPageSize={10}
                sortable={true}
                filterable={false}
                multiSort={false}
                defaultSorted={[{ id: 'timestamp' }]}
                SubComponent={this.renderSubcomponent} />
        );
    }
    renderSubcomponent = (rowInfo: RowInfo): JSX.Element =>
    {
        const measurement: Measurement = rowInfo['original'];
        return (
            <SyntaxHighlighter language='json' style={dracula}>
                {JSON.stringify({
                    id: measurement.id,
                    benchmark: measurement.benchmark,
                    timestamp: measurement.timestamp.format(DATETIME_FORMAT),
                    environment: measurement.environment,
                    result: measurement.result
                }, null, 2)}
            </SyntaxHighlighter>
        );
    }
}
