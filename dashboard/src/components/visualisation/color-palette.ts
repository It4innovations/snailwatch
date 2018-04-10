export class ColorPalette
{
    constructor(private colors: string[])
    {

    }

    getColor(index: number): string
    {
        return this.colors[index % this.colors.length];
    }
}
