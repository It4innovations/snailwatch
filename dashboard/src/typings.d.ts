declare module 'redux-persist';
declare module 'redux-persist/lib/storage';
declare module 'redux-persist/lib/integration/react';
declare module 'redux-catch';
declare module '*.scss';

declare module '*.json' {
    const value: {[key: string]: string};
    export default value;
}
