import React, {PureComponent} from 'react';
import {hot} from 'react-hot-loader';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {Content} from './components/content/content';
import {Loading} from './components/global/loading';
import {history, persistor, store} from './state/app/store';

class AppComponent extends PureComponent
{
    render()
    {
        return (
            <Provider store={store}>
                <PersistGate loading={<Loading />} persistor={persistor}>
                    <ConnectedRouter history={history}>
                        <React.StrictMode>
                            <Content />
                        </React.StrictMode>
                    </ConnectedRouter>
                </PersistGate>
            </Provider>
        );
    }
}

export const App = hot(module)(AppComponent);
