import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Action, ActionCreator, isType} from 'typescript-fsa';

export const ofAction = <P>(actionCreator: ActionCreator<P>) => (source: Observable<Action<P>>) => {
    return source.pipe(filter((action: Action<P>) => (isType(action, actionCreator))));
};
export const ofActions = (actionCreators: ActionCreator<{}>[]) => (source: Observable<Action<{}>>) => {
    return source.pipe(
        filter((action: Action<{}>) => (actionCreators.find(creator => isType(action, creator)) !== undefined))
    );
};

