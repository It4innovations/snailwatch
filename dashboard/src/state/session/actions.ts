import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('session');

export const initUserSession = actionCreator('init-user');
export const initProjectSession = actionCreator.async('init-project');
export const clearSession = actionCreator('clear');
