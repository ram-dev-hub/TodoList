import React from 'react';
import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

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
                startIcon={<AddIcon />}
                title="Add a new task"
                sx={{ 
                    borderRadius: '50%', 
                    minWidth: '48px', 
                    width: '48px', 
                    height: '48px', 
                    padding: 0,
                    '& .MuiButton-startIcon': {
                        margin: 0,
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }
                }}
            >
             
            </Button>
        </Box>
    );
};

export default TodoForm;