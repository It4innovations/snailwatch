import {combineEpics} from 'redux-observable';
import {from} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ofAction} from '../../util/redux-observable';
import {initProjectSession, initUserSession} from '../session/actions';
import {sessionEpics} from '../session/epics';
import {initAppAction} from './actions';
import {AppEpic} from './app-epic';

const initAppEpic: AppEpic = action$ =>
    action$.pipe(
        ofAction(initAppAction),
        switchMap(() => from([
            initUserSession(),
            initProjectSession.started({})
        ]))
    );

export const rootEpic: AppEpic = combineEpics(
    initAppEpic,
    sessionEpics
);
