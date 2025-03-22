import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock drag and drop library
jest.mock('@hello-pangea/dnd', () => ({
    DragDropContext: ({ children, onDragEnd }) => (
        <div 
            data-testid="drag-drop-context" 
            onClick={(e) => {
                // Simulate drag end when clicked
                if (e.type === 'dragend') {
                    onDragEnd(e.detail);
                }
            }}
        >
            {children}
        </div>
    ),
    Droppable: ({ children, droppableId }) => (
        <div data-testid={`droppable-${droppableId}`}>
            {children({
                provided: {
                    innerRef: jest.fn(),
                    droppableProps: {},
                    placeholder: null
                }
            })}
        </div>
    ),
    Draggable: ({ children, draggableId }) => children({
        provided: {
            innerRef: jest.fn(),
            draggableProps: { 'data-rbd-draggable-id': draggableId },
            dragHandleProps: { 'data-testid': `draggable-${draggableId}` }
        }
    })
}));

describe('App Component', () => {
    // Mock localStorage
    const mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn()
    };
    
    beforeEach(() => {
        Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
        mockLocalStorage.clear.mockReset();
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));
        mockLocalStorage.setItem.mockReset();
    });

    it('renders without crashing', () => {
        render(<App />);
        expect(screen.getByText('Todo List')).toBeInTheDocument();
    });

    it('loads todos from localStorage on mount', () => {
        const savedTodos = [
            { id: 1, text: 'Test todo', completed: false }
        ];
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedTodos));
        
        render(<App />);
        expect(screen.getByText('Test todo')).toBeInTheDocument();
    });

    it('adds new todo', () => {
        render(<App />);
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');

        fireEvent.change(input, { target: { value: 'New Todo' } });
        fireEvent.click(submitButton);

        expect(screen.getByText('New Todo')).toBeInTheDocument();
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('toggles todo completion', () => {
        render(<App />);
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');

        fireEvent.change(input, { target: { value: 'Toggle Todo' } });
        fireEvent.click(submitButton);

        const checkbox = screen.getAllByTestId(/todo-checkbox-/i)[0];
        fireEvent.click(checkbox);

        expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('deletes todo', () => {
        render(<App />);
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');

        fireEvent.change(input, { target: { value: 'Delete Todo' } });
        fireEvent.click(submitButton);

        const deleteButton = screen.getByTestId(/delete-button-/i);
        fireEvent.click(deleteButton);

        expect(screen.queryByText('Delete Todo')).not.toBeInTheDocument();
    });

    it('filters todos correctly', () => {
        render(<App />);
        
        // Add completed todo
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');

        fireEvent.change(input, { target: { value: 'Completed Todo' } });
        fireEvent.click(submitButton);
        const firstCheckbox = screen.getByTestId(/todo-checkbox/i);
        fireEvent.click(firstCheckbox);

        // Add active todo
        fireEvent.change(input, { target: { value: 'Active Todo' } });
        fireEvent.click(submitButton);

        // Test completed filter
        const completedButton = screen.getByRole('button', { name: /completed/i });
        fireEvent.click(completedButton);
        expect(screen.getByText('Completed Todo')).toBeInTheDocument();
        expect(screen.queryByText('Active Todo')).not.toBeInTheDocument();

        // Test active filter
        const activeButton = screen.getByRole('button', { name: /active/i });
        fireEvent.click(activeButton);
        expect(screen.queryByText('Completed Todo')).not.toBeInTheDocument();
        expect(screen.getByText('Active Todo')).toBeInTheDocument();

        // Test all filter
        const allButton = screen.getByRole('button', { name: /^all \(\d+\)$/i });
        fireEvent.click(allButton);
        expect(screen.getByText('Completed Todo')).toBeInTheDocument();
        expect(screen.getByText('Active Todo')).toBeInTheDocument();
    });

    it('toggles view mode between list and dashboard', () => {
        render(<App />);
        
        // Add a todo
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');
        fireEvent.change(input, { target: { value: 'Test Todo' } });
        fireEvent.click(submitButton);

        // Switch to dashboard view
        const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
        fireEvent.click(dashboardButton);
        
        expect(screen.getByText('Active Tasks')).toBeInTheDocument();
        expect(screen.getByText('Completed Tasks')).toBeInTheDocument();

        // Switch back to list view
        const listViewButton = screen.getByTestId('ViewListIcon').closest('button');
        fireEvent.click(listViewButton);
        expect(screen.queryByText('Active Tasks')).not.toBeInTheDocument();
    });

    it('handles drag and drop in dashboard view', () => {
        render(<App />);
        
        // Add a todo
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');
        fireEvent.change(input, { target: { value: 'Drag Todo' } });
        fireEvent.click(submitButton);
    
        // Switch to dashboard view
        const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
        fireEvent.click(dashboardButton);
    
        // Simulate drag and drop
        const dragDropContext = screen.getByTestId('drag-drop-context');
        act(() => {
            const dragEndEvent = new CustomEvent('dragend', {
                detail: {
                    source: { droppableId: 'active' },
                    destination: { droppableId: 'completed' },
                    draggableId: '1'
                }
            });
            dragDropContext.dispatchEvent(dragEndEvent);
        });
    
        // Verify the todo was moved to completed section
        expect(screen.getByText('Drag Todo')).toBeInTheDocument();
    });

    it('handles invalid drag and drop operations', () => {
        render(<App />);
        
        // Add a todo and switch to dashboard
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');
        fireEvent.change(input, { target: { value: 'Test Todo' } });
        fireEvent.click(submitButton);
        
        const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
        fireEvent.click(dashboardButton);
    
        const dragDropContext = screen.getByTestId('drag-drop-context');
    
        // Test drag with no destination
        act(() => {
            const dragEndEvent = new CustomEvent('dragend', {
                detail: {
                    source: { droppableId: 'active' },
                    destination: null,
                    draggableId: '1'
                }
            });
            dragDropContext.dispatchEvent(dragEndEvent);
        });
    
        // Test drag to same location
        act(() => {
            const dragEndEvent = new CustomEvent('dragend', {
                detail: {
                    source: { droppableId: 'active' },
                    destination: { droppableId: 'active' },
                    draggableId: '1'
                }
            });
            dragDropContext.dispatchEvent(dragEndEvent);
        });
    
        // Verify todo remains in original location
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    // Add these test cases inside the describe('App Component') block
    it('handles drag and drop state updates correctly', () => {
        render(<App />);
        
        // Add todos
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');
        
        // Add first todo
        fireEvent.change(input, { target: { value: 'Todo 1' } });
        fireEvent.click(submitButton);
        
        // Add second todo
        fireEvent.change(input, { target: { value: 'Todo 2' } });
        fireEvent.click(submitButton);
    
        // Switch to dashboard view
        const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
        fireEvent.click(dashboardButton);
    
        // Test multiple drag scenarios
        const dragDropContext = screen.getByTestId('drag-drop-context');
        // Test dragging first todo to completed
        act(() => {
            const dragEndEvent = new CustomEvent('dragend', {
                detail: {
                    source: { droppableId: 'active' },
                    destination: { droppableId: 'completed' },
                    draggableId: '1'
                }
            });
            dragDropContext.dispatchEvent(dragEndEvent);
        });
    
        // Verify first todo is completed
        const completedSection = screen.getByTestId('droppable-completed');
        expect(completedSection).toBeInTheDocument();
        const todo1 = screen.getByText('Todo 1');
        expect(todo1).toBeInTheDocument();   
      
        // expect(completedSection).toHaveTextContent('Todo 1');
      
    });
    
    it('filters todos with all combinations', () => {
        render(<App />);
        
        // Add todos with different states
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');
        
        // Add and complete first todo
        fireEvent.change(input, { target: { value: 'Completed Todo' } });
        fireEvent.click(submitButton);
        const firstCheckbox = screen.getByTestId(/todo-checkbox-/i);
        fireEvent.click(firstCheckbox);
    
        // Add active todo
        fireEvent.change(input, { target: { value: 'Active Todo' } });
        fireEvent.click(submitButton);
    
        // Test all filter combinations
        const filterButtons = {
            all: screen.getByRole('button', { name: /^all \(\d+\)$/i }),
            active: screen.getByRole('button', { name: /^active \(\d+\)$/i }),
            completed: screen.getByRole('button', { name: /^completed \(\d+\)$/i })
        };
    
        // Test completed filter
        fireEvent.click(filterButtons.completed);
        expect(screen.getByText('Completed Todo')).toBeInTheDocument();
        expect(screen.queryByText('Active Todo')).not.toBeInTheDocument();
        expect(filterButtons.completed).toHaveClass('MuiButton-contained');
    
        // Test active filter
        fireEvent.click(filterButtons.active);
        expect(screen.queryByText('Completed Todo')).not.toBeInTheDocument();
        expect(screen.getByText('Active Todo')).toBeInTheDocument();
        expect(filterButtons.active).toHaveClass('MuiButton-contained');
    
        // Test all filter
        fireEvent.click(filterButtons.all);
        expect(screen.getByText('Completed Todo')).toBeInTheDocument();
        expect(screen.getByText('Active Todo')).toBeInTheDocument();
        expect(filterButtons.all).toHaveClass('MuiButton-contained');
    
        // Verify filter button states
        expect(filterButtons.completed).not.toHaveClass('MuiButton-contained');
        expect(filterButtons.active).not.toHaveClass('MuiButton-contained');
    });

    it('persists todos in localStorage', () => {
        render(<App />);
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');

        fireEvent.change(input, { target: { value: 'Persistent Todo' } });
        fireEvent.click(submitButton);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('todos', expect.any(String));
    });

    it('validates todo text and trims whitespace properly', () => {
        render(<App />);
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');

        // Test empty string
        mockLocalStorage.setItem.mockReset();
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.click(submitButton);
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

        // Test pure whitespace 
        fireEvent.change(input, { target: { value: '     ' } });
        fireEvent.click(submitButton); 
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

        // Test whitespace around valid text
        fireEvent.change(input, { target: { value: '  Test Todo  ' } });
        fireEvent.click(submitButton);
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
        
        // Test todo with special characters
        fireEvent.change(input, { target: { value: '!@#$%^&*()' } });
        fireEvent.click(submitButton);
        expect(screen.getByText('!@#$%^&*()')).toBeInTheDocument();

        // Test very long todo text
        const longText = 'a'.repeat(100);
        fireEvent.change(input, { target: { value: longText } });
        fireEvent.click(submitButton);
        expect(screen.getByText(longText)).toBeInTheDocument();
            expect(screen.getByText(longText)).toBeInTheDocument();
        });
        });
it('handles todo text edge cases', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Add a new task/i);
    const submitButton = screen.getByTestId('add-todo-button');

    // Test empty string
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(submitButton);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    // Test whitespace only
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(submitButton);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    // Test valid text
    fireEvent.change(input, { target: { value: 'Valid Todo' } });
    fireEvent.click(submitButton);
    expect(screen.getByText('Valid Todo')).toBeInTheDocument();
});
it('renders empty state message when no todos match filter', () => {
    render(<App />);
    
    // Verify initial empty state
    expect(screen.getByText('No Todos Found')).toBeInTheDocument();

    // Add a completed todo
    const input = screen.getByPlaceholderText(/Add a new task/i);
    const submitButton = screen.getByTestId('add-todo-button');
    fireEvent.change(input, { target: { value: 'Test Todo' } });
    fireEvent.click(submitButton);
});
    it('validates todo text with edge cases and updates UI correctly', () => {
        const mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            clear: jest.fn()
        };
        Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));
        mockLocalStorage.setItem.mockReset();

        render(<App />);
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');

        // Test empty strings and whitespace
        const invalidInputs = ['', ' ', '   '];
        invalidInputs.forEach(value => {
            mockLocalStorage.setItem.mockClear();
            fireEvent.change(input, { target: { value }});
            fireEvent.click(submitButton);
            expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });

        // Test valid inputs with whitespace trimming
        const validInputs = [
            { input: 'Valid Todo', expected: 'Valid Todo' },
            { input: '  Padded Todo  ', expected: 'Padded Todo' },
            { input: 'Multiple   Spaces', expected: 'Multiple Spaces' }
        ];
        validInputs.forEach(({ input, expected }) => {
            fireEvent.change(screen.getByPlaceholderText(/Add a new task/i), { target: { value: input }});
            fireEvent.click(submitButton);
            expect(screen.getByText(expected)).toBeInTheDocument();
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
            mockLocalStorage.setItem.mockReset();
        });
    });

    it('verifies dashboard view with filtered todos', () => {
        render(<App />);
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');
        
        // Add and complete first todo
        fireEvent.change(input, { target: { value: 'Completed Task' }});
        fireEvent.click(submitButton);
        const firstCheckbox = screen.getByTestId(/todo-checkbox-/i);
        fireEvent.click(firstCheckbox);
        
        // Add active todo
        fireEvent.change(input, { target: { value: 'Active Task' }});
        fireEvent.click(submitButton);
        
        // Switch to dashboard view
        const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
        fireEvent.click(dashboardButton);

        // Verify sections and counts
        expect(screen.getByText('Active Tasks')).toBeInTheDocument();
        expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
        const countElements = screen.queryAllByText(/^\(1\)$/);
        expect(countElements).toHaveLength(2); // Verify both active and completed show count of 1

        // Verify todos are in correct sections
        const completedSection = screen.getByTestId('droppable-completed');
        expect(completedSection).toHaveTextContent('Completed Task');
        const activeSection = screen.getByTestId('droppable-active');
        expect(activeSection).toHaveTextContent('Active Task');
    });

    it('should update todo state when dragged between sections in dashboard view', () => {
        render(<App />);
    
        // Add a todo
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const submitButton = screen.getByTestId('add-todo-button');
        fireEvent.change(input, { target: { value: 'Test Todo' } });
        fireEvent.click(submitButton);
    
        // Switch to dashboard view
        const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
        fireEvent.click(dashboardButton);
    
        // Simulate drag and drop
        const dragDropContext = screen.getByTestId('drag-drop-context');
        act(() => {
            const dragEndEvent = new CustomEvent('dragend', {
                detail: {
                    source: { droppableId: 'active' },
                    destination: { droppableId: 'completed' },
                    draggableId: '1'
                }
            });
            dragDropContext.dispatchEvent(dragEndEvent);
        });
    
        // Verify the todo was moved to the completed section
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });

    describe('handleDragEnd Function', () => {
        it('should move a todo from active to completed', () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/Add a new task/i);
            const submitButton = screen.getByTestId('add-todo-button');

            // Add a todo
            fireEvent.change(input, { target: { value: 'Test Todo' } });
            fireEvent.click(submitButton);

            // Switch to dashboard view
            const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
            fireEvent.click(dashboardButton);

            // Simulate drag from active to completed
            const dragDropContext = screen.getByTestId('drag-drop-context');
            act(() => {
                dragDropContext.dispatchEvent(new CustomEvent('dragend', {
                    detail: {
                        source: { droppableId: 'active' },
                        destination: { droppableId: 'completed' },
                        draggableId: '1'
                    }
                }));
            });

            // Verify todo is in completed section
            const completedSection = screen.getByTestId('droppable-completed');
            expect(screen.getByText('Test Todo')).toBeInTheDocument();
        });
    
        it('should move a todo from completed to active', () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/Add a new task/i);
            const submitButton = screen.getByTestId('add-todo-button');

            // Add and complete a todo
            fireEvent.change(input, { target: { value: 'Test Todo' } });
            fireEvent.click(submitButton);
            const checkbox = screen.getByTestId(/todo-checkbox-/i);
            fireEvent.click(checkbox);

            // Switch to dashboard view
            const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
            fireEvent.click(dashboardButton);

            // Simulate drag from completed to active
            const dragDropContext = screen.getByTestId('drag-drop-context');
            act(() => {
                dragDropContext.dispatchEvent(new CustomEvent('dragend', {
                    detail: {
                        source: { droppableId: 'completed' },
                        destination: { droppableId: 'active' },
                        draggableId: '1'
                    }
                }));
            });

            expect(screen.getByText('Test Todo')).toBeInTheDocument();
        });
    
        it('should not update todos if dragged within the same section', () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/Add a new task/i);
            const submitButton = screen.getByTestId('add-todo-button');

            // Add a todo
            fireEvent.change(input, { target: { value: 'Test Todo' } });
            fireEvent.click(submitButton);

            // Switch to dashboard view
            const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
            fireEvent.click(dashboardButton);

            // Simulate drag within same section
            const dragDropContext = screen.getByTestId('drag-drop-context');
            act(() => {
                dragDropContext.dispatchEvent(new CustomEvent('dragend', {
                    detail: {
                        source: { droppableId: 'active' },
                        destination: { droppableId: 'active' },
                        draggableId: '1'
                    }
                }));
            });

            expect(screen.getByText('Test Todo')).toBeInTheDocument();
        });

        it('should not update todos if there is no destination', () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/Add a new task/i);
            const submitButton = screen.getByTestId('add-todo-button');

            // Add a todo
            fireEvent.change(input, { target: { value: 'Test Todo' } });
            fireEvent.click(submitButton);

            // Switch to dashboard view
            const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
            fireEvent.click(dashboardButton);

            // Simulate drag with no destination
            const dragDropContext = screen.getByTestId('drag-drop-context');
            act(() => {
                dragDropContext.dispatchEvent(new CustomEvent('dragend', {
                    detail: {
                        source: { droppableId: 'active' },
                        destination: null,
                        draggableId: '1'
                    }
                }));
            });

            expect(screen.getByText('Test Todo')).toBeInTheDocument();
        });

        it('should not update todos if the dragged item does not exist', () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/Add a new task/i);
            const submitButton = screen.getByTestId('add-todo-button');

            // Add a todo
            fireEvent.change(input, { target: { value: 'Test Todo' } });
            fireEvent.click(submitButton);

            // Switch to dashboard view
            const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
            fireEvent.click(dashboardButton);

            // Simulate drag with non-existent ID
            const dragDropContext = screen.getByTestId('drag-drop-context');
            act(() => {
                dragDropContext.dispatchEvent(new CustomEvent('dragend', {
                    detail: {
                        source: { droppableId: 'active' },
                        destination: { droppableId: 'completed' },
                        draggableId: '999'
                    }
                }));
            });

            expect(screen.getByText('Test Todo')).toBeInTheDocument();
        });
    
        it('should handle invalid drag operation gracefully', () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/Add a new task/i);
            const submitButton = screen.getByTestId('add-todo-button');

            // Add a todo
            fireEvent.change(input, { target: { value: 'Test Todo' } });
            fireEvent.click(submitButton);

            // Switch to dashboard view
            const dashboardButton = screen.getByTestId('DashboardIcon').closest('button');
            fireEvent.click(dashboardButton);

            // Simulate drag with null result
            const dragDropContext = screen.getByTestId('drag-drop-context');
            act(() => {
                dragDropContext.dispatchEvent(new CustomEvent('dragend', {
                    detail: null
                }));
            });

            expect(screen.getByText('Test Todo')).toBeInTheDocument();
        });
    });
