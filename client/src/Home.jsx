import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const API_BASE_URL = 'https://full-stack-todo-v05q.onrender.com';
const STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
};

const Home = ({ theme }) => {
    const [tab, setTab] = useState(1);
    const [task, setTask] = useState('');
    const [todos, setTodos] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [updateId, setUpdateId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/read-tasks`);
            setTodos(res.data);
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage('Failed to fetch tasks. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrUpdateTask = async (e) => {
        e.preventDefault();
        if (!task.trim()) {
            Swal.fire({
                title: 'Error!',
                text: 'Task cannot be empty.',
                icon: 'error',
                confirmButtonText: 'Okay',
            });
            return;
        }

        const url = isEdit ? `${API_BASE_URL}/update-task` : `${API_BASE_URL}/new-task`;
        const payload = isEdit ? { updateId, task } : { task };

        setLoading(true);
        try {
            const res = await axios.post(url, payload);
            setTodos(res.data);
            setTask('');
            setIsEdit(false);
            Swal.fire({
                title: 'Success!',
                text: isEdit ? 'Task updated successfully.' : 'Task added successfully.',
                icon: 'success',
                confirmButtonText: 'Great',
            });
        } catch (error) {
            setErrorMessage('Failed to save task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

        const handleEdit = (id, task) => {
        setIsEdit(true);
        setTask(task);
        setUpdateId(id);
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const res = await axios.post(`${API_BASE_URL}/delete-task`, { id });
                    setTodos(res.data);
                    Swal.fire('Deleted!', 'Your task has been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Failed!', 'Unable to delete the task.', 'error');
                } finally {
                    setLoading(false);
                }
            }
        });
    };
    
    const handleComplete = async (id) => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/complete-task`, { id });
            setTodos(res.data);
            Swal.fire({
                title: 'Completed!',
                text: 'Task marked as completed.',
                icon: 'success',
                confirmButtonText: 'Done',
            });
        } catch (error) {
            setErrorMessage('Failed to complete task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredTodos = () => {
        if (tab === 2) return todos.filter((todo) => todo.status === STATUS.ACTIVE);
        if (tab === 3) return todos.filter((todo) => todo.status === STATUS.COMPLETED);
        return todos;
    };

    const TodoItem = ({ todo }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex justify-between p-4 w-full sm:w-80 mt-3 rounded-lg shadow-md ${theme === 'light' ? 'bg-white' : 'bg-gray-800'
                }`}
        >
            <div>
                <p className="text-lg font-semibold">{todo.task}</p>
                <p className="text-xs text-gray-500">
                    {new Date(todo.createdAt).toLocaleDateString()}
                </p>
                <p className={`text-sm ${todo.status === STATUS.COMPLETED ? 'text-green-600' : 'text-blue-600'}`}>
                    Status: {todo.status}
                </p>
            </div>
            <div className="flex flex-col text-sm space-y-1">
                {todo.status !== STATUS.COMPLETED && (
                    <>
                        <button
                            className="text-blue-600 hover:underline"
                            onClick={() => handleEdit(todo.id, todo.task)}
                        >
                            Edit
                        </button>
                        <button
                            className="text-green-600 hover:underline"
                            onClick={() => handleComplete(todo.id)}
                        >
                            Complete
                        </button>
                    </>
                )}
                <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDelete(todo.id)}
                >
                    Delete
                </button>
            </div>
        </motion.div>
    );

    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="font-bold text-3xl mb-6">ToDo List</h2>

            {/* Form */}
            <form className="flex flex-col sm:flex-row gap-3 mb-6" onSubmit={handleAddOrUpdateTask}>
                <input
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    type="text"
                    placeholder="Enter a task"
                    className={`flex-1 p-2 rounded-md  ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-gray-700 border-gray-600'
                        }`}
                />
                <button
                    type="submit"
                    className="bg-sky-800 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    {isEdit ? 'Update' : 'Add'}
                </button>
            </form>

            {/* Tabs */}
            <div className="flex justify-around mb-4">
                {['All', 'Active', 'Completed'].map((label, index) => (
                    <p
                        key={index}
                        onClick={() => setTab(index + 1)}
                        className={`cursor-pointer px-3 py-1 rounded-md ${tab === index + 1
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {label}
                    </p>
                ))}
            </div>

            {/* Error Message */}
            {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

            {/* Loading Spinner */}
            {loading && <p className="text-center text-gray-500">Loading...</p>}

            {/* Todo List */}
            <div className="mt-4 space-y-2">
                <AnimatePresence>
                    {filteredTodos().length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500">
                            No tasks to display.
                        </motion.div>
                    ) : (
                        filteredTodos().map((todo) => <TodoItem key={todo.id} todo={todo} />)
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Home;
