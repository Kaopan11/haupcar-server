// An error that already knows its HTTP status.
export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    // Store the message on the Error object.
    super(message);

    // Store the status for the error handler.
    this.statusCode = statusCode;
  }
}
