declare module 'redux-catch';
declare module 'react-hot-loader';
declare module 'express-static-gzip';
declare module 'ellipsize';
declare module 'react-syntax-highlighter/*';
declare module '@axetroy/react-download';
declare module 'react-bootstrap-toggle';
declare module '*.scss';

declare module '*.json' {
    const value: {[key: string]: string};
    export default value;
}

declare module 'react-day-picker/DayPickerInput' {
    import { DayPickerInput } from 'react-day-picker/types/DayPickerInput';
    export default DayPickerInput;
}
declare module 'react-day-picker/moment';
