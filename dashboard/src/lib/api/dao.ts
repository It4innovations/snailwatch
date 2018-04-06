import {Operator} from '../measurement/selection/filter';
import {Measurement} from '../measurement/measurement';
import moment, {Moment} from 'moment';
import {Project} from '../project/project';
import {Selection} from '../measurement/selection/selection';

export interface DAO
{
    _id: string;
    _created: string;
}

export interface ProjectDAO extends DAO
{
    name: string;
}
export interface MeasurementDAO extends DAO
{
    benchmark: string;
    timestamp: string;
    environment: {};
    result: {};
}
export interface SelectionDAO extends DAO
{
    name: string;
    filters: Array<{
        path: string;
        operator: Operator,
        value: string;
    }>;
}

export function parseProject(project: ProjectDAO): Project
{
    return {
        id: project._id,
        name: project.name,
        createdAt: moment(project._created)
    };
}
export function parseMeasurement(measurement: MeasurementDAO): Measurement
{
    return {
        id: measurement._id,
        benchmark: measurement.benchmark,
        timestamp: moment(measurement.timestamp),
        environment: {...measurement.environment},
        result: {...measurement.result}
    };
}
export function parseSelection(selection: SelectionDAO): Selection
{
    return {
        id: selection._id,
        name: selection.name,
        filters: selection.filters.map(f => ({
            path: f.path,
            operator: f.operator,
            value: f.value
        }))
    };
}

export function serializeDate(date: Moment): string
{
    return date.format('YYYY-MM-DDTHH:mm:ss');
}
