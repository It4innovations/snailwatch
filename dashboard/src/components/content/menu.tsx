import React, {PureComponent} from 'react';
import {Navigation, Routes} from '../../state/nav/routes';
import {Link} from 'react-router-dom';
import {RouteComponentProps, withRouter} from 'react-router';
import {Button} from 'react-bootstrap';

interface Props
{
    authenticated: boolean;
    onLogout: () => void;
}

class MenuComponent extends PureComponent<Props & RouteComponentProps<void>>
{
    render()
    {
        return (
            <ul className='nav nav-pills'>
                {this.publicLink('Login', Navigation.Login)}
                {this.authLink('Projects', Navigation.Projects)}
                {this.props.authenticated && <Button onClick={this.props.onLogout}>Sign out</Button>}
            </ul>
        );
    }

    authLink(name: string, path: string): JSX.Element
    {
        if (!this.props.authenticated) return null;
        return this.link(name, path);
    }
    publicLink(name: string, path: string): JSX.Element
    {
        if (this.props.authenticated) return null;
        return this.link(name, path);
    }

    link(name: string, path: string): JSX.Element
    {
        return (
            <li>
                <Link to={path}>{name}</Link>
            </li>
        );
    }
}

export const Menu = withRouter(MenuComponent);
