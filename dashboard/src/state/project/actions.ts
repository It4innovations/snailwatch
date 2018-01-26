import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../lib/user/user';
import {Project} from '../../lib/project/project';

const actionCreator = actionCreatorFactory('project');

export const loadProjects = actionCreator.async<User, Project[]>('load');
