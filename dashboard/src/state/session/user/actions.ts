import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../../lib/user/user';
import {createCrudActions} from '../../../util/crud';

const actionCreator = actionCreatorFactory('user');

export const UserActions = createCrudActions<User, string>('user');

export interface LoginUserParams
{
    username: string;
    password: string;
}
export interface LoginUserResult
{
    user: User;
    token: string;
}
export const loginUserAction = actionCreator.async<LoginUserParams, LoginUserResult>('login');

export interface ChangePasswordParams
{
    oldPassword: string;
    newPassword: string;
}
export const changePasswordAction = actionCreator.async<ChangePasswordParams, boolean>('change-password');
