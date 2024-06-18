import type { Request, Response } from "express";
import { Note, INote } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
  noteId: Types.ObjectId;
};

export class NoteController {
  static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
    const { content } = req.body;
    const note = new Note();
    note.content = content;
    note.createdBy = req.user.id;
    note.task = req.task.id;

    req.task.notes.push(note.id);

    try {
      await Promise.allSettled([note.save(), req.task.save()]);
      res.send("Note created successfully!");
    } catch (error) {
      res.status(500).send("Failed to create note");
    }
  };

  static getTaskNotes = async (req: Request<{}, {}, INote>, res: Response) => {
    try {
      const notes = await Note.find({ task: req.task.id });
      res.json(notes);
    } catch (error) {
      res.status(500).send("Failed to fetch notes");
    }
  };

  static deleteNote = async (req: Request<NoteParams>, res: Response) => {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note) {
      const error = new Error("Note not found");
      res.status(404).json({ message: error.message });
      return;
    }

    if (note.createdBy.toString() !== req.user.id) {
      res.status(403).send("You are not allowed to delete this note");
      return;
    }

    req.task.notes = req.task.notes.filter(
      (noteId) => noteId.toString() !== note.id.toString()
    );

    try {
      await Promise.allSettled([req.task.save(), note.deleteOne()]);
      res.send("Note deleted successfully!");
    } catch (error) {
      res.status(500).send("Failed to delete notes");
    }
  };
}
