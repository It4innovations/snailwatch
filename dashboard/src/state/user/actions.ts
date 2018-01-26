import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../lib/user/user';

const actionCreator = actionCreatorFactory('user');

export const loginUser = actionCreator.async<{
    username: string,
    password: string
}, User>('login');
export const logoutUser = actionCreator('logout');
