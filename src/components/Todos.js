import React from 'react';
import { connect } from 'react-redux';
import List from './List';
import {
  handleAddTodo,
  handleRemoveTodo,
  handleToggleTodo
} from '../actions/todos';

const Todos = props => {
  // Add a todo item to list
  const addItem = e => {
    e.preventDefault();
    const name = this.input.value;
    props.dispatch(handleAddTodo(
      name,
      () => this.input.value = '',
      () => this.input.value = name
    ));
  }

  // Remove a todo item from list
  const removeItem = todo => {
    props.dispatch(handleRemoveTodo(todo));
  }

  // Toggle a todo item's completion status
  const toggleItem = id => {
    props.dispatch(handleToggleTodo(id));
  }

  return (
    <div>
      <h1>Todo List</h1>
      <input
        type="text"
        placeholder="Add todo"
        ref={input => this.input = input}
      />
      <button onClick={addItem}>Add Todo</button>

      <List items={props.todos} toggle={toggleItem} remove={removeItem} />
    </div>
  );
}

const ConnectedTodos = connect(state => ({
  todos: state.todos
}))(Todos);

export default ConnectedTodos;
