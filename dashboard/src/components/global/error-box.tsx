import React, {PureComponent} from 'react';
import {Alert} from 'reactstrap';
import styled from 'styled-components';

interface Props
{
    error: string | null;
}

const initialState = {
    opened: true
};

type State = Readonly<typeof initialState>;

const ErrorAlert = styled(Alert)`
  margin-bottom: 0 !important;
  padding: 6px 28px 6px 6px !important;
  
  .close {
    padding: 6px !important;
  }
`;

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
            <ErrorAlert color='danger'
                   isOpen={this.state.opened}
                   toggle={this.dismiss}>
                {this.props.error.toString()}
            </ErrorAlert>
        );
    }

    dismiss = () =>
    {
        this.setState({ opened: false });
    }
}
