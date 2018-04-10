import React, {PureComponent} from 'react';
import ButtonGroup from 'reactstrap/lib/ButtonGroup';
import Button from 'reactstrap/lib/Button';

interface Props
{
    useFirst: boolean;
    firstLabel: string;
    secondLabel: string;
    firstComponent: JSX.Element;
    secondComponent: JSX.Element;
    onChange(useFirst: boolean): void;
}

export class Switch extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                <ButtonGroup>
                    <Button size='sm'
                            active={this.props.useFirst}
                            onClick={this.useFirst}>{this.props.firstLabel}</Button>
                    <Button size='sm'
                            active={!this.props.useFirst}
                            onClick={this.useSecond}>{this.props.secondLabel}</Button>
                </ButtonGroup>
                <div>
                    {this.props.useFirst ? this.props.firstComponent : this.props.secondComponent}
                </div>
            </div>
        );
    }

    useFirst = () =>
    {
        if (!this.props.useFirst)
        {
            this.props.onChange(true);
        }
    }
    useSecond = () =>
    {
        if (this.props.useFirst)
        {
            this.props.onChange(false);
        }
    }
}
