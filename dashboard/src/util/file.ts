export function downloadFile(data: string, filename: string)
{
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export function downloadSVG(svg: SVGElement, filename: string)
{
    if (svg.getAttribute('xmlns') !== SVG_NAMESPACE)
    {
        const cloned: SVGElement = svg.cloneNode(true) as SVGElement;
        cloned.setAttribute('xmlns', SVG_NAMESPACE);
        downloadFile(cloned.outerHTML, filename);
        cloned.remove();
    }
    else downloadFile(svg.outerHTML, filename);
}
