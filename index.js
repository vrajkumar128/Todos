// Library code
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

// App code
const strings = ["ADD_TODO", "REMOVE_TODO", "TOGGLE_TODO", "ADD_GOAL", "REMOVE_GOAL", "RECEIVE_DATA"];
const [ADD_TODO, REMOVE_TODO, TOGGLE_TODO, ADD_GOAL, REMOVE_GOAL, RECEIVE_DATA] = [...strings];

function addTodoAction(todo) {
  return {
    type: ADD_TODO,
    todo
  };
}

function handleAddTodo(name, optimisticCb, revertCb) {
  return async dispatch => {
    // Optimistically add a todo item to the local state before making sure that it adds to the server
    const optimisticTodo = {
      id: generateId(),
      name,
      complete: false
    };

    dispatch(addTodoAction(optimisticTodo));
    optimisticCb();

    try {
      const todo = await API.saveTodo(name);
      dispatch(removeTodoAction(optimisticTodo.id));
      dispatch(addTodoAction(todo));
    } catch (err) {
      console.log("Error:", err);
      alert("An error occurred. Try again.");
      dispatch(removeTodoAction(optimisticTodo.id));
      revertCb();
    }
  };
}

function removeTodoAction(id) {
  return {
    type: REMOVE_TODO,
    id
  };
}

function handleRemoveTodo(todo) {
  return async dispatch => {
    // Optimistically remove a todo item from the local state before making sure that it's removed from the server
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

function toggleTodoAction(id) {
  return {
    type: TOGGLE_TODO,
    id
  };
}

function handleToggleTodo(id) {
  return async dispatch => {
    // Optimistically toggle a todo item in the local state before making sure that it toggles on the server
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

function addGoalAction(goal) {
  return {
    type: ADD_GOAL,
    goal
  };
}

function handleAddGoal(name, optimisticCb, revertCb) {
  return async dispatch => {
    // Optimistically add a goal to the local state before making sure that it adds to the server
    const optimisticGoal = {
      id: generateId(),
      name,
    };

    dispatch(addGoalAction(optimisticGoal));
    optimisticCb();

    try {
      const goal = await API.saveGoal(name);
      dispatch(removeGoalAction(optimisticGoal.id));
      dispatch(addGoalAction(goal));
    } catch (err) {
      console.log("Error:", err);
      alert("An error occurred. Try again.");
      dispatch(removeGoalAction(optimisticGoal.id));
      revertCb();
    }
  };
}

function removeGoalAction(id) {
  return {
    type: REMOVE_GOAL,
    id
  };
}

function handleRemoveGoal(goal) {
  return async dispatch => {
    // Optimistically remove a goal from the local state before making sure that it's removed from the server
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

function receiveDataAction(todos, goals) {
  return {
    type: RECEIVE_DATA,
    todos,
    goals
  };
}

function handleReceiveData() {
  return async dispatch => {
    // Retrieve data from server and add them to UI
    const [todos, goals] = await Promise.all([
      API.fetchTodos(),
      API.fetchGoals()
    ]);

    dispatch(receiveDataAction(todos, goals));
  };
}

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

function loading(state = true, action) {
  switch (action.type) {
    case RECEIVE_DATA:
      return false;
    default:
      return state;
  }
}

function app(state, action) {
  return {
    todos: todos(state.todos, action),
    goals: goals(state.goals, action)
  };
}

const thunk = store => next => action => {
  // If an action creator returns a function, call it; else move to next middleware
  return typeof action === 'function' ? action(store.dispatch) : next(action);
}

const checker = store => next => action => {
  if (action.type == ADD_TODO && action.todo.name.toLowerCase().includes('bitcoin')) {
    return alert("No. That's a bad idea!");
  } else if (action.type == ADD_GOAL && action.goal.name.toLowerCase().includes('bitcoin')) {
    return alert("No. That's a bad idea!");
  } else {
    return next(action);
  }
}

// function checker(store) {
//   return function(next) {
//     return function(action) {
//       if (action.type == ADD_TODO && action.todo.name.toLowerCase().includes('bitcoin')) {
//         return alert("No. That's a bad idea!");
//       } else if (action.type == ADD_GOAL && action.goal.name.toLowerCase().includes('bitcoin')) {
//         return alert("No. That's a bad idea!");
//       } else {
//         return next(action);
//       }
//     }
//   }
// }

const logger = store => next => action => {
  console.group(action.type);
    console.log("The action: ", action);
    const result = next(action);
    console.log("The new state: ", store.getState());
  console.groupEnd();
  return result;
}

const store = Redux.createStore(Redux.combineReducers({
  todos,
  goals,
  loading
}), Redux.applyMiddleware(ReduxThunk.default, checker, logger));

function generateId() {
  return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}
