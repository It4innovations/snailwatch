import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../../lib/user/user';

const actionCreator = actionCreatorFactory('user');

export interface LoginUserParams
{
    username: string;
    password: string;
}
export const loginUser = actionCreator.async<LoginUserParams, User>('login');

export interface ChangePasswordParams
{
    oldPassword: string;
    newPassword: string;
}
export const changePassword = actionCreator.async<ChangePasswordParams, boolean>('change-password');
