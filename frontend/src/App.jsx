import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [filter, setFilter] = useState('all');

  const API_URL = 'http://localhost:3333/tasks';

  // Fetch tasks from backend
  useEffect(() => {
    fetch(API_URL)
      .then(response => response.json())
      .then(data => setTasks(data))
      .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  // Create a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      alert('Task title is required.');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription }),
      });
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. See console for details.');
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task. See console for details.');
    }
  };

  // Toggle task completion
  const handleToggleComplete = async (task) => {
    try {
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...task, completed: !task.completed }),
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      const updatedTask = await response.json();
      setTasks(tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. See console for details.');
    }
  };

  // Start editing a task
  const handleStartEdit = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  // Save edited task
  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      alert('Task title is required.');
      return;
    }

    try {
      const task = tasks.find(t => t.id === editingTask);
      const response = await fetch(`${API_URL}/${editingTask}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: editTitle, 
          description: editDescription,
          completed: task.completed
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      const updatedTask = await response.json();
      setTasks(tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)));
      setEditingTask(null);
      setEditTitle('');
      setEditDescription('');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. See console for details.');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditDescription('');
  };

  // Clear completed tasks
  const handleClearCompleted = async () => {
    const completedTaskIds = tasks.filter(task => task.completed).map(task => task.id);
    
    if (completedTaskIds.length === 0) {
      alert('No completed tasks to clear.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${completedTaskIds.length} completed task(s)?`)) {
      return;
    }

    try {
      await Promise.all(completedTaskIds.map(id => 
        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      ));
      setTasks(tasks.filter(task => !task.completed));
    } catch (error) {
      console.error('Error clearing completed tasks:', error);
      alert('Error clearing completed tasks. See console for details.');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
      <div className="h-full grid grid-cols-12 gap-0">
        
        {/* Left Sidebar */}
        <div className="col-span-3 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col shadow-xl">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">TaskFlow</h1>
                <p className="text-xs text-gray-500">Smart productivity</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b border-gray-100/50">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-blue-700">{totalTasks}</div>
                <div className="text-xs text-blue-600">Total</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-orange-700">{pendingTasks}</div>
                <div className="text-xs text-orange-600">Pending</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-green-700">{completionPercentage}%</div>
                <div className="text-xs text-green-600">Done</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{completedTasks}/{totalTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-2 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Add Task Form */}
          <div className="p-4 border-b border-gray-100/50">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Quick Add
            </h3>
            <form onSubmit={handleAddTask} className="space-y-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-900 placeholder-gray-500"
              />
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Add description..."
                rows="2"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none bg-white text-gray-900 placeholder-gray-500"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
              >
                Add Task
              </button>
            </form>
          </div>

          {/* Filters */}
          <div className="p-4 flex-1">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              Filters
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setFilter('all')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex justify-between items-center group ${
                  filter === 'all' ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  All Tasks
                </span>
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{totalTasks}</span>
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex justify-between items-center group ${
                  filter === 'pending' ? 'bg-orange-100 text-orange-700 shadow-sm border border-orange-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending
                </span>
                <span className="text-xs bg-orange-200 px-2 py-0.5 rounded-full">{pendingTasks}</span>
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 flex justify-between items-center group ${
                  filter === 'completed' ? 'bg-green-100 text-green-700 shadow-sm border border-green-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Completed
                </span>
                <span className="text-xs bg-green-200 px-2 py-0.5 rounded-full">{completedTasks}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-9 flex flex-col bg-white/30 backdrop-blur-sm">
          
          {/* Top Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  {filter === 'all' && (
                    <>
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      All Tasks
                    </>
                  )}
                  {filter === 'pending' && (
                    <>
                      <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pending Tasks
                    </>
                  )}
                  {filter === 'completed' && (
                    <>
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Completed Tasks
                    </>
                  )}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {completedTasks > 0 && (
                  <button
                    onClick={handleClearCompleted}
                    className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    Clear Completed ({completedTasks})
                  </button>
                )}
                <div className="text-sm text-gray-400 px-3 py-2 bg-gray-100 rounded-lg">
                  {tasks.length > 0 ? `${completionPercentage}% Complete` : 'No tasks'}
                </div>
              </div>
            </div>
          </div>

          {/* Task List Area */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {filter === 'all' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                      {filter === 'pending' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                      {filter === 'completed' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {filter === 'all' && 'No tasks yet'}
                    {filter === 'pending' && 'All caught up!'}
                    {filter === 'completed' && 'No completed tasks'}
                  </h3>
                  <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                    {filter === 'all' && 'Create your first task to get started with your productivity journey.'}
                    {filter === 'pending' && 'All your tasks are completed. Time to add some new ones!'}
                    {filter === 'completed' && 'Complete some tasks to see them here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(task => (
                    <div
                      key={task.id}
                      className={`group bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] ${
                        task.completed ? 'opacity-70 border-green-200 bg-green-50/30' : 'hover:border-blue-200'
                      }`}
                    >
                      {editingTask === task.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white text-gray-900 placeholder-gray-500"
                            placeholder="Task title"
                          />
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm bg-white text-gray-900 placeholder-gray-500"
                            rows="3"
                            placeholder="Task description"
                          />
                          <div className="flex space-x-3">
                            <button
                              onClick={handleSaveEdit}
                              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleComplete(task)}
                              className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                                task.completed
                                  ? 'bg-green-500 border-green-500 text-white shadow-lg scale-110'
                                  : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                              }`}
                            >
                              {task.completed && (
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-semibold text-gray-900 mb-2 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className={`text-sm text-gray-600 mb-3 break-words leading-relaxed ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-400">
                                <span className="flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Created: {new Date(task.created_at).toLocaleDateString()}
                                </span>
                                {task.updated_at && task.updated_at !== task.created_at && (
                                  <span className="flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Updated: {new Date(task.updated_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                            <button
                              onClick={() => handleStartEdit(task)}
                              className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                              title="Edit task"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                              title="Delete task"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
