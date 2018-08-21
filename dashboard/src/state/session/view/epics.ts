import {combineEpics} from 'redux-observable';
import {fromPromise} from 'rxjs/internal-compatibility';
import {catchError, flatMap, switchMap} from 'rxjs/operators';
import {Action} from 'typescript-fsa';
import {SnailClient} from '../../../lib/api/snail-client';
import {createSelection, Selection} from '../../../lib/measurement/selection/selection';
import {Project} from '../../../lib/project/project';
import {User} from '../../../lib/user/user';
import {View} from '../../../lib/view/view';
import {ofAction} from '../../../util/redux-observable';
import {createRequestEpic, handleActionError} from '../../../util/request';
import {AppEpic} from '../../app/app-epic';
import {addChartDatasetAction} from '../pages/chart-page/actions';
import {getRangeFilter} from '../pages/reducers';
import {getSelectedProject} from '../project/reducer';
import {SelectionActions} from '../selection/actions';
import {getUser} from '../user/reducer';
import {ViewActions} from './actions';

async function createViewWithSelection(user: User, project: Project,
                                       selection: Selection,
                                       view: View, client: SnailClient): Promise<{view: View, selection: Selection}>
{
    const newSelection = await client.createSelection(user, project, selection).toPromise();
    view = {
        ...view,
        selection: newSelection.id
    };
    return client.createView(user, project, view).toPromise().then(v => ({
        view: v,
        selection: newSelection
    }));
}

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

            const newSelection = createSelection({
                name: action.payload.name
            });
            const request = fromPromise(createViewWithSelection(user, project,
                newSelection, action.payload, deps.client));
            return request.pipe(
                flatMap(({ view, selection }) => [
                    ViewActions.create.done({
                        params: action.payload,
                        result: view
                    }),
                    SelectionActions.create.done({
                        params: { ...newSelection },
                        result: selection
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
