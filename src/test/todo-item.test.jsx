import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoItem from '../components/todo-item';

describe('TodoItem Component', () => {
    const mockTodo = {
        id: 1,
        text: 'Test Todo',
        completed: false
    };
    const mockOnToggle = jest.fn();
    const mockOnDelete = jest.fn();

    beforeEach(() => {
        mockOnToggle.mockClear();
        mockOnDelete.mockClear();
    });

    it('renders todo item correctly', () => {
        render(
            <TodoItem 
                todo={mockTodo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const todoText = screen.getByText('Test Todo');
        expect(todoText).toBeInTheDocument();
        const checkbox = screen.getByTestId('todo-checkbox-1').querySelector('input[type="checkbox"]');
        expect(checkbox).not.toBeChecked();
    });

    it('shows completed styling when todo is completed', () => {
        const completedTodo = { ...mockTodo, completed: true };
        render(
            <TodoItem 
                todo={completedTodo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const listItemText = screen.getByText('Test Todo').closest('.MuiListItemText-root');
        expect(listItemText).toHaveStyle({
            textDecoration: 'line-through'
        });
        const checkbox = screen.getByTestId('todo-checkbox-1').querySelector('input[type="checkbox"]');
        expect(checkbox).toBeChecked();
    });

    it('calls onToggle when checkbox is clicked', () => {
        render(
            <TodoItem 
                todo={mockTodo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const checkbox = screen.getByTestId('todo-checkbox-1');
        fireEvent.click(checkbox);
        expect(mockOnToggle).toHaveBeenCalledWith(mockTodo.id);
    });

    it('calls onDelete when delete button is clicked', () => {
        render(
            <TodoItem 
                todo={mockTodo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        const deleteButton = screen.getByTestId('delete-button-1');
        fireEvent.click(deleteButton);
        expect(mockOnDelete).toHaveBeenCalledWith(mockTodo.id);
    });

    it('calls onToggle when ListItem is clicked', () => {
        render(
            <TodoItem 
                todo={mockTodo}
                onToggle={mockOnToggle}
                onDelete={mockOnDelete}
            />
        );

        // Find and click the ListItem content area
        const listItemContent = screen.getByText('Test Todo').closest('.MuiListItem-root');
        fireEvent.click(listItemContent);
        expect(mockOnToggle).toHaveBeenCalledWith(mockTodo.id);
    });
});