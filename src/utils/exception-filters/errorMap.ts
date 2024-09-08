import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message;

    let formattedErrors: { [key: string]: string[] } = {};

    if (Array.isArray(message)) {
      // Extract validation errors if the message is an array
      message.forEach((error: ValidationError) => {
        if (error.constraints) {
          const fieldName = error.property;
          formattedErrors[fieldName] = Object.values(error.constraints);
        }
      });
    } else if (typeof message === 'object' && message.errors) {
      // Extract validation errors if the message contains an errors property
      formattedErrors = message.errors.reduce((acc, error: ValidationError) => {
        if (error.constraints) {
          const fieldName = error.property;
          acc[fieldName] = Object.values(error.constraints);
        }
        return acc;
      }, {});
    }

    response.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
}
