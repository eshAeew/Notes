import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFolderSchema, insertNoteSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Notes Routes
  app.get("/api/notes", async (req: Request, res: Response) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error) {
      console.error("Error getting notes:", error);
      res.status(500).json({ message: "Failed to get notes" });
    }
  });

  app.get("/api/notes/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string || "";
      const notes = await storage.searchNotes(query);
      res.json(notes);
    } catch (error) {
      console.error("Error searching notes:", error);
      res.status(500).json({ message: "Failed to search notes" });
    }
  });

  app.get("/api/notes/folder/:folderId", async (req: Request, res: Response) => {
    try {
      const folderId = parseInt(req.params.folderId);
      if (isNaN(folderId)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }
      
      const notes = await storage.getNotesByFolder(folderId);
      res.json(notes);
    } catch (error) {
      console.error("Error getting notes by folder:", error);
      res.status(500).json({ message: "Failed to get notes by folder" });
    }
  });

  app.get("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      
      const note = await storage.getNote(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      console.error("Error getting note:", error);
      res.status(500).json({ message: "Failed to get note" });
    }
  });

  app.post("/api/notes", async (req: Request, res: Response) => {
    try {
      const result = insertNoteSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const note = await storage.createNote(result.data);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.put("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      
      // Allow partial updates
      const result = insertNoteSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedNote = await storage.updateNote(id, result.data);
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      
      const success = await storage.deleteNote(id);
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Folders Routes
  app.get("/api/folders", async (req: Request, res: Response) => {
    try {
      const folders = await storage.getFolders();
      res.json(folders);
    } catch (error) {
      console.error("Error getting folders:", error);
      res.status(500).json({ message: "Failed to get folders" });
    }
  });

  app.get("/api/folders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }
      
      const folder = await storage.getFolder(id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      res.json(folder);
    } catch (error) {
      console.error("Error getting folder:", error);
      res.status(500).json({ message: "Failed to get folder" });
    }
  });

  app.post("/api/folders", async (req: Request, res: Response) => {
    try {
      const result = insertFolderSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const folder = await storage.createFolder(result.data);
      res.status(201).json(folder);
    } catch (error) {
      console.error("Error creating folder:", error);
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  app.put("/api/folders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }
      
      // Allow partial updates
      const result = insertFolderSchema.partial().safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedFolder = await storage.updateFolder(id, result.data);
      if (!updatedFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      
      res.json(updatedFolder);
    } catch (error) {
      console.error("Error updating folder:", error);
      res.status(500).json({ message: "Failed to update folder" });
    }
  });

  app.delete("/api/folders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }
      
      const success = await storage.deleteFolder(id);
      if (!success) {
        return res.status(404).json({ message: "Folder not found or cannot be deleted" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
