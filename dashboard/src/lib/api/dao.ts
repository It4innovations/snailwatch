import {Operator} from '../view/filter';

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
