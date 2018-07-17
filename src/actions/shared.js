import API from 'goals-todos-api';

// Map strings to constants (better typo detection)
export const RECEIVE_DATA = "RECIEVE_DATA";

// Receive data action creator
const receiveData = (todos, goals) => ({
  type: RECEIVE_DATA,
  todos,
  goals
});

// Retrieve data from server and add them to UI
export const handleReceiveData = () => async dispatch => {
  const [todos, goals] = await Promise.all([
    API.fetchTodos(),
    API.fetchGoals()
  ]);

  dispatch(receiveData(todos, goals));
};

// Generate a random id
export const generateId = () => Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
