// Core Models
export { User, UserRole, UserStatus } from "./User";
export {
  Project,
  ProjectStatus,
  ProjectCategory,
  ProjectPriority,
} from "./Project";
export { Task, TaskStatus, TaskPriority } from "./Task";
export {
  Message,
  MessageStatus,
  MessagePriority,
  MessageCategory,
} from "./Message";
export {
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketChannel,
} from "./SupportTicket";

// HR Models
export {
  Employee,
  Department,
  EmployeeStatus,
  EmploymentType,
} from "./Employee";
export {
  Job,
  JobStatus,
  JobType,
  ExperienceLevel as JobExperienceLevel,
} from "./Job";
export {
  JobApplication,
  ApplicationStatus,
  ExperienceLevel as ApplicationExperienceLevel,
} from "./JobApplication";

// System Models
export {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
} from "./Notification";

// Type exports
export type { IUser } from "./User";
export type { IProject } from "./Project";
export type { ITask } from "./Task";
export type { IMessage } from "./Message";
export type { ISupportTicket } from "./SupportTicket";
export type { IEmployee } from "./Employee";
export type { IJob } from "./Job";
export type { IJobApplication } from "./JobApplication";
export type { INotification } from "./Notification";
