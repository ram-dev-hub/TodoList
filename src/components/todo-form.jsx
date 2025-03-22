import React from 'react';
import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

const TodoForm = ({ onSubmit }) => {
    const [task, setTask] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (task.trim()&&textValidation(task)) {
            onSubmit(task);
            setTask('');
            setError('');
        } else {
            setError('Task cannot be empty');
        }
    };
   const textValidation=(value)=>{
    if (value.length <=100) {
        return true;
    }
    setError('Task cannot be more than 100 characters');
    return false;
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                gap: 2,
                p: 2,
            }}
        >
             <TextField
                fullWidth
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Add a new task"
                variant="outlined"
                size="small"             
                error={!!error}                
                FormHelperTextProps={{
                    component: 'div' 
                }}
                helperText={
                    <Box 
                        component="div" 
                        display="flex" 
                        justifyContent="space-between"
                    >
                        <span>{error}</span>
                        <span>{`${task.length}/100`}</span>
                    </Box>
                }
                inputProps={{ maxLength: 100 }}
                data-testid="todo-input"
            />
            <Button
                type="submit"
                variant="contained"
                color="primary"
                data-testid="add-todo-button"
            >
                Add Task
            </Button>
        </Box>
    );
};

export default TodoForm;