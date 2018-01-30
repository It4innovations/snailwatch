declare module 'redux-persist';
declare module 'redux-persist/*';
declare module 'redux-catch';
declare module '*.scss';

declare module '*.json' {
    const value: {[key: string]: string};
    export default value;
}
