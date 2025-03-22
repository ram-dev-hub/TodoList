import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import TodoList from './components/todo-list';
import TodoForm from './components/todo-form';
import { Container, Typography, Box, Paper, ButtonGroup, Button, Grid, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewListIcon from '@mui/icons-material/ViewList';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function App() {
    const [todos, setTodos] = useState([]);
    const [filter, setFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
        /* get saved todos from local storage and update in useState*/
        const savedTodos = JSON.parse(localStorage.getItem('todos')) || [];
        setTodos(savedTodos);
    }, []);

    useEffect(() => {
        /* its whenever todos values change save updated todos to local storage */
        localStorage.setItem('todos', JSON.stringify(todos));
    }, [todos]);

    const addTodo = (text) => {
        if (text.trim()) {
            setTodos([
                ...todos,
                { id: Date.now(), text, completed: false }
            ]);
        }
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id) => {
        /* remove todo item from the list */
        setTodos(todos.filter(todo => todo.id !== id));
    };
    // in React 19 automatically memoizing the value, No need to manually use useMemo hook ,but i am using here optionaly suppose the toto list items add more complex itesms its will helpful.
    const filteredTodos = useMemo(() => {
        return todos.filter(todo => {
            switch (filter) {
                case 'completed':
                    return todo.completed;
                case 'active':
                    return !todo.completed;
                default:
                    return true;
            }
        });
    }, [todos, filter]);


    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const sourceId = result.source.droppableId;
        const destinationId = result.destination.droppableId;
        const todoId = parseInt(result.draggableId);
        if (sourceId === destinationId) return;

        setTodos(todos.map(todo => {
            if (todo.id === todoId) {
                return {
                    ...todo,
                    completed: destinationId === 'completed'
                };
            }
            return todo;
        }));
    };

    const activeTodos = todos.filter(todo => !todo.completed);
    const completedTodos = todos.filter(todo => todo.completed);
    const renderDashboard = () => (
        <DragDropContext
            data-testid="drag-drop-context"
            onDragEnd={handleDragEnd}
        >
            <Grid container spacing={2} sx={{ width: '100%', margin: '0 auto' }}>
                <Grid item xs={12} md={6} lg={6}>
                    <Paper elevation={3}
                        sx={{
                            p: 2,
                            bgcolor: '#f5f5f5',
                            minHeight: 400,
                            width: {
                                xs: '100%',
                                sm: '100%',
                                md: '90%'
                            },
                            margin: '0 auto'
                        }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">Active Tasks</Typography>
                            <Typography variant="subtitle1">({activeTodos.length})</Typography>
                        </Box>
                        <Droppable droppableId="active">
                            {(provided) => (
                                <Box
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    sx={{ minHeight: 300 }}
                                >
                                    {activeTodos.map((todo, index) => (
                                        <Draggable
                                            key={todo.id}
                                            draggableId={todo.id.toString()}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <Paper
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    sx={{
                                                        p: 2,
                                                        mb: 1,
                                                        bgcolor: 'white',
                                                        wordWrap: 'break-word',
                                                        cursor: 'pointer',
                                                        width: { xs: '90%', sm: '85%' },
                                                        margin: '0 auto',
                                                        marginBottom: 1
                                                    }}
                                                >
                                                    {todo.text}
                                                </Paper>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                    <Paper elevation={3}
                        sx={{
                            p: 2,
                            bgcolor: '#e8f5e9',
                            minHeight: 400,
                            width: {
                                xs: '100%',
                                sm: '100%',
                                md: '90%'
                            },
                            margin: '0 auto'
                        }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">Completed Tasks</Typography>
                            <Typography variant="subtitle1">({completedTodos.length})</Typography>
                        </Box>
                        <Droppable droppableId="completed" data-test-id="droppable-completed">
                            {(provided) => (
                                <Box
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    sx={{ minHeight: 300 }}
                                >
                                    {completedTodos.map((todo, index) => (
                                        <Draggable
                                            key={todo.id}
                                            draggableId={todo.id.toString()}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <Paper
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    sx={{
                                                        p: 2,
                                                        mb: 1,
                                                        bgcolor: 'white',
                                                        width: {
                                                            xs: '90%', 
                                                            sm: '85%', 
                                                            md: '80%'  
                                                        },
                                                        margin: '0 auto',
                                                        marginBottom: 1,
                                                        '& .MuiTypography-root': {
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            maxWidth: {
                                                                xs: '200px',
                                                                sm: '300px',
                                                                md: '400px'
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Typography noWrap>
                                                        {todo.text}
                                                    </Typography>
                                                </Paper>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    </Paper>
                </Grid>
            </Grid>
        </DragDropContext>
    );

    return (
        <Container maxWidth="lg"
            sx={{
                width: {
                    xs: '95%', 
                    sm: '90%', 
                    md: '80%',
                    lg: '1200px' 
                },
                margin: '0 auto'
            }}>
            <Box sx={{ my: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Todo List
                        </Typography>
                        <IconButton
                            onClick={() => setViewMode(viewMode === 'list' ? 'dashboard' : 'list')}
                            color="primary"
                            title={viewMode === 'list' ? 'Switch to Dashboard View' : 'Switch to List View'}
                        >
                            {viewMode === 'list' ?
                                <DashboardIcon aria-label="Switch to Dashboard View" /> :
                                <ViewListIcon aria-label="Switch to List View" />
                            }
                        </IconButton>
                    </Box>
                    {/*TodoForm component is used to add new todo item use onSubmit prop to add new todo item.*/}
                    <TodoForm onSubmit={addTodo} />
                    {viewMode === 'list' ? (
                        <>
                            <ButtonGroup fullWidth variant="outlined" sx={{ mb: 2 }}>
                                <Button onClick={() => setFilter('all')} variant={filter === 'all' ? 'contained' : 'outlined'}>All</Button>
                                <Button onClick={() => setFilter('active')} variant={filter === 'active' ? 'contained' : 'outlined'}>Active</Button>
                                <Button onClick={() => setFilter('completed')} variant={filter === 'completed' ? 'contained' : 'outlined'}>Completed</Button>
                            </ButtonGroup>
                            <TodoList
                                todos={filteredTodos}
                                toggleTodo={toggleTodo}
                                deleteTodo={deleteTodo}
                            />
                        </>
                    ) : (
                        renderDashboard()
                    )}
                </Paper>
            </Box>
        </Container>
    );
}

export default App;