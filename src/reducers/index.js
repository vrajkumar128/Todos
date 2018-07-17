import { combineReducers } from 'redux';

import loading from './loading';
import todos from './todos';
import goals from './goals';

export default combineReducers({
  loading,
  todos,
  goals
});
