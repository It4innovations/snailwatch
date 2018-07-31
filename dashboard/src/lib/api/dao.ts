import {Operator} from '../measurement/selection/filter';
import {Measurement} from '../measurement/measurement';
import moment, {Moment} from 'moment';
import {Project} from '../project/project';
import {Selection} from '../measurement/selection/selection';
import {View} from '../view/view';

export interface DAO
{
    _id: string;
    _created: string;
}

export interface UserDAO
{
    id: string;
    token: string;
}

export interface ProjectDAO extends DAO
{
    name: string;
    measurementkeys: string[];
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
    filters: {
        path: string;
        operator: Operator,
        value: string;
    }[];
}
export interface ViewDAO extends DAO
{
    name: string;
    selection: string;
    xAxis: string;
    yAxes: string[];
}

export interface ArrayResponse<T>
{
    _items: T[];
}

export function parseProject(project: ProjectDAO): Project
{
    return {
        id: project._id,
        name: project.name,
        measurementKeys: project.measurementkeys,
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
export function serializeSelection(selection: Selection): {}
{
    return {
        name: selection.name,
        filters: selection.filters.map(f => ({
            path: f.path,
            operator: f.operator,
            value: f.value
        }))
    };
}
export function parseView(view: ViewDAO): View
{
    return {
        id: view._id,
        name: view.name,
        selection: view.selection,
        xAxis: view.xAxis,
        yAxes: view.yAxes,
        created: moment(view._created)
    };
}
export function serializeView(view: View): {}
{
    return {
        name: view.name,
        selection: view.selection,
        xAxis: view.xAxis,
        yAxes: view.yAxes
    };
}

export function serializeDate(date: Moment): string
{
    return date.format('YYYY-MM-DDTHH:mm:ss');
}

export function where(args: {}): { where: string; }
{
    return {
        where: JSON.stringify(args)
    };
}
export function withProject<T extends {}>(project: Project, args: T = ({} as T)): T & { project: string; }
{
    return {
        ...(args as {}),
        project: project.id
    } as T & { project: string; };
}
