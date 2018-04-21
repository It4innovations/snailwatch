import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../../lib/user/user';
import {Project} from '../../../lib/project/project';
import {Selection} from '../../../lib/measurement/selection/selection';

const actionCreator = actionCreatorFactory('selection');

export interface LoadSelectionsParams
{
    user: User;
    project: Project;
}
export const loadSelectionsAction = actionCreator.async<LoadSelectionsParams, Selection[]>('load');

export interface CreateSelectionParams
{
    user: User;
    project: Project;
    selection: Selection;
}
export const createSelectionAction = actionCreator.async<CreateSelectionParams, Selection>('create');

export interface UpdateSelectionParams
{
    user: User;
    selection: Selection;
}
export const updateSelectionAction = actionCreator.async<UpdateSelectionParams, boolean>('update');

export type DeleteSelectionParams = UpdateSelectionParams;
export const deleteSelectionAction = actionCreator.async<DeleteSelectionParams, boolean>('delete');
