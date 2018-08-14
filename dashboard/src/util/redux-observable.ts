import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {Action, ActionCreator, isType} from 'typescript-fsa';

export const ofAction = <P>(actionCreator: ActionCreator<P>) => (source: Observable<Action<P>>) => {
    return source.pipe(filter((action: Action<P>) => (isType(action, actionCreator))));
};
