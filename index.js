// Library code
function createStore(reducer) {
  // The store has four parts:
  // 1. The state
  // 2. A way to get the state
  // 3. A way to listen for changes to the state
  // 4. A way to update the state

  let state = {};
  let listeners = [];

  const getState = () => state;

  const subscribe = listener => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    }
  }

  const dispatch = action => {
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
const ADD_TODO = "ADD_TODO";
const REMOVE_TODO = "REMOVE_TODO";
const TOGGLE_TODO = "TOGGLE_TODO";
const ADD_GOAL = "ADD_GOAL";
const REMOVE_GOAL = "REMOVE_GOAL";

function addTodoAction(todo) {
  return {
    type: ADD_TODO,
    todo
  };
}

function removeTodoAction(id) {
  return {
    type: REMOVE_TODO,
    id
  };
}

function toggleTodoAction(id) {
  return {
    type: TOGGLE_TODO,
    id
  };
}

function addGoalAction(goal) {
  return {
    type: ADD_GOAL,
    goal
  };
}

function removeGoalAction(id) {
  return {
    type: REMOVE_GOAL,
    id
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
    default:
      return state;
  }
}

function goals(state = [], action) {
  switch(action.type) {
    case ADD_GOAL:
      return state.concat([action.goal]);
    case REMOVE_GOAL:
      return state.filter(goal => goal.id !== action.id);
    default:
      return state;
  }
}

function app(state, action) {
  return {
    todos: todos(state.todos, action),
    goals: goals(state.goals, action)
  }
}

function checkAndDispatch(store, action) {
  if (action.type == ADD_TODO && action.todo.name.toLowerCase().includes('bitcoin')) {
    return alert("No. That's a bad idea!");
  } else if (action.type == ADD_GOAL && action.goal.name.toLowerCase().includes('bitcoin')) {
    return alert("No. That's a bad idea!");
  } else {
    return store.dispatch(action);
  }
}

const store = createStore(app);

store.subscribe(() => {
  const { goals, todos } = store.getState();
  document.getElementById('todos').innerHTML = '';
  document.getElementById('goals').innerHTML = '';

  todos.forEach(addTodoToDOM);
  goals.forEach(addGoalToDOM);
});

function generateId() {
  return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
}

function addTodo() {
  const input = document.getElementById('todo');
  const name = input.value;
  input.value = '';
  checkAndDispatch(store, addTodoAction({
    name,
    complete: false,
    id: generateId()
  }));
}

function addGoal() {
  const input = document.getElementById('goal');
  const name = input.value;
  input.value = '';
  checkAndDispatch(store, addGoalAction({
    name,
    id: generateId()
  }));
}

function createRemoveButton (onClick) {
  const removeBtn = document.createElement('button');
  removeBtn.innerHTML = 'X';
  removeBtn.addEventListener('click', onClick);
  return removeBtn;
}

function addTodoToDOM(todo) {
  const li = document.createElement('li');
  const text = document.createTextNode(todo.name);

  const removeBtn = createRemoveButton(() => {
    checkAndDispatch(store, removeTodoAction(todo.id))
  })

  li.appendChild(text);
  li.appendChild(removeBtn);
  li.style.textDecoration = todo.complete ? 'line-through' : 'none';
  li.addEventListener('click', () => {
    checkAndDispatch(store, toggleTodoAction(todo.id))
  });

  document.getElementById('todos').appendChild(li);
}

function addGoalToDOM(goal) {
  const li = document.createElement('li');
  const text = document.createTextNode(goal.name);

  const removeBtn = createRemoveButton(() => {
    checkAndDispatch(store, removeTodoAction(todo.id))
  });

  li.appendChild(text);
  li.appendChild(removeBtn);
  document.getElementById('goals').appendChild(li);
}
