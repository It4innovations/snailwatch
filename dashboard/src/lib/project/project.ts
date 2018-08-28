import {default as moment, Moment} from 'moment';

export interface Project
{
    id: string;
    name: string;
    measurementKeys: string[];
    repository: string;
    commitKey: string;
    createdAt: Moment;
}

export function createProject(project: Partial<Project> = {}): Project
{
    return {
        id: '',
        name: '',
        repository: '',
        measurementKeys: [],
        commitKey: 'environment.commit',
        createdAt: moment(),
        ...project
    };
}
