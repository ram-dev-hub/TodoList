import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Checkbox, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const TodoItem = ({ todo, onToggle, onDelete }) => {
    return (
        <ListItem
            dense
            onClick={() => onToggle(todo.id)}
            sx={{
                backgroundColor: todo.completed ? '#f5f5f5' : 'white',
                opacity: todo.completed ? 0.7 : 1,
                cursor: 'pointer',
                paddingRight: '48px',
            }}
            title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
            secondaryAction={
                <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onDelete(todo.id)}
                    data-testid={`delete-button-${todo.id}`}
                    title="Delete todo"
                >
                    <DeleteIcon />
                </IconButton>
            }
        >
            <ListItemIcon>
                <Checkbox
                    edge="start"
                    checked={todo.completed}
                    tabIndex={-1}
                    disableRipple
                    data-testid={`todo-checkbox-${todo.id}`}
                    onChange={() => onToggle(todo.id)}
                    title={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                />
            </ListItemIcon>
            <ListItemText
                primary={todo.text}
                sx={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? '#757575' : 'inherit',
                    '& .MuiTypography-root': {
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        maxWidth: '500px', 
                    }
                }}
            />
        </ListItem>
    );
};

TodoItem.propTypes = {
    todo: PropTypes.shape({
        id: PropTypes.number.isRequired,
        text: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
    }).isRequired,
    onToggle: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default TodoItem;