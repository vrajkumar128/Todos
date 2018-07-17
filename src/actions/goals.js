import API from 'goals-todos-api';
import { generateId } from './shared';

// Map strings to constants (better typo detection)
export const ADD_GOAL = "ADD_GOAL";
export const REMOVE_GOAL = "REMOVE_GOAL";

// Add goal action creator
const addGoal = goal => ({
  type: ADD_GOAL,
  goal
});

// Remove goal action creator
const removeGoal = id => ({
  type: REMOVE_GOAL,
  id
});

// Optimistically add a goal to the local state before making sure that it's added to the server
export const handleAddGoal = (name, optimisticCb, revertOptimisticCb) => async dispatch => {
  const optimisticGoal = {
    id: generateId(),
    name,
  };

  dispatch(addGoal(optimisticGoal));
  optimisticCb(); // Clear input field's value

  try {
    const goal = await API.saveGoal(name);
    // If API request succeeds, replace optimisticGoal with goal
    dispatch(removeGoal(optimisticGoal.id));
    dispatch(addGoal(goal));
  } catch (err) {
    console.log("Error:", err);
    alert("An error occurred. Try again.");
    dispatch(removeGoal(optimisticGoal.id));
    revertOptimisticCb(); // Restore input field's value
  }
};

// Optimistically remove a goal from the local state before making sure that it's removed from the server
export const handleRemoveGoal = goal => async dispatch => {
  dispatch(removeGoal(goal.id));

  try {
    await API.deleteGoal(goal.id);
  } catch (err) {
    console.log("Error:", err);
    alert("An error occurred. Try again.");
    dispatch(addGoal(goal)); // Revert optimistic update
  }
};
