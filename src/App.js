import React from 'react';
import { connect } from 'react-redux';
import ConnectedTodos from './components/Todos';
import ConnectedGoals from './components/Goals';
import { handleReceiveData } from './actions/shared';

class App extends React.Component {
  // Receive initial data from server
  componentDidMount = () => {
    this.props.dispatch(handleReceiveData());
  }

  // If data have not yet been received from server, render a loading indicator; else render the UI
  render() {
    return this.props.loading ? <h3>Loading...</h3> : (
      <div>
        <ConnectedTodos />
        <ConnectedGoals />
      </div>
    );
  }
}

// Create connected container component for App
export default connect(state => ({
  loading: state.loading
}))(App);
