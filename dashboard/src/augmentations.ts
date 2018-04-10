import 'recharts';

declare module 'recharts' {
    interface XAxisProps {
        allowDuplicatedCategory?: boolean;
    }
}
