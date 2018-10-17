import React, {PureComponent} from 'react';

interface Props
{
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    textAnchor: string;
    payload: {
        value: string;
    };
}
interface DefaultProps {
    maxLength: number;
}

export class Tick extends PureComponent<Props & Partial<DefaultProps>>
{
    static defaultProps: DefaultProps = {
        maxLength: 30
    };

    render()
    {
        const {width, height, x, y, fill, textAnchor} = this.props;
        const value = this.props.payload.value;

        const shortened = this.shorten(value);

        return (
            <g>
                <text width={width} height={height} x={x} y={y} fill={fill}
                      textAnchor={textAnchor}>
                    <tspan x={x} dy='0.71em'>{shortened}</tspan>
                </text>
                <title>{value}</title>
            </g>
        );
    }

    shorten = (value: string): string =>
    {
        if (value.length < this.props.maxLength) return value;

        return `${value.substr(0, this.props.maxLength)}…`;
    }
}
