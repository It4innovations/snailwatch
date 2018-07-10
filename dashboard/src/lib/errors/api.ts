export class ApiError extends Error
{
    constructor(private _status: number, message: string)
    {
        super(message);

        Object.setPrototypeOf(this, ApiError.prototype);
    }

    get status(): number
    {
        return this._status;
    }
}
