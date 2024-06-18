import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import {
  hasAuthorization,
  taskBelongsToProject,
  taskExists,
} from "../middleware/task";
import { authenticated } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router();

//?EVERY router will use this MIDDLEWARE
router.use(authenticated);

// CRUD STRUCTURE
router.post(
  "/",
  body("projectName").notEmpty().withMessage("Project name is required"),
  body("clientName").notEmpty().withMessage("Client name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  handleInputErrors,
  ProjectController.createProject
);
router.get("/", ProjectController.getAllProjects);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid project ID"),
  handleInputErrors,
  ProjectController.getProjectByID
);

router.param("projectId", projectExists);

router.put(
  "/:projectId",
  param("projectId").isMongoId().withMessage("Invalid project ID"),
  body("projectName").notEmpty().withMessage("Project name is required"),
  body("clientName").notEmpty().withMessage("Client name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
);

router.delete(
  "/:projectId",
  param("projectId").isMongoId().withMessage("Invalid project ID"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
);

/** TASK ROUTES */

router.post(
  "/:projectId/tasks",
  hasAuthorization,
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  handleInputErrors,
  TaskController.createTask
);

router.param("taskId", taskExists);
router.param("taskId", taskBelongsToProject);

router.get("/:projectId/tasks", TaskController.getProjectTasks);
router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  handleInputErrors,
  TaskController.getTaskByID
);

router.put(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  handleInputErrors,
  TaskController.updateTask
);

router.delete(
  "/:projectId/tasks/:taskId",
  hasAuthorization,
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  handleInputErrors,
  TaskController.deleteTask
);

router.put(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("Invalid task ID"),
  body("status").notEmpty().withMessage("Status is required"),
  handleInputErrors,
  TaskController.updateTaskStatus
);

//? ROUTES TEAM
router.post(
  "/:projectId/team/find",
  body("email").isEmail().toLowerCase().withMessage("Correo no valido"),
  handleInputErrors,
  TeamMemberController.findMemberByEmail
);

router.get("/:projectId/team", TeamMemberController.getMembers);

router.post(
  "/:projectId/team",
  body("id").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  TeamMemberController.addUserToProject
);

router.delete(
  "/:projectId/team/:userId",
  param("userId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  TeamMemberController.removeMemberById
);

//? ROUTES FOR NOTES
router.post(
  "/:projectId/tasks/:taskId/notes",
  body("content").notEmpty().withMessage("Contenido es requerido"),
  handleInputErrors,
  NoteController.createNote
);

router.get("/:projectId/tasks/:taskId/notes", NoteController.getTaskNotes);

router.delete(
  "/:projectId/tasks/:taskId/notes/:noteId",
  NoteController.deleteNote
);

export default router;
