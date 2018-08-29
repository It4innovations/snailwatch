import {combineEpics} from 'redux-observable';
import {catchError, flatMap, switchMap} from 'rxjs/operators';
import {Action} from 'typescript-fsa';
import {View} from '../../../lib/view/view';
import {ofAction} from '../../../util/redux-observable';
import {createRequestEpic, handleActionError} from '../../../util/request';
import {AppEpic} from '../../app/app-epic';
import {addChartDatasetAction} from '../pages/chart-page/actions';
import {getRangeFilter} from '../pages/reducers';
import {getSelectedProject} from '../project/reducer';
import {getUser} from '../user/reducer';
import {ViewActions} from './actions';

const loadViews = createRequestEpic(ViewActions.load, (action, state, deps) =>
    deps.client.loadViews(getUser(state), getSelectedProject(state))
);

const createView: AppEpic = (action$, store, deps) =>
    action$.pipe(
        ofAction(ViewActions.create.started),
        switchMap((action: Action<View>) => {
            const state = store.value;
            const user = getUser(state);
            const project = getSelectedProject(state);

            return deps.client.createView(user, project, action.payload).pipe(
                flatMap(view => [
                    ViewActions.create.done({
                        params: action.payload,
                        result: view
                    }),
                    addChartDatasetAction.started({
                        rangeFilter: getRangeFilter(state),
                        view: view.id
                    })
                ]),
                catchError(error => handleActionError(ViewActions.create, action, error))
            );
        })
    );

const updateView = createRequestEpic(ViewActions.update, (action, state, deps) =>
    deps.client.updateView(getUser(state), action.payload)
);
const deleteView = createRequestEpic(ViewActions.delete, (action, state, deps) =>
    deps.client.deleteView(getUser(state), action.payload)
);

export const analysisEpics = combineEpics(
    loadViews,
    createView,
    updateView,
    deleteView
);
