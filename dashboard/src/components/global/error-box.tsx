import React, {PureComponent} from 'react';
import {Alert} from 'reactstrap';

interface Props
{
    error: string | null;
}

const initialState = {
    opened: true
};

type State = Readonly<typeof initialState>;

export class ErrorBox extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    componentDidUpdate(prev: Props)
    {
        if (this.props.error !== prev.error)
        {
            this.setState({ opened: true });
        }
    }

    render()
    {
        if (!this.props.error) return null;

        return (
            <Alert color='danger'
                   isOpen={this.state.opened}
                   toggle={this.dismiss}>
                {this.props.error.toString()}
            </Alert>
        );
    }

    dismiss = () =>
    {
        this.setState({ opened: false });
    }
}
