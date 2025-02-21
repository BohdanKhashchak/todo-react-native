# To-Do App

This is a React Native To-Do application with **offline task handling** using `AsyncStorage` and **automatic synchronization** when the internet connection is restored, also providing themes.

## Features

✅ Fetch tasks from API (`jsonplaceholder.typicode.com`).  
✅ Add, update, and delete tasks.  
✅ Offline support: Tasks are stored locally when offline.  
✅ Automatic synchronization when internet connection is restored.  
✅ Themes change button

---

## 📦 Installation & Setup

### **1. Clone the repository**

```sh
git clone https://github.com/your-repo/todo-app.git
cd test-todo-app
```

### **2. Install dependencies**

```sh
npm install
```

### **3. Run the app**

For Android:

```sh
npm run android
```

For iOS:

```sh
npm run ios
```

For Server start

```sh
npm run start
```

---

## 🚀 Usage Guide

### **Fetching Tasks**

Tasks are fetched from the API when the app loads. If offline, tasks will be loaded from local storage (`AsyncStorage`).

### **Adding a Task**

- If online, the task is sent to the API.
- If offline, the task is stored locally and marked as `offline: true`.

### **Updating Task Status**

- If online, the update request is sent to the API.
- If offline, the update is stored locally and applied when reconnected.

### **Deleting a Task**

- If online, the delete request is sent to the API.
- If offline, the task is removed locally and deleted from the server when reconnected.

### **Offline Task Synchronization**

When the internet connection is restored, offline tasks are automatically:

1. Sent to the API.
2. Removed from local storage after successful synchronization.
3. Merged with the latest server data to avoid data loss.
