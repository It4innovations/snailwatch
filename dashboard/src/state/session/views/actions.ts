import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('views');

export const changeRangeFilterAction = actionCreator('changeRangeFilter');
