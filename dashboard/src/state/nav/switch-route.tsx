import React, {PureComponent} from 'react';
import {Redirect, Route, RouteComponentProps, RouteProps, withRouter} from 'react-router';

interface Props
{
    usePrimaryRoute: boolean;
    redirect: string;
}

class SwitchRouteComponent extends PureComponent<Props & RouteProps & RouteComponentProps<void>>
{
    render()
    {
        const Component = this.props.component;
        return (
            <Route path={this.props.path} exact={this.props.exact} render={props => (
                this.props.usePrimaryRoute ? (<Component {...props} />) : (<Redirect to={this.props.redirect} />)
            )} />
        );
    }
}

export const SwitchRoute = withRouter(SwitchRouteComponent);
