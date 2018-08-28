import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('app');

export const initAppAction = actionCreator('init');
