import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('session');

export const initSession = actionCreator('init');
export const clearSession = actionCreator('clear');
