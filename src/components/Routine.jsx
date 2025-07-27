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
      setShowForm(false);
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
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6"> {/* Adjusted padding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6"> {/* Changed to flex-col on small, flex-row on sm+ */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4 sm:mb-0"> {/* Adjusted font size and margin */}
          <Calendar className="text-blue-600" size={24} sm:size={28} /> {/* Adjusted icon size */}
          Daily Routines
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto text-sm sm:text-base" // Adjusted padding, gap, width, font size
        >
          <Plus size={18} sm:size={20} /> {/* Adjusted icon size */}
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
            className="w-full p-2 border rounded mb-3 text-sm sm:text-base" // Adjusted font size
          />
          <input
            type="time"
            value={newRoutine.time}
            onChange={(e) => setNewRoutine(prev => ({ ...prev, time: e.target.value }))}
            className="w-full p-2 border rounded mb-3 text-sm sm:text-base" // Adjusted font size
          />
          <div className="flex gap-2">
            <button
              onClick={addRoutine}
              className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm sm:text-base" // Adjusted padding and font size
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-3 py-1.5 rounded hover:bg-gray-600 text-sm sm:text-base" // Adjusted padding and font size
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {routines.length === 0 && !showForm ? (
          <p className="text-center text-gray-500 py-8 text-base sm:text-lg">
            No routines added yet. Click "Add Routine" to get started!
          </p>
        ) : (
          routines.map(routine => (
            <div
              key={routine.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg border ${ /* Adjusted padding, flex-col on small */
                routine.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2 sm:mb-0"> {/* Added margin bottom for small screens */}
                <button
                  onClick={() => toggleComplete(routine.id, routine.completed)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${ /* Adjusted size */
                    routine.completed ? 'bg-green-600 border-green-600' : 'border-gray-300'
                  }`}
                >
                  {routine.completed && <Check size={14} sm:size={16} className="text-white" />} {/* Adjusted icon size */}
                </button>
                <div>
                  <h3 className={`font-medium text-base sm:text-lg ${routine.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}> {/* Adjusted font size */}
                    {routine.name}
                  </h3>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500"> {/* Adjusted gap and font size */}
                    <Clock size={12} sm:size={14} /> {/* Adjusted icon size */}
                    {routine.time}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteRoutine(routine.id)}
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

export default Routine;