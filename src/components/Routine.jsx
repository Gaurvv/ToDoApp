import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Calendar, Clock } from 'lucide-react';

const Routine = ({ supabase, session }) => {
  const [routines, setRoutines] = useState([]);
  const [newRoutine, setNewRoutine] = useState({ name: '', time: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetchRoutines();
  }, [session]);

  const fetchRoutines = async () => {
    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', session.user.id)
      .order('inserted_at', { ascending: true });

    if (error) {
      console.error('Error fetching routines:', error);
    } else {
      setRoutines(data);
    }
  };

  const addRoutine = async () => {
    if (!newRoutine.name || !newRoutine.time) return;

    const { error } = await supabase.from('routines').insert([{
      user_id: session.user.id,
      name: newRoutine.name,
      time: newRoutine.time,
      completed: false,
      // inserted_at is handled by Supabase default value now
    }]);

    if (error) {
      console.error('Error adding routine:', error);
    } else {
      setNewRoutine({ name: '', time: '' });
      setShowForm(false); // <--- THIS IS THE KEY FIX: Hide the form after successful add
      fetchRoutines();
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    const { error } = await supabase
      .from('routines')
      .update({ completed: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error toggling complete:', error);
    } else {
      fetchRoutines();
    }
  };

  const deleteRoutine = async (id) => {
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting routine:', error);
    } else {
      fetchRoutines();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-blue-600" size={28} />
          Daily Routines
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Routine
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Routine name"
            value={newRoutine.name}
            onChange={(e) => setNewRoutine(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border rounded mb-3"
          />
          <input
            type="time"
            value={newRoutine.time}
            onChange={(e) => setNewRoutine(prev => ({ ...prev, time: e.target.value }))}
            className="w-full p-2 border rounded mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={addRoutine}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {routines.map(routine => (
          <div
            key={routine.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              routine.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleComplete(routine.id, routine.completed)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  routine.completed ? 'bg-green-600 border-green-600' : 'border-gray-300'
                }`}
              >
                {routine.completed && <Check size={16} className="text-white" />}
              </button>
              <div>
                <h3 className={`font-medium ${routine.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                  {routine.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={14} />
                  {routine.time}
                </div>
              </div>
            </div>
            <button
              onClick={() => deleteRoutine(routine.id)}
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

export default Routine;