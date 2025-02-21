import { StyleSheet, Animated, RefreshControl } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedInput } from "@/components/ThemedInput";
import React, { useEffect, useState, useRef } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import {
  fetchTasks,
  addTask,
  updateTaskStatus,
  deleteTask,
  syncOfflineTasks,
} from "@/services/api";
import NetInfo from "@react-native-community/netinfo";

import { Task } from "@/constants/types";

/**
 * TodoScreen component for managing a to-do list.
 */
export default function TodoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animatedValues = useRef(new Map()).current;

  // Load tasks and start fade animation on component mount
  useEffect(() => {
    loadTasks();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Sync offline tasks when internet connection is detected
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncOfflineTasks();
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Load tasks from the server or local storage.
   */
  const loadTasks = async () => {
    try {
      setRefreshing(true);
      const data = await fetchTasks(5);
      setTasks(data);
      data.forEach((task: Task) => {
        animatedValues.set(task.id, new Animated.Value(1));
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Add a new task to the list.
   */
  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    setNewTask("");

    try {
      const task = await addTask(newTask);
      task.id = 200 + tasks.length + 1; // fix badly written API ids
      console.log("Task added:", task);
      animatedValues.set(task.id, new Animated.Value(0));
      setTasks([task, ...tasks]);

      Animated.timing(animatedValues.get(task.id), {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  /**
   * Delete a task from the list.
   * @param {number} id - The ID of the task to delete.
   */
  const handleDeleteTask = async (id: number) => {
    if (!animatedValues.has(id)) return;

    Animated.timing(animatedValues.get(id), {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTasks(tasks.filter((task) => task.id !== id));
      animatedValues.delete(id);
    });

    try {
      await deleteTask(id);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  /**
   * Toggle the completion status of a task.
   * @param {number} id - The ID of the task to toggle.
   * @param {boolean} completed - The current completion status of the task.
   */
  const handleToggleTask = async (id: number, completed: boolean) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !completed } : task
      )
    );

    try {
      await updateTaskStatus(id, !completed);
    } catch (error) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, completed } : task
        )
      );
      console.error("Error updating task status:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>To-Do List</ThemedText>
      <ThemedView style={styles.inputContainer}>
        <ThemedInput
          style={styles.input}
          placeholder="Add new task..."
          value={newTask}
          onChangeText={setNewTask}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddTask}>
          <ThemedText style={styles.text}>Add Task</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <Animated.View
              style={{
                opacity: animatedValues.get(item.id) || 1,
                transform: [
                  {
                    scale: animatedValues.get(item.id)
                      ? animatedValues.get(item.id).interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        })
                      : 1,
                  },
                ],
              }}
            >
              <ThemedView
                style={[
                  styles.taskItem,
                  index === tasks.length - 1 && styles.lastTaskItem,
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleToggleTask(item.id, item.completed)}
                  style={{ flex: 1 }}
                >
                  <ThemedText
                    style={[
                      styles.taskText,
                      item.completed && styles.completed,
                    ]}
                  >
                    {item.title}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
                  <ThemedText style={styles.deleteText}>×</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </Animated.View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadTasks} />
          }
        />
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    padding: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  taskItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  lastTaskItem: {
    borderBottomWidth: 0,
  },
  taskText: {
    fontSize: 16,
    flex: 1,
  },
  completed: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  deleteText: {
    fontSize: 24,
    alignSelf: "center",
  },
});
