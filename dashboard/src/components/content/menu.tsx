import React, {PureComponent} from 'react';
import {Navigation, projectRoute} from '../../state/nav/routes';
import {RouteComponentProps, withRouter} from 'react-router';
import {Button, Navbar, NavbarBrand, NavItem, Nav} from 'reactstrap';
import {Project} from '../../lib/project/project';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

interface Props
{
    authenticated: boolean;
    selectedProject: Project | null;
    onLogout(): void;
}

const Appbar = styled(Navbar)`
  margin-bottom: 5px;
  border-bottom: 1px solid #000000;
`;

class MenuComponent extends PureComponent<Props & RouteComponentProps<void>>
{
    render()
    {
        return (
            <Appbar expand='md'>
                <NavbarBrand>Snailwatch</NavbarBrand>
                <Nav navbar>
                    {this.publicLink('Login', Navigation.Login)}
                    {this.props.authenticated && this.createAuthenticatedLinks()}
                </Nav>
                {this.props.authenticated && <Button onClick={this.props.onLogout}>Sign out</Button>}
            </Appbar>
        );
    }

    createAuthenticatedLinks = (): JSX.Element =>
    {
        const links: JSX.Element[] = [];
        links.push(this.authLink('Profile', Navigation.Profile));

        if (this.props.selectedProject === null)
        {
            links.push(this.authLink('Projects', Navigation.Projects));
        }
        else links.push(this.authLink('Overview', projectRoute(this.props.selectedProject.name)));

        return <>{links}</>;
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
            <NavItem key={name}>
                <Link to={path}>{name}</Link>
            </NavItem>
        );
    }
}

export const Menu = withRouter(MenuComponent);
