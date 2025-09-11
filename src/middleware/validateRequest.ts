import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('Validating request body:', req.body);
      // Validate only the request body against the schema
      const result = await schema.safeParseAsync(req.body);
      if (!result.success) {
        throw result.error;
      }

      // Replace the body with the validated data
      req.body = result.data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      // For other errors, pass to the default error handler
      next(error);
    }
  };
};
