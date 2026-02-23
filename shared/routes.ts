
import { z } from 'zod';
import { insertFormSchema, forms } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  forms: {
    list: {
      method: 'GET' as const,
      path: '/api/forms' as const,
      responses: {
        200: z.array(z.custom<typeof forms.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/forms/:id' as const,
      responses: {
        200: z.custom<typeof forms.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/forms' as const,
      input: insertFormSchema,
      responses: {
        201: z.custom<typeof forms.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/forms/:id' as const,
      input: insertFormSchema.partial(),
      responses: {
        200: z.custom<typeof forms.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  submissions: {
    list: {
      method: 'GET' as const,
      path: '/api/forms/:formId/submissions' as const,
      responses: {
        200: z.array(z.custom<any>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/forms/:formId/submissions' as const,
      responses: {
        201: z.custom<any>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
