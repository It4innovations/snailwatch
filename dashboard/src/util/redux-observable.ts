import {ActionsObservable as ObservableOriginal} from 'redux-observable';
import {Action, ActionCreator, isType} from 'typescript-fsa';
import * as Redux from 'redux';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';

declare module 'redux-observable' {
    interface ActionsObservable<T extends Redux.Action> {
        ofAction<T, P>(action: ActionCreator<P>): ActionsObservable<Action<P>>;
    }
}

ObservableOriginal.prototype.ofAction =
function <P>(this: ObservableOriginal<Action<P>>, actionCreater: ActionCreator<P>): ObservableOriginal<Action<P>> {
    return this.filter((action: Action<P>) => (isType(action, actionCreater))) as ObservableOriginal<Action<P>>;
};
