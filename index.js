/* LIBRARY CODE */

function createStore(reducer) {
  // The store has four parts:
  // 1. The state
  // 2. A way to get the state
  // 3. A way to listen for changes to the state
  // 4. A way to update the state

  const state = {};
  const listeners = [];

  // Return the state
  const getState = () => state;

  const subscribe = listener => {
    // Listen for changes to the state
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    }
  }

  const dispatch = action => {
    // Update the state
    state = reducer(state, action);
    listeners.forEach(listener => listener());
  }

  return {
    getState,
    subscribe,
    dispatch
  }

}

/* APP CODE */

// Map strings to constants (better typo detection)
const strings = ["ADD_TODO", "REMOVE_TODO", "TOGGLE_TODO", "ADD_GOAL", "REMOVE_GOAL", "RECEIVE_DATA"];
const [ADD_TODO, REMOVE_TODO, TOGGLE_TODO, ADD_GOAL, REMOVE_GOAL, RECEIVE_DATA] = [...strings];

// Add todo action creator
function addTodoAction(todo) {
  return {
    type: ADD_TODO,
    todo
  };
}

// Optimistically add a todo item to the local state before making sure that it's added to the server
function handleAddTodo(name, optimisticCb, revertOptimisticCb) {
  return async dispatch => {
    const optimisticTodo = {
      id: generateId(),
      name,
      complete: false
    };

    dispatch(addTodoAction(optimisticTodo));
    optimisticCb(); // Clear input field's value

    try {
      const todo = await API.saveTodo(name);
      // If API request succeeds, replace optimisticTodo with todo
      dispatch(removeTodoAction(optimisticTodo.id));
      dispatch(addTodoAction(todo));
    } catch (err) {
      console.log("Error:", err);
      alert("An error occurred. Try again.");
      dispatch(removeTodoAction(optimisticTodo.id));
      revertOptimisticCb(); // Restore input field's value
    }
  };
}

// Remove todo action creator
function removeTodoAction(id) {
  return {
    type: REMOVE_TODO,
    id
  };
}

// Optimistically remove a todo item from the local state before making sure that it's removed from the server
function handleRemoveTodo(todo) {
  return async dispatch => {
    dispatch(removeTodoAction(todo.id));

    try {
      await API.deleteTodo(todo.id);
    } catch (err) {
      console.log("Error:", err);
      alert("An error occurred. Try again.");
      dispatch(addTodoAction(todo));
    }
  };
}

// Toggle todo action creator
function toggleTodoAction(id) {
  return {
    type: TOGGLE_TODO,
    id
  };
}

// Optimistically toggle a todo item in the local state before making sure that it toggles on the server
function handleToggleTodo(id) {
  return async dispatch => {
    dispatch(toggleTodoAction(id));

    try {
      await API.saveTodoToggle(id);
    } catch (err) {
      console.log("Error:", err);
      alert("An error occurred. Try again.");
      dispatch(toggleTodoAction(id));
    }
  };
}

// Add goal action creator
function addGoalAction(goal) {
  return {
    type: ADD_GOAL,
    goal
  };
}

// Optimistically add a goal to the local state before making sure that it's added to the server
function handleAddGoal(name, optimisticCb, revertOptimisticCb) {
  return async dispatch => {
    const optimisticGoal = {
      id: generateId(),
      name,
    };

    dispatch(addGoalAction(optimisticGoal));
    optimisticCb(); // Clear input field's value

    try {
      const goal = await API.saveGoal(name);
      // If API request succeeds, replace optimisticGoal with goal
      dispatch(removeGoalAction(optimisticGoal.id));
      dispatch(addGoalAction(goal));
    } catch (err) {
      console.log("Error:", err);
      alert("An error occurred. Try again.");
      dispatch(removeGoalAction(optimisticGoal.id));
      revertOptimisticCb(); // Restore input field's value
    }
  };
}

// Remove goal action creator
function removeGoalAction(id) {
  return {
    type: REMOVE_GOAL,
    id
  };
}

// Optimistically remove a goal from the local state before making sure that it's removed from the server
function handleRemoveGoal(goal) {
  return async dispatch => {
    dispatch(removeGoalAction(goal.id));

    try {
      await API.deleteGoal(goal.id);
    } catch (err) {
      console.log("Error:", err);
      alert("An error occurred. Try again.");
      dispatch(addGoalAction(goal));
    }
  };
}

// Receive data action creator
function receiveDataAction(todos, goals) {
  return {
    type: RECEIVE_DATA,
    todos,
    goals
  };
}

// Retrieve data from server and add them to UI
function handleReceiveData() {
  return async dispatch => {
    const [todos, goals] = await Promise.all([
      API.fetchTodos(),
      API.fetchGoals()
    ]);

    dispatch(receiveDataAction(todos, goals));
  };
}

// Todos reducer
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return state.concat([action.todo]);
    case REMOVE_TODO:
      return state.filter(todo => todo.id !== action.id);
    case TOGGLE_TODO:
      return state.map(todo => todo.id !== action.id ? todo :
        Object.assign({}, todo, { complete: !todo.complete }));
    case RECEIVE_DATA:
      return action.todos;
    default:
      return state;
  }
}

// Goals reducer
function goals(state = [], action) {
  switch (action.type) {
    case ADD_GOAL:
      return state.concat([action.goal]);
    case REMOVE_GOAL:
      return state.filter(goal => goal.id !== action.id);
    case RECEIVE_DATA:
      return action.goals;
    default:
      return state;
  }
}

// Loading flag
function loading(state = true, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      return false;
    default:
      return state;
  }
}

// Root reducer
function app(state, action) {
  return {
    todos: todos(state.todos, action),
    goals: goals(state.goals, action)
  };
}

// If an action creator returns a function, invoke it; else move to next middleware
const thunk = store => next => action => {
  return typeof action === 'function' ? action(store.dispatch) : next(action);
}

// Check if a proposed goal or todo contains 'bitcoin'; if so, reject it
const checker = store => next => action => {
  if (action.type === ADD_TODO && action.todo.name.toLowerCase().includes('bitcoin')) {
    return alert("No. That's a bad idea!");
  } else if (action.type === ADD_GOAL && action.goal.name.toLowerCase().includes('bitcoin')) {
    return alert("No. That's a bad idea!");
  } else {
    return next(action);
  }
}

// Logging middleware
const logger = store => next => action => {
  console.group(action.type);
    console.log("The action:", action);
    const result = next(action);
    console.log("The new state:", store.getState());
  console.groupEnd();
  return result;
}

// Create the Redux store
const store = Redux.createStore(Redux.combineReducers({
  todos,
  goals,
  loading
}), Redux.applyMiddleware(ReduxThunk.default, checker, logger));

// Generate a random id
function generateId() {
  return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}
