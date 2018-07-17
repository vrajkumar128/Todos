import React from 'react';
import { connect } from 'react-redux';
import List from './List';
import { handleAddGoal, handleRemoveGoal } from '../actions/goals';

const Goals = props => {
  // Add a goal to list
  const addItem = e => {
    e.preventDefault();
    const name = this.input.value;
    props.dispatch(handleAddGoal(
      name,
      () => this.input.value = '',
      () => this.input.value = name
    ));
  }

  // Remove a goal from list
  const removeItem = goal => {
    props.dispatch(handleRemoveGoal(goal));
  }

  return (
    <div>
      <h1>Goals</h1>
      <input
        type="text"
        placeholder="Add goal"
        ref={input => this.input = input}
      />
      <button onClick={addItem}>Add Goal</button>

      <List items={props.goals} remove={removeItem} />
    </div>
  );
}

// Create connected container component for Goals
export default connect(state => ({
  goals: state.goals
}))(Goals);
