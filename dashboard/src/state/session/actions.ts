import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('session');

export const initUserSession = actionCreator('init-user');
export const initProjectSession = actionCreator('init-project');
export const clearSession = actionCreator('clear');
