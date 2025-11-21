import { Task } from "../models/task";

export interface OverdueInfo {
  count: number;
  tasks: Task[];
}