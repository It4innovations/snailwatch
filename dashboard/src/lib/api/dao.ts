import {Operator} from '../view/filter';
import {Measurement} from '../measurement/measurement';
import moment from 'moment';
import {Project} from '../project/project';
import {View} from '../view/view';

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
export interface ViewDAO extends DAO
{
    name: string;
    xAxis: string;
    yAxis: string;
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
export function parseView(view: ViewDAO): View
{
    return {
        id: view._id,
        name: view.name,
        projection: {
            xAxis: view.xAxis,
            yAxis: view.yAxis
        },
        filters: view.filters.map(f => ({
            path: f.path,
            operator: f.operator,
            value: f.value
        }))
    };
}
