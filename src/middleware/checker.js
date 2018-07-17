import { ADD_TODO } from '../actions/todos';
import { ADD_GOAL } from '../actions/goals';

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

export default checker;
