import actionCreatorFactory, {AsyncActionCreators, Action, AnyAction, Failure, Meta, Success} from 'typescript-fsa';
import {compose} from 'ramda';
import {ReducerBuilder} from 'typescript-fsa-reducers';
import {hookRequestActions, Request} from './request';

interface OptionalCreator<P> {
    type: string;
    match: (action: AnyAction) => action is Action<P>;
    (payload?: P, meta?: Meta): Action<P>;
}

interface OptionalActionsCreator<P, S = {}, E = {}> {
    type: string;
    started: OptionalCreator<P>;
    done: OptionalCreator<Success<P, S>>;
    failed: OptionalCreator<Failure<P, E>>;
}

export interface CrudActionWrapper<T>
{
    load: OptionalActionsCreator<{}, T[], {}>;
    create: AsyncActionCreators<T, T, {}>;
    update: AsyncActionCreators<T, boolean, {}>;
    delete: AsyncActionCreators<T, boolean, {}>;
}

export function createCrudActions<T>(name: string): CrudActionWrapper<T>
{
    const creator = actionCreatorFactory(name);

    return {
        load: creator.async<{}, T[]>('load') as OptionalActionsCreator<{}, T[], {}>,
        create: creator.async<T, T>('create'),
        update: creator.async<T, boolean>('update'),
        delete: creator.async<T, boolean>('delete')
    };
}

export function createCrudReducer<State, Item extends {id: string}>(
    reducer: ReducerBuilder<State, State>,
    crudActions: CrudActionWrapper<Item>,
    itemKey: keyof State,
    requestSelector: (state: State) => Request): typeof reducer
{
    return compose(
        (r: typeof reducer) => hookRequestActions(r,
            crudActions.load,
            requestSelector,
            (state, action) => ({
                [itemKey]: [...action.payload.result]
            } as {} as State)
        ),
        (r: typeof reducer) => hookRequestActions(r,
            crudActions.create,
            requestSelector,
            (state, action) => ({
                [itemKey]: [...(state[itemKey] as {} as Item[]), action.payload.result]
            } as {} as State)
        ),
        (r: typeof reducer) => hookRequestActions(reducer,
            crudActions.update,
            requestSelector,
            (state, action) => ({
                [itemKey]: [...(state[itemKey] as {} as Item[]).filter(v => v.id !== action.payload.params.id),
                    action.payload.params]
            } as {} as State)
        ),
        (r: typeof reducer) => hookRequestActions(r,
            crudActions.delete,
            requestSelector,
            (state, action) => ({
                [itemKey]: (state[itemKey] as {} as Item[]).filter(v => v.id !== action.payload.params.id)
            } as {} as State)
        ))(reducer);
}
