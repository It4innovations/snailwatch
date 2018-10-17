import React, {PureComponent, RefObject} from 'react';
import ReactDOM from 'react-dom';
import FaArrows from 'react-icons/lib/fa/arrows';
import FaDownload from 'react-icons/lib/fa/download';
import FaExpand from 'react-icons/lib/fa/expand';
import {Button, ButtonGroup} from 'reactstrap';
import {downloadSVG} from '../../../../util/file';
import {ToolbarSettings} from './toolbar-settings';

interface Props
{
    settings: ToolbarSettings;
    chartRef: RefObject<React.Component<{}>>;
    className?: string;
    onChange(settings: ToolbarSettings): void;
}

export class ChartToolbar extends PureComponent<Props>
{
    render()
    {
        return (
            <ButtonGroup className={this.props.className}>
                <Button active={this.props.settings.responsive}
                        onClick={this.toggle('responsive')}
                        title='Fill available width'>
                    <FaExpand />
                </Button>
                <Button active={this.props.settings.fitToDomain}
                        onClick={this.toggle('fitToDomain')}
                        title='Fit chart domain to displayed data'>
                    <FaArrows />
                </Button>
                <Button onClick={this.download}
                        title='Download chart'>
                    <FaDownload />
                </Button>
            </ButtonGroup>
        );
    }

    toggle = (attribute: keyof ToolbarSettings) => () => {
        this.props.onChange({
            ...this.props.settings,
            [attribute]: !this.props.settings[attribute]
        });
    }

    download = () =>
    {
        const ref = this.props.chartRef.current;
        if (!ref) return;

        const container = ReactDOM.findDOMNode(this.props.chartRef.current);
        const chart: SVGElement = container.querySelector('svg');

        downloadSVG(chart, 'chart.svg');
    }
}
