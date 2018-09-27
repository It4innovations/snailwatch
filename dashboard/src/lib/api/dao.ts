import moment, {Moment} from 'moment';
import {Dictionary, Functor, map} from 'ramda';
import {Omit} from '../../util/types';
import {Measurement} from '../measurement/measurement';
import {Project} from '../project/project';
import {User} from '../user/user';
import {Filter, Operator} from '../view/filter';
import {RangeFilter} from '../view/range-filter';
import {View, Watch} from '../view/view';
import {BatchedMeasurements} from './snail-client';

export interface DAO
{
    _id: string;
    _created: string;
}

export interface LoginResponseDAO extends DAO
{
    username: string;
    email: string;
    token: string;
}
export interface UserDAO extends DAO
{
    username: string;
    email: string;
}

export interface ProjectDAO extends DAO
{
    name: string;
    measurementKeys: string[];
    repository: string;
    commitKey: string;
    uploadToken: string;
}
export interface MeasurementDAO extends DAO
{
    benchmark: string;
    timestamp: string;
    environment: {};
    result: {};
}
export interface BatchedMeasurementsDAO
{
    measurements: Dictionary<MeasurementDAO>;
    views: Dictionary<string[]>;
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
    watches: Watch[];
}

export interface ArrayResponse<T>
{
    _items: T[];
}

export function parseLoginResponse(user: LoginResponseDAO): { user: User, token: string }
{
    return {
        user: {

            id: user._id,
            username: user.username,
            email: user.email,
        },
        token: user.token
    };
}
export function parseUser(user: UserDAO): User
{
    return {
        id: user._id,
        username: user.username,
        email: user.email
    };
}
export function serializeUser(user: User): Omit<UserDAO, keyof DAO>
{
    return {
        username: user.username,
        email: user.email
    };
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
        repository: project.repository,
        commitKey: project.commitKey,
        uploadToken: project.uploadToken,
        createdAt: moment(project._created)
    };
}

export function serializeProject(project: Project): Omit<ProjectDAO, keyof DAO | 'measurementKeys' | 'uploadToken'>
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
        environment: measurement.environment,
        result: measurement.result
    };
}
export function parseBatchedMeasurements(batched: BatchedMeasurementsDAO): BatchedMeasurements
{
    return {
        measurements: map(parseMeasurement, batched.measurements as {} as Functor<MeasurementDAO>) as
            {} as Dictionary<Measurement>,
        views: batched.views
    };
}

export function parseView(view: ViewDAO): View
{
    return {
        id: view._id,
        name: view.name,
        filters: view.filters.map(parseFilter),
        yAxes: view.yAxes,
        watches: view.watches,
        measurements: [],
        created: moment(view._created)
    };
}

export function serializeView(view: View): Omit<ViewDAO, keyof DAO>
{
    const { name, filters, yAxes, watches } = view;
    return { name, filters: filters.map(serializeFilter), yAxes, watches };
}

export function serializeDate(date: Moment): string
{
    return date.format('YYYY-MM-DDTHH:mm:ss');
}

export function serializeRangeFilter(rangeFilter: RangeFilter): {}
{
    if (rangeFilter.useDateFilter)
    {
        return {
            from: serializeDate(rangeFilter.from),
            to: serializeDate(rangeFilter.to)
        };
    }

    return {
        entryCount: rangeFilter.entryCount
    };
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
