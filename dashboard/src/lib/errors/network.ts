export class NetworkError extends Error
{
    constructor()
    {
        super('Cannot connect to the server');

        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
