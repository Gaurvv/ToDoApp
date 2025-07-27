import React, { useState, useEffect } from 'react';
import { Plus, Check, X, CheckSquare } from 'lucide-react';

const Todo = ({ supabase, session }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!session) return;
    fetchTodos();
  }, [session]);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('inserted_at', { ascending: true });
    if (error) console.error('Error fetching todos:', error);
    else setTodos(data);
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      const { error } = await supabase.from('todos').insert([{
        user_id: session.user.id,
        text: newTodo.trim(),
        completed: false,
        priority: 'medium', // Default priority, could be expanded to allow user selection
      }]);
      if (error) console.error('Error adding todo:', error);
      else {
        setNewTodo('');
        fetchTodos();
      }
    }
  };

  const toggleTodo = async (id, currentStatus) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !currentStatus })
      .eq('id', id);
    if (error) console.error('Error updating todo:', error);
    else fetchTodos();
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) console.error('Error deleting todo:', error);
    else fetchTodos();
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6"> {/* Adjusted padding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6"> {/* Changed to flex-col on small, flex-row on sm+ */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4 sm:mb-0"> {/* Adjusted font size and margin */}
          <CheckSquare className="text-green-600" size={24} sm:size={28} /> {/* Adjusted icon size */}
          Todo List
        </h2>
        <div className="flex flex-wrap justify-center sm:justify-end gap-2 w-full sm:w-auto"> {/* Added flex-wrap for buttons */}
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-sm sm:text-base ${ /* Adjusted padding and font size */
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2"> {/* Changed to flex-col on small, flex-row on sm+ */}
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="flex-1 p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" // Adjusted padding and font size
          />
          <button
            onClick={addTodo}
            className="bg-blue-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto text-base sm:text-lg" // Adjusted padding, width, font size
          >
            <Plus size={18} sm:size={20} /> {/* Adjusted icon size */}
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-base sm:text-lg">
            No {filter === 'all' ? '' : filter} todos found.
            {filter === 'all' && ' Add a new task to get started!'}
          </p>
        ) : (
          filteredTodos.map(todo => (
            <div
              key={todo.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg border-l-4 ${ /* Adjusted padding, flex-col on small */
                getPriorityColor(todo.priority)
              } ${todo.completed ? 'bg-gray-50' : 'bg-white'} shadow-sm`}
            >
              <div className="flex items-center gap-3 mb-2 sm:mb-0"> {/* Added margin bottom for small screens */}
                <button
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${ /* Adjusted size */
                    todo.completed ? 'bg-green-600 border-green-600' : 'border-gray-300'
                  }`}
                >
                  {todo.completed && <Check size={14} sm:size={16} className="text-white" />} {/* Adjusted icon size */}
                </button>
                <span className={`text-base sm:text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}> {/* Adjusted font size */}
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 mt-2 sm:mt-0 self-end sm:self-auto" // Added margin top and self-align for small screens
              >
                <X size={18} sm:size={20} /> {/* Adjusted icon size */}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Todo;