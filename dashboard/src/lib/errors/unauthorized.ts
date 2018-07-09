export class UnauthorizedError extends Error
{
    constructor()
    {
        super('You are unauthorized, please log in again');

        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
