import ellipsize from 'ellipsize';
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

export class Tick extends PureComponent<Props>
{
    render()
    {
        const {width, height, x, y, fill, textAnchor} = this.props;
        const value = this.props.payload.value;

        return (
            <g>
                <text width={width} height={height} x={x} y={y} fill={fill}
                      textAnchor={textAnchor}>
                    <tspan x={x} dy='0.71em'>{ellipsize(value, 10)}</tspan>
                </text>
                <title>{value}</title>
            </g>
        );
    }
}
