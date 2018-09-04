import moment, {Moment} from 'moment';
import {Measurement} from '../measurement/measurement';
import {Project} from '../project/project';
import {Filter, Operator} from '../view/filter';
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
    measurementKeys: string[];
    repository: string;
    commitKey: string;
}
export interface MeasurementDAO extends DAO
{
    benchmark: string;
    timestamp: string;
    environment: {};
    result: {};
}
export interface ViewDAO extends DAO
{
    name: string;
    filters: {
        path: string;
        operator: Operator,
        value: string;
    }[];
    yAxes: string[];
}

export interface ArrayResponse<T>
{
    _items: T[];
}

export function parseFilter(filter: Filter): Filter
{
    return { ...filter };
}
export function serializeFilter(filter: Filter): Filter
{
    return { ...filter };
}

export function parseProject(project: ProjectDAO): Project
{
    return {
        id: project._id,
        name: project.name,
        measurementKeys: project.measurementKeys,
        repository: project.repository || '',
        commitKey: project.commitKey || '',
        createdAt: moment(project._created)
    };
}
export function serializeProject(project: Project): Partial<ProjectDAO>
{
    return {
        name: project.name,
        repository: project.repository,
        commitKey: project.commitKey
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

export function parseView(view: ViewDAO): View
{
    return {
        id: view._id,
        name: view.name,
        filters: view.filters.map(parseFilter),
        yAxes: view.yAxes,
        measurements: [],
        created: moment(view._created)
    };
}
export function serializeView(view: View): Partial<ViewDAO>
{
    const { name, filters, yAxes } = view;
    return { name, filters: filters.map(serializeFilter), yAxes };
}

export function serializeDate(date: Moment): string
{
    return date.format('YYYY-MM-DDTHH:mm:ss');
}

export function where<T extends {}>(args: {}, obj: T = ({} as T)): T & { where: string; }
{
    return {
        ...(obj as {}),
        where: JSON.stringify(args)
    } as T & { where: string; };
}
export function sort<T extends {}>(prop: string, obj: T = ({} as T)): T & { sort: string; }
{
    return {
        ...(obj as {}),
        sort: prop
    } as T & { sort: string; };
}
export function withProject<T extends {}>(project: Project, args: T = ({} as T)): T & { project: string; }
{
    return {
        ...(args as {}),
        project: project.id
    } as T & { project: string; };
}
