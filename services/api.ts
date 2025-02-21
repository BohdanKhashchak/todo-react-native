import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";

import { Task } from "@/constants/types";

const API_URL = "https://jsonplaceholder.typicode.com/todos";
const TASKS_STORAGE_KEY = "offline_tasks";

export const fetchTasks = async (_limit: number) => {
  try {
    const response = await axios.get(`${API_URL}?_limit=${_limit}`);
    const serverTasks = response.data;

    //offline support
    const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    const localTasks = storedTasks ? JSON.parse(storedTasks) : [];

    const mergedTasks = [
      ...serverTasks,
      ...localTasks.filter((task: Task) => task.offline),
    ];

    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(mergedTasks));

    return mergedTasks;
  } catch (error) {
    console.error("Error fetching tasks, loading from storage:", error);
    const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
  }
};

export const addTask = async (title: string) => {
  try {
    const response = await axios.post(API_URL, { title, completed: false });
    return response.data;
  } catch (error) {
    console.error("Error adding task, saving locally:", error);
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
      offline: true,
      new: true,
    };

    const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);

    const tasks = storedTasks ? JSON.parse(storedTasks) : [];

    tasks.unshift(newTask);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    return newTask;
  }
};

export const updateTaskStatus = async (id: number, completed: boolean) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, { completed });
    return response.data;
  } catch (error) {
    console.error("Error updating task, modifying locally:", error);

    const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (storedTasks) {
      let tasks = JSON.parse(storedTasks);
      tasks = tasks.map((task: Task) =>
        task.id === id
          ? { ...task, completed, offline: true, new: false }
          : task
      );

      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
    return { id, completed };
  }
};

export const deleteTask = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting task, removing locally:", error);

    const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (storedTasks) {
      const tasks = JSON.parse(storedTasks).filter(
        (task: Task) => task.id !== id
      );

      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }
    return false;
  }
};

export const syncOfflineTasks = async () => {
  const isConnected = (await NetInfo.fetch()).isConnected;
  if (!isConnected) return;

  const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
  if (!storedTasks) return;

  const tasks = JSON.parse(storedTasks);
  const offlineTasks = tasks.filter((task: Task) => task.offline);

  for (const task of offlineTasks) {
    try {
      if (task.new) {
        const { data } = await axios.post(API_URL, {
          title: task.title,
          completed: task.completed,
        });
        task.id = data.id;
      } else {
        await axios.patch(`${API_URL}/${task.id}`, {
          title: task.title,
          completed: task.completed,
        });
      }

      delete task.offline;
      delete task.new;
    } catch (error) {
      console.error("Error syncing task:", error);
    }
  }

  await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
};
