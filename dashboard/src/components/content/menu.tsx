import React, {PureComponent} from 'react';
import {Navigation} from '../../state/nav/routes';
import {RouteComponentProps, withRouter} from 'react-router';
import {Button, Navbar, NavbarBrand, NavItem, NavLink, Nav} from 'reactstrap';

import style from './menu.scss';

interface Props
{
    authenticated: boolean;
    onLogout(): void;
}

class MenuComponent extends PureComponent<Props & RouteComponentProps<void>>
{
    render()
    {
        return (
            <Navbar expand='md' className={style.navbar}>
                <NavbarBrand>Snailwatch</NavbarBrand>
                <Nav navbar>
                    {this.publicLink('Login', Navigation.Login)}
                    {this.authLink('Projects', Navigation.Projects)}
                </Nav>
                {this.props.authenticated && <Button onClick={this.props.onLogout}>Sign out</Button>}
            </Navbar>
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
            <NavItem>
                <NavLink href={path}>{name}</NavLink>
            </NavItem>
        );
    }
}

export const Menu = withRouter(MenuComponent);
