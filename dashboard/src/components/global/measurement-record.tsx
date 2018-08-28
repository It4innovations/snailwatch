import {lensPath, view} from 'ramda';
import React, {PureComponent} from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/light';
import {dracula} from 'react-syntax-highlighter/styles/hljs';
import {Measurement} from '../../lib/measurement/measurement';
import {Project} from '../../lib/project/project';

interface Props
{
    project: Project;
    measurement: Measurement;
}

const DATETIME_FORMAT = 'DD. MM. YYYY HH:mm:ss';

export class MeasurementRecord extends PureComponent<Props>
{
    private wrapper: React.RefObject<HTMLDivElement> = React.createRef();

    componentDidMount()
    {
        const {measurement, project} = this.props;

        if (project.repository !== '' && project.commitKey !== '')
        {
            const path = lensPath(project.commitKey.split('.'));
            const commit = view(path, measurement);
            if (commit !== undefined)
            {
                const url = `${this.addSlash(project.repository.trim())}commit/${commit}`;
                const lines = this.wrapper.current.querySelectorAll('span');
                for (let i = 0; i < lines.length; i++)
                {
                    const line = lines[i];
                    if (line.textContent === `"${commit}"`)
                    {
                        line.innerHTML = `<a href='${url}' target='_blank'>${commit}</a>`;
                    }
                }
            }
        }
    }

    render()
    {
        const {measurement} = this.props;
        const json = JSON.stringify({
            id: measurement.id,
            benchmark: measurement.benchmark,
            timestamp: measurement.timestamp.format(DATETIME_FORMAT),
            environment: measurement.environment,
            result: measurement.result
        }, null, 2);

        return (
            <div ref={this.wrapper}>
                <SyntaxHighlighter language='json' style={dracula}>
                    {json}
                </SyntaxHighlighter>
            </div>
        );
    }

    addSlash = (url: string): string =>
    {
        if (url === '') return '';
        if (url[url.length - 1] !== '/') return `${url}/`;
        return url;
    }
}
