import { notes, folders, type Note, type InsertNote, type Folder, type InsertFolder } from "@shared/schema";

export interface IStorage {
  // Notes
  getNotes(): Promise<Note[]>;
  getNotesByFolder(folderId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  searchNotes(query: string): Promise<Note[]>;
  
  // Folders
  getFolders(): Promise<Folder[]>; 
  getFolder(id: number): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private notes: Map<number, Note>;
  private folders: Map<number, Folder>;
  private noteCurrentId: number;
  private folderCurrentId: number;

  constructor() {
    this.notes = new Map();
    this.folders = new Map();
    this.noteCurrentId = 1;
    this.folderCurrentId = 1;
    
    // Create default "All Notes" folder
    this.createFolder({
      name: "All Notes",
      icon: "folder-open",
      sortOrder: 0
    });
    
    // Create a few default folders
    this.createFolder({
      name: "Work",
      icon: "folder",
      sortOrder: 1
    });
    
    this.createFolder({
      name: "Personal",
      icon: "folder",
      sortOrder: 2
    });
    
    this.createFolder({
      name: "Projects",
      icon: "folder",
      sortOrder: 3
    });
    
    // Create a sample note
    this.createNote({
      title: "Python - Notes and Packages",
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Python Development Resources" }]
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Essential Python Packages" }]
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "BeautifulSoup", marks: [{ type: "bold" }] },
                      { type: "text", text: " - HTML parsing and web scraping" }
                    ]
                  }
                ]
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Pandas", marks: [{ type: "bold" }] },
                      { type: "text", text: " - Data analysis and manipulation" }
                    ]
                  }
                ]
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Matplotlib", marks: [{ type: "bold" }] },
                      { type: "text", text: " - Data visualization and plotting" }
                    ]
                  }
                ]
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Flask", marks: [{ type: "bold" }] },
                      { type: "text", text: " - Lightweight web framework" }
                    ]
                  }
                ]
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "NumPy", marks: [{ type: "bold" }] },
                      { type: "text", text: " - Scientific computing and arrays" }
                    ]
                  }
                ]
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Django", marks: [{ type: "bold" }] },
                      { type: "text", text: " - Full-featured web framework" }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }),
      tags: ["python", "programming", "libraries"],
      folderId: 1
    });
  }

  // Notes Methods
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getNotesByFolder(folderId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.folderId === folderId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    const now = new Date();
    
    // Create the note object with proper null handling for optional fields
    const note: Note = { 
      id,
      title: insertNote.title,
      folderId: insertNote.folderId,
      content: insertNote.content || null,
      tags: insertNote.tags || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, updateData: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote: Note = {
      ...note,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  async searchNotes(query: string): Promise<Note[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.notes.values())
      .filter(note => 
        note.title.toLowerCase().includes(lowerQuery) || 
        (note.content && note.content.toLowerCase().includes(lowerQuery)) || 
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // Folders Methods
  async getFolders(): Promise<Folder[]> {
    return Array.from(this.folders.values()).sort((a, b) => {
      const aSortOrder = a.sortOrder || 0;
      const bSortOrder = b.sortOrder || 0;
      return aSortOrder - bSortOrder;
    });
  }

  async getFolder(id: number): Promise<Folder | undefined> {
    return this.folders.get(id);
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = this.folderCurrentId++;
    const folder: Folder = { 
      ...insertFolder, 
      id,
      icon: insertFolder.icon || null,
      sortOrder: insertFolder.sortOrder || null
    };
    this.folders.set(id, folder);
    return folder;
  }

  async updateFolder(id: number, updateData: Partial<InsertFolder>): Promise<Folder | undefined> {
    const folder = this.folders.get(id);
    if (!folder) return undefined;
    
    const updatedFolder: Folder = {
      ...folder,
      ...updateData
    };
    
    this.folders.set(id, updatedFolder);
    return updatedFolder;
  }

  async deleteFolder(id: number): Promise<boolean> {
    // Don't allow deleting the default "All Notes" folder
    if (id === 1) return false;
    
    // Move notes from this folder to "All Notes" folder
    this.notes.forEach((note, noteId) => {
      if (note.folderId === id) {
        this.notes.set(noteId, { ...note, folderId: 1 });
      }
    });
    
    return this.folders.delete(id);
  }
}

export const storage = new MemStorage();
