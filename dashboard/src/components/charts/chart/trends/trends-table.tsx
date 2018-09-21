import chroma from 'chroma-js';
import * as ellipsize from 'ellipsize';
import {Moment} from 'moment';
import React, {PureComponent} from 'react';
import ReactTable, {RowInfo} from 'react-table';
import styled from 'styled-components';
import {Measurement} from '../../../../lib/measurement/measurement';
import {Project} from '../../../../lib/project/project';
import {
    aggregateSum,
    aggregateSumDescribe,
    calculateRelPerformance,
    RelPerformance
} from '../../../../lib/trends/trends';
import {applyFilters} from '../../../../lib/view/filter';
import {View} from '../../../../lib/view/view';
import {compareDate} from '../../../../util/date';
import {compareNumber} from '../../../../util/math';
import {Help} from '../../../global/help';
import {MeasurementRecord} from '../../../global/measurement-record';
import {MeasurementGroup} from '../chart-utils';
import {CHART_DATE_FORMAT} from '../configuration';

interface Props
{
    views: View[];
    measurements: Measurement[];
    project: Project;
    axisX: string;
    trendWindow: number;
}

interface ViewGroup
{
    view: View;
    measurements: Measurement[];
    axisX: string;
    value: string;
    relPerformance: RelPerformance;
}

const ColorCell = styled.div<{ color: string; }>`
  background-color: ${props => props.color};
  color: #FFFFFF;
  padding: 7px 5px;
  text-shadow: 1px 1px 1px #000000;
`;
const Row = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
const HeaderHelp = styled(Help)`
  margin-left: 5px;
`;

function ChangeCell(selector: (view: ViewGroup) => number, window: number): React.SFC<{ value: ViewGroup }>
{
    return (props) => {
        const {relPerformance} = props.value;
        const observed = selector(props.value);
        if (observed === null || relPerformance.groups.length === 0) return <>N/A</>;

        const value = observed - 1;
        const text = `${(value * 100).toFixed(2)} %`;

        const min = -0.5;
        const max = 0.5;

        const clamped = Math.max(Math.min(value, max), min);
        const scaled = (clamped - min) / (max - min);
        const color = chroma.scale(['#27BC05', '#FFFFFF', '#9E092C']).mode('lab');
        const finalColor = color(scaled).darken(1.2).saturate(1.2).hex();

        const groups = relPerformance.groups;
        const rows: string[] = [];
        for (let i = 0; i < Math.min(window, groups.length); i++)
        {
            const group = groups[groups.length - (i + 1)];
            rows.push(`${group.x}: ${formatValue(aggregateSum(group))}`);
        }

        return (
            <ColorCell color={finalColor} title={rows.join('\n')}>
                {text}
            </ColorCell>
        );
    };
}

function formatValue(value: number): string
{
    return value.toFixed(2);
}


export class TrendsTable extends PureComponent<Props>
{
    render()
    {
        const data: ViewGroup[] = this.props.views.map(view => {
            const measurements = applyFilters(this.props.measurements, view.filters);
            const relPerformance = calculateRelPerformance(view, measurements, this.props.axisX,
                this.props.trendWindow, CHART_DATE_FORMAT);
            const groups = relPerformance.groups;

            return {
                relPerformance,
                view,
                measurements,
                groups,
                axisX: this.getAxisX(view, groups),
                value: this.getValue(view, groups),
            };
        }).filter(g => g.measurements.length !== 0);
        const style = {
            textAlign: 'center'
        };
        const columns = [{
            id: 'name',
            Header: 'View',
            style,
            filterable: true,
            accessor: (group: ViewGroup) => group.view.name
        },
        {
            id: 'group',
            Header: this.textWithHelp('Group', 'Value of the grouping attribute of the most recent group.'),
            style,
            Cell: this.ellipsizedCell(12),
            maxWidth: 150,
            filterable: true,
            accessor: (group: ViewGroup) => group.axisX
        },
        {
            id: 'observed',
            Header: this.textWithHelp('Observed', 'Attribute(s) whose value is observed (you can change this ' +
                'in the corresponding view.'),
            style,
            Cell: this.ellipsizedCell(12),
            maxWidth: 150,
            filterable: true,
            accessor: (group: ViewGroup) => aggregateSumDescribe(group.view)
        },
        {
            id: 'value',
            Header: this.textWithHelp('Value', 'Average value of the observed attribute of the most recent group.'),
            Cell: this.renderValue,
            style,
            accessor: (group: ViewGroup) => group
        },
        {
            ...this.createValueColumn('change'),
            accessor: (group: ViewGroup) => group,
            Header: this.textWithHelp('Change', 'Change relative to last group'),
            maxWidth: 160,
            Cell: ChangeCell(g => g.relPerformance.change, 2),
            sortMethod: (a: ViewGroup, b: ViewGroup) => compareNumber(a.relPerformance.change, b.relPerformance.change)
        },
        {
            ...this.createValueColumn('trend'),
            accessor: (group: ViewGroup) => group,
            Header: this.textWithHelp('Trend',
                `Change relative to the exponential average of the last ${this.props.trendWindow} groups`),
            maxWidth: 160,
            Cell: ChangeCell(g => g.relPerformance.trend, this.props.trendWindow),
            sortMethod: (a: ViewGroup, b: ViewGroup) => compareNumber(a.relPerformance.trend, b.relPerformance.trend)
        },
        {
            id: 'timestamp',
            Header: 'Last upload',
            style,
            accessor: (group: ViewGroup) => group.relPerformance.lastUpload,
            sortMethod: compareDate,
            Cell: this.renderDate
        }];

        return (
            <ReactTable
                data={data}
                noDataText='No views found'
                columns={columns}
                defaultPageSize={100}
                minRows={10}
                filterable={false}
                defaultSorted={[{
                    id: 'name'
                }]}
                SubComponent={this.renderMeasurements}
            />
        );
    }
    renderMeasurements = (rowInfo: RowInfo): JSX.Element =>
    {
        const group: ViewGroup = rowInfo['original'];
        const data = group.measurements;
        if (data.length === 0) return null;

        return (
            <ReactTable
                data={data}
                getTrProps={this.getMeasurementRowProps}
                columns={[{
                    id: 'name',
                    Header: 'Name',
                    accessor: (m: Measurement) => m.timestamp.format('DD. MM. YYYY HH:mm:ss')
                }]}
                defaultPageSize={10}
                minRows={4}
                noDataText='No measurements found'
                TheadComponent={this.renderMeasurementHeader}
                SubComponent={this.renderSubcomponent}
            />
        );
    }
    getMeasurementRowProps = () =>
    {
        return {
            style: {
                paddingLeft: '20px'
            }
        };
    }
    renderMeasurementHeader = (): JSX.Element =>
    {
        return null;
    }

    renderSubcomponent = (rowInfo: RowInfo): JSX.Element =>
    {
        const measurement: Measurement = rowInfo['original'];
        return <MeasurementRecord measurement={measurement} project={this.props.project} />;
    }

    renderValue = (props: {value: ViewGroup}): JSX.Element =>
    {
        return (
            <div title={aggregateSumDescribe(props.value.view)}>
                {props.value.value}
            </div>
        );
    }

    textWithHelp = (text: string, title: string) =>
    {
        return () => (
            <Row>
                <span>{text}</span>
                <HeaderHelp content={title} />
            </Row>
        );
    }
    ellipsizedCell = (length: number = 10) =>
    {
        return (props: { value: string}) => <div title={props.value}>{ellipsize(props.value, length)}</div>;
    }
    renderDate = (props: { value: Moment | null }) =>
    {
        if (props.value === null) return 'N/A';
        return props.value.format('DD. MM. YYYY HH:mm:ss');
    }

    createValueColumn = (id: string, header: string = '') =>
    {
        return {
            id,
            Header: header,
            style: {
                padding: 0,
                textAlign: 'center'
            }
        };
    }

    getValue = (view: View, groups: MeasurementGroup[]): string =>
    {
        if (groups.length === 0) return 'N/A';
        return formatValue(aggregateSum(groups[groups.length - 1]));
    }

    getAxisX = (view: View, groups: MeasurementGroup[]): string =>
    {
        if (groups.length === 0) return 'N/A';

        return groups[groups.length - 1].x;
    }
}
