import API from 'goals-todos-api';
import { generateId } from './shared';

// Map strings to constants (better typo detection)
export const ADD_TODO = "ADD_TODO";
export const REMOVE_TODO = "REMOVE_TODO";
export const TOGGLE_TODO = "TOGGLE_TODO";

// Add todo action creator
const addTodo = todo => ({
  type: ADD_TODO,
  todo
});

// Remove todo action creator
const removeTodo = id => ({
  type: REMOVE_TODO,
  id
});

// Toggle todo action creator
const toggleTodo = id => ({
  type: TOGGLE_TODO,
  id
});

// Optimistically add a todo item to the local state before making sure that it's added to the server
export const handleAddTodo = (name, optimisticCb, revertOptimisticCb) => async dispatch => {
  const optimisticTodo = {
    id: generateId(),
    name,
    complete: false
  };

  dispatch(addTodo(optimisticTodo));
  optimisticCb(); // Clear input field's value

  try {
    const todo = await API.saveTodo(name);
    // If API request succeeds, replace optimisticTodo with todo
    dispatch(removeTodo(optimisticTodo.id));
    dispatch(addTodo(todo));
  } catch (err) {
    console.log("Error:", err);
    alert("An error occurred. Try again.");
    dispatch(removeTodo(optimisticTodo.id)); // Revert optimistic update
    revertOptimisticCb(); // Restore input field's value
  }
};

// Optimistically remove a todo item from the local state before making sure that it's removed from the server
export const handleRemoveTodo = todo => async dispatch => {
  dispatch(removeTodo(todo.id));

  try {
    await API.deleteTodo(todo.id);
  } catch (err) {
    console.log("Error:", err);
    alert("An error occurred. Try again.");
    dispatch(addTodo(todo)); // Revert optimistic update
  }
};

// Optimistically toggle a todo item in the local state before making sure that it's toggled on the server
export const handleToggleTodo = id => async dispatch => {
  dispatch(toggleTodo(id));

  try {
    await API.saveTodoToggle(id);
  } catch (err) {
    console.log("Error:", err);
    alert("An error occurred. Try again.");
    dispatch(toggleTodo(id)); // Revert optimistic update
  }
};
