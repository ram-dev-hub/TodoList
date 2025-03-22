import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoList from '../components/todo-list';

describe('TodoList', () => {
    const mockTodos = [
        { id: 1, text: 'Test todo 1', completed: false },
        { id: 2, text: 'Test todo 2', completed: true }
    ];
    const mockToggleTodo = jest.fn();
    const mockDeleteTodo = jest.fn();

    beforeEach(() => {
        mockToggleTodo.mockClear();
        mockDeleteTodo.mockClear();
    });

    it('renders list of todos', () => {
        render(
            <TodoList 
                todos={mockTodos}
                toggleTodo={mockToggleTodo}
                deleteTodo={mockDeleteTodo}
            />
        );
        
        expect(screen.getByText('Test todo 1')).toBeInTheDocument();
        expect(screen.getByText('Test todo 2')).toBeInTheDocument();
    });

    it('renders empty list when no todos', () => {
        render(
            <TodoList 
                todos={[]}
                toggleTodo={mockToggleTodo}
                deleteTodo={mockDeleteTodo}
            />
        );
        
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('calls toggleTodo when checkbox is clicked', () => {
        render(
            <TodoList 
                todos={mockTodos}
                toggleTodo={mockToggleTodo}
                deleteTodo={mockDeleteTodo}
            />
        );

        const checkbox = screen.getAllByRole('checkbox')[0];
        fireEvent.click(checkbox);
        
        expect(mockToggleTodo).toHaveBeenCalledWith(1);
    });

    it('calls deleteTodo when delete button is clicked', () => {
        render(
            <TodoList 
                todos={mockTodos}
                toggleTodo={mockToggleTodo}
                deleteTodo={mockDeleteTodo}
            />
        );

        const deleteButtons = screen.getAllByRole('button');
        fireEvent.click(deleteButtons[0]);
        
        expect(mockDeleteTodo).toHaveBeenCalledWith(1);
    });
});