import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('session');

export const clearSession = actionCreator('clear');
