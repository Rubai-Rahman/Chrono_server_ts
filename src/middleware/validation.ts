import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      return res.status(400).send(e.errors);
    }
    return res.status(500).send('Internal Server Error');
  }
};

export default validate;
