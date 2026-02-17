
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // GET /api/forms
  app.get(api.forms.list.path, async (req, res) => {
    const forms = await storage.getForms();
    res.json(forms);
  });

  // GET /api/forms/:id
  app.get(api.forms.get.path, async (req, res) => {
    const form = await storage.getForm(Number(req.params.id));
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  });

  // POST /api/forms
  app.post(api.forms.create.path, async (req, res) => {
    try {
      const input = api.forms.create.input.parse(req.body);
      const form = await storage.createForm(input);
      res.status(201).json(form);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // PUT /api/forms/:id
  app.put(api.forms.update.path, async (req, res) => {
    try {
      const input = api.forms.update.input.parse(req.body);
      const form = await storage.updateForm(Number(req.params.id), input);
      res.json(form);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      return res.status(404).json({ message: 'Form not found' });
    }
  });

  // POST /api/forms/save (Alias for Create/Update as requested)
  app.post('/api/forms/save', async (req, res) => {
    try {
      const body = req.body;
      if (body.id) {
        // Update
        const input = api.forms.update.input.parse(body);
        const form = await storage.updateForm(Number(body.id), input);
        res.json(form);
      } else {
        // Create
        const input = api.forms.create.input.parse(body);
        const form = await storage.createForm(input);
        res.status(201).json(form);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Initialize seed data
  await seedDatabase();

  return httpServer;
}

// Seed function to create an example form if none exist
export async function seedDatabase() {
  const forms = await storage.getForms();
  if (forms.length === 0) {
    await storage.createForm({
      title: "Contact Us",
      fields: [
        {
          id: "name-field",
          type: "text",
          label: "Full Name",
          placeholder: "John Doe",
          required: true
        },
        {
          id: "email-field",
          type: "text",
          label: "Email Address",
          placeholder: "john@example.com",
          required: true
        },
        {
          id: "message-field",
          type: "text", // Using text for simplicity, could add textarea later
          label: "Message",
          placeholder: "How can we help you?",
          required: true
        }
      ]
    });
    console.log("Seeded database with example form");
  }
}
