import type { Request, Response } from "express";
import Task from "../models/Task";
import { IProject } from "../models/Project";

//? TO ADD IN req THE PROJECT
declare global {
  namespace Express {
    interface Request {
      project: IProject;
    }
  }
}

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      task.project = req.project.id; //AGREGAR EL ID(FOREIGN KEY)
      req.project.tasks.push(task.id);
      await Promise.allSettled([task.save(), req.project.save()]);
      res.send("Task created successfully!");
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate(
        "project"
      );
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static getTaskByID = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id)
        .populate({
          path: "completedBy.user",
          select: "id name email",
        })
        .populate({
          path: "notes",
          populate: {
            path: "createdBy",
            select: "id name email",
          },
        });
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      req.task.name = req.body.name;
      req.task.description = req.body.description;
      await req.task.save();

      res.send("Task updated successfully!");
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static updateTaskStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      req.task.status = status;

      const completedByData = {
        user: req.user.id,
        status,
      };

      // if (status === "pending") {
      //   req.task.completedBy = null;
      // } else {
      //   req.task.completedBy = req.user.id;
      // }
      req.task.completedBy.push(completedByData);
      await req.task.save();

      res.send("Task status updated successfully!");
    } catch (error) {
      res.status(500).json({ error: "Invalid Status" });
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      req.project.tasks = req.project.tasks.filter(
        (id) => id.toString() !== req.task.id.toString()
      );

      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);

      res.send("Task deleted successfully!");
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };
}
