import { ZodTypeAny } from "zod";

declare global {
  namespace Express {
    interface Request {
      validated?: any;
    }
  }
}

export {};
