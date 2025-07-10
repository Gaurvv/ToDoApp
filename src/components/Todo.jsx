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
        priority: 'medium',
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CheckSquare className="text-green-600" size={28} />
          Todo List
        </h2>
        <div className="flex gap-2">
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTodo}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredTodos.map(todo => (
          <div
            key={todo.id}
            className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
              getPriorityColor(todo.priority)
            } ${todo.completed ? 'bg-gray-50' : 'bg-white'} shadow-sm`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleTodo(todo.id, todo.completed)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  todo.completed ? 'bg-green-600 border-green-600' : 'border-gray-300'
                }`}
              >
                {todo.completed && <Check size={16} className="text-white" />}
              </button>
              <span className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {todo.text}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Todo;
