import React from 'react';
import { List, Paper } from '@mui/material';
import PropTypes from 'prop-types';
import TodoItem from './todo-item';

const TodoList = ({ todos, toggleTodo, deleteTodo }) => {
  return (
    <Paper elevation={2} 
    sx={{ 
        width: {
            xs: '100%',   
            sm: '90%',     
            md: '80%',     
            lg: '70%'     
        },
        margin: '0 auto',
        maxWidth: '800px'  
    }}>
      <List>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </List>
    </Paper>
  );
};

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
    })
  ).isRequired,
  toggleTodo: PropTypes.func.isRequired,
  deleteTodo: PropTypes.func.isRequired,
};

export default TodoList;