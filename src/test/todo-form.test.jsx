import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoForm from '../components/todo-form';

describe('TodoForm Component', () => {
    const mockSubmit = jest.fn();

    beforeEach(() => {
        mockSubmit.mockClear();
    });

    it('renders input field and submit button', () => {
        render(<TodoForm onSubmit={mockSubmit} />);
        
        expect(screen.getByPlaceholderText(/Add a new task/i)).toBeInTheDocument();
        expect(screen.getByText(/Add Task/i)).toBeInTheDocument();
    });

    it('updates input value when typing', () => {
        render(<TodoForm onSubmit={mockSubmit} />);
        const input = screen.getByPlaceholderText(/Add a new task/i);

        fireEvent.change(input, { target: { value: 'New Task' } });
        
        expect(input.value).toBe('New Task');
    });

    it('calls onSubmit with input value when form is submitted', () => {
        render(<TodoForm onSubmit={mockSubmit} />);
        
        const input = screen.getByPlaceholderText(/Add a new task/i);
        fireEvent.change(input, { target: { value: 'New Task' } });
        
        const submitButton = screen.getByText(/Add Task/i);
        fireEvent.click(submitButton);
        
        expect(mockSubmit).toHaveBeenCalledWith('New Task');
    });

    it('shows error message when submitting empty task', () => {
        render(<TodoForm onSubmit={mockSubmit} />);
        
        const submitButton = screen.getByText(/Add Task/i);
        fireEvent.click(submitButton);
        
        expect(screen.getByText('Task cannot be empty')).toBeInTheDocument();
        expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('shows error when task exceeds 100 characters', () => {
        render(<TodoForm onSubmit={mockSubmit} />);
        
        const input = screen.getByPlaceholderText(/Add a new task/i);
        const longText = 'a'.repeat(101);
        
        fireEvent.change(input, { target: { value: longText } });
        
        const submitButton = screen.getByText(/Add Task/i);
        fireEvent.click(submitButton);
        
        expect(screen.getByText(/100/)).toBeInTheDocument();
        expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('displays character count', () => {
        render(<TodoForm onSubmit={mockSubmit} />);
        
        const input = screen.getByPlaceholderText(/Add a new task/i);
        fireEvent.change(input, { target: { value: 'Test Task' } });
        
        expect(screen.getByText('9/100')).toBeInTheDocument();
    });

    it('clears input and error after successful submission', () => {
        render(<TodoForm onSubmit={mockSubmit} />);
        
        const input = screen.getByPlaceholderText(/Add a new task/i);
        
        // First trigger an error
        fireEvent.click(screen.getByText(/Add Task/i));
        expect(screen.getByText('Task cannot be empty')).toBeInTheDocument();
        
        // Then submit valid input
        fireEvent.change(input, { target: { value: 'Valid Task' } });
        fireEvent.click(screen.getByText(/Add Task/i));
        
        expect(input.value).toBe('');
        expect(screen.queryByText('Task cannot be empty')).not.toBeInTheDocument();
    });

    it('prevents form submission with only whitespace', () => {
        render(<TodoForm onSubmit={mockSubmit} />);
        
        const input = screen.getByPlaceholderText(/Add a new task/i);
        fireEvent.change(input, { target: { value: '   ' } });
        
        const submitButton = screen.getByText(/Add Task/i);
        fireEvent.click(submitButton);
        
        expect(screen.getByText('Task cannot be empty')).toBeInTheDocument();
        expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('handles form submission via enter key', () => {
        render(<TodoForm onSubmit={mockSubmit} />);
        
        const input = screen.getByPlaceholderText(/Add a new task/i);
        fireEvent.change(input, { target: { value: 'New Task' } });
        const form = screen.getByTestId('todo-input').closest('form');
        fireEvent.submit(form);
        
        expect(mockSubmit).toHaveBeenCalledWith('New Task');
        expect(input.value).toBe('');
    });
});