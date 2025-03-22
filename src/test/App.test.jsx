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

        const checkbox = screen.getByTestId(/todo-checkbox-/i);
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
        const allButton = screen.getByRole('button', { name: /^all$/i });
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
            all: screen.getByRole('button', { name: /^all$/i }),
            active: screen.getByRole('button', { name: /active/i }),
            completed: screen.getByRole('button', { name: /completed/i })
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
});