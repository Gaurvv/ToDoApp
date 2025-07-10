import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Save, BookOpen, FileText } from 'lucide-react';

const Notes = ({ supabase, session }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  useEffect(() => {
    if (!session) return;
    fetchNotes();
  }, [session]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('inserted_at', { ascending: true });
    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data);
    }
  };

  const addNote = async () => {
    if (!newNote.title || !newNote.content) return;

    const { error } = await supabase.from('notes').insert([{
      user_id: session.user.id,
      title: newNote.title,
      content: newNote.content,
      date: new Date().toISOString().split('T')[0],
    }]);

    if (error) {
      console.error('Error adding note:', error);
    } else {
      setNewNote({ title: '', content: '' });
      fetchNotes();
    }
  };

  const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      console.error('Error deleting note:', error);
    } else {
      if (selectedNote?.id === id) setSelectedNote(null);
      fetchNotes();
    }
  };

  const saveEdit = async () => {
    if (!editingNote) return;

    const { error } = await supabase
      .from('notes')
      .update({
        title: editingNote.title,
        content: editingNote.content,
      })
      .eq('id', editingNote.id);

    if (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Check console.');
      return;
    }

    setNotes(prev => prev.map(note => (note.id === editingNote.id ? editingNote : note)));
    setSelectedNote(editingNote);
    setEditingNote(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-purple-600" size={28} />
          Notes
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notes List */}
        <div>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              placeholder="Note content..."
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              className="w-full p-2 border rounded mb-2 h-20"
            />
            <button
              onClick={addNote}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Add Note
            </button>
          </div>

          <div className="space-y-2">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedNote?.id === note.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-medium text-gray-800">{note.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{note.date}</p>
                <p className="text-sm text-gray-600 mt-2 truncate">{note.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Note Detail */}
        <div>
          {selectedNote ? (
            <div className="border rounded-lg p-4">
              {editingNote ? (
                <div>
                  <input
                    type="text"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border rounded mb-3 text-lg font-medium"
                  />
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full p-2 border rounded mb-3 h-40"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{selectedNote.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingNote(selectedNote)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => deleteNote(selectedNote.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{selectedNote.date}</p>
                  <div className="text-gray-700 whitespace-pre-wrap">{selectedNote.content}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Select a note to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
