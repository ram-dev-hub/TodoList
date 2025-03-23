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
                            margin: '0 auto',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                            }
                        }}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mb: 1,
                            p: 1,
                            borderBottom: '2px solid #e0e0e0'
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 'bold',
                                color: '#2196f3',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                            }}>Active Tasks</Typography>
                            <Typography variant="subtitle1" sx={{
                                bgcolor: '#2196f3',
                                color: 'white',
                                borderRadius: '20px',
                                px: 2,
                                py: 0.5
                            }}>({activeTodos.length})</Typography>
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
                                                        marginBottom: 1,
                                                        borderRadius: '8px',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            bgcolor: '#f8f8f8',
                                                            transform: 'scale(1.02)',
                                                            boxShadow: '0 2px 4px rgba(33,150,243,0.2)'
                                                        }
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
                            bgcolor: '#f5f5f5',
                            minHeight: 400,
                            width: {
                                xs: '100%',
                                sm: '100%',
                                md: '90%'
                            },
                            margin: '0 auto',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                            }
                        }}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mb: 1,
                            p: 1,
                            borderBottom: '2px solid #e0e0e0'
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 'bold',
                                color: '#4caf50',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                            }}>Completed Tasks</Typography>
                            <Typography variant="subtitle1" sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                borderRadius: '20px',
                                px: 2,
                                py: 0.5
                            }}>({completedTodos.length})</Typography>
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
                                                        wordWrap: 'break-word',
                                                        cursor: 'pointer',
                                                        width: { xs: '90%', sm: '85%' },
                                                        margin: '0 auto',
                                                        marginBottom: 1,
                                                        borderRadius: '8px',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            bgcolor: '#f8f8f8',
                                                            transform: 'scale(1.02)',
                                                            boxShadow: '0 2px 4px rgba(76,175,80,0.2)'
                                                        }
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
            </Grid>
        </DragDropContext>
    );

    return (
        <Container maxWidth="md"
            sx={{
                width: {
                    xs: '70%', 
                    sm: '60%', 
                    md: '50%',
                    lg: '1000px' 
                },
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
            <Box sx={{ my: 4, width: '100%' }}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        color: 'black',
                    }}>
                        <Typography 
                            variant="h4" 
                            component="h1" 
                            gutterBottom
                            sx={{ 
                                m: 0,
                                fontWeight: 'bold',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                            }}
                        >
                            Todo List
                        </Typography>
                        <IconButton
                            onClick={() => setViewMode(viewMode === 'list' ? 'dashboard' : 'list')}
                            sx={{ 
                                color: '#1976d2',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.2)'
                                }
                            }}
                            title={viewMode === 'list' ? 'Switch to Dashboard View' : 'Switch to List View'}
                        >
                            {viewMode === 'list' ?
                                <DashboardIcon aria-label="Switch to Dashboard View" /> :
                                <ViewListIcon aria-label="Switch to List View" />
                            }
                        </IconButton>
                    </Box>
                    {/* Rest of the code remains the same */}
                    <TodoForm onSubmit={addTodo} />
                    {viewMode === 'list' ? (
                        <>
                            <Box sx={{ 
                                mb: 2,
                                display: 'flex',
                                gap: 2,
                                justifyContent: 'center'
                            }}>
                                <Button 
                                    onClick={() => setFilter('all')} 
                                    variant={filter === 'all' ? 'contained' : 'outlined'}
                                    sx={{
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    All ({todos.length})
                                </Button>
                                <Button 
                                    onClick={() => setFilter('active')} 
                                    variant={filter === 'active' ? 'contained' : 'outlined'}
                                    sx={{
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    Active ({activeTodos.length})
                                </Button>
                                <Button 
                                    onClick={() => setFilter('completed')} 
                                    variant={filter === 'completed' ? 'contained' : 'outlined'}
                                    sx={{
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                >
                                    Completed ({completedTodos.length})
                                </Button>
                            </Box>
                            
                            {filteredTodos&&filteredTodos.length>0? <TodoList
                                todos={filteredTodos}
                                toggleTodo={toggleTodo}
                                deleteTodo={deleteTodo}
                            />:<Typography variant="h6" sx={{textAlign:'center'}}>No Todos Found</Typography>}
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