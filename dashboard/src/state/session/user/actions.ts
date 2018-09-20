import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../../lib/user/user';

const actionCreator = actionCreatorFactory('user');

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
export const loginUser = actionCreator.async<LoginUserParams, LoginUserResult>('login');

export interface ChangePasswordParams
{
    oldPassword: string;
    newPassword: string;
}
export const changePassword = actionCreator.async<ChangePasswordParams, boolean>('change-password');
