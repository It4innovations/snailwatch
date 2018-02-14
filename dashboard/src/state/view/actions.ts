import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../lib/user/user';
import {Project} from '../../lib/project/project';
import {View} from '../../lib/view/view';

const actionCreator = actionCreatorFactory('view');

export interface LoadViewsParams
{
    user: User;
    project: Project;
}
export const loadViews = actionCreator.async<LoadViewsParams, View[]>('load-views');

export interface CreateViewParams
{
    user: User;
    project: Project;
    view: View;
}
export const createView = actionCreator.async<CreateViewParams, View>('create');

export interface UpdateViewParams
{
    user: User;
    view: View;
}
export const updateView = actionCreator.async<UpdateViewParams, boolean>('update');

export type DeleteViewParams = UpdateViewParams;
export const deleteView = actionCreator.async<DeleteViewParams, boolean>('delete');

export const selectView = actionCreator<string>('select');
