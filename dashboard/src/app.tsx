import React, {PureComponent} from 'react';
import {Provider} from 'react-redux';
import {store, history, persistor} from './state/app/store';
import {ConnectedRouter} from 'react-router-redux';
import {Content} from './components/content/content';
import {PersistGate} from 'redux-persist/integration/react';
import {hot} from 'react-hot-loader';
import {Loading} from './components/global/loading';

class AppComponent extends PureComponent
{
    render()
    {
        return (
            <Provider store={store}>
                <PersistGate loading={<Loading />} persistor={persistor}>
                    <ConnectedRouter history={history}>
                        <Content />
                    </ConnectedRouter>
                </PersistGate>
            </Provider>
        );
    }
}

export const App = hot(module)(AppComponent);
