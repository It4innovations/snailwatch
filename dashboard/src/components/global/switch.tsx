import React, {PureComponent} from 'react';

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
                <div>
                    <input type='radio'
                           value='first'
                           required
                           checked={this.props.useFirst}
                           onChange={() => this.props.onChange(true)} />
                    <span>{this.props.firstLabel}</span>
                    <input type='radio'
                           value='second'
                           required
                           checked={!this.props.useFirst}
                           onChange={() => this.props.onChange(false)} />
                    <span>{this.props.secondLabel}</span>
                </div>
                <div>
                    {this.props.useFirst ? this.props.firstComponent : this.props.secondComponent}
                </div>
            </div>
        );
    }
}
