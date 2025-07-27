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
      if (editingNote?.id === id) setEditingNote(null);
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

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setEditingNote(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-purple-600 w-6 h-6 sm:w-7 sm:h-7" />
          Notes
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={selectedNote && "hidden md:block"}>
          <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded mb-2 text-sm sm:text-base"
            />
            <textarea
              placeholder="Note content..."
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              className="w-full p-2 border rounded mb-2 h-24 sm:h-20 text-sm sm:text-base"
            />
            <button
              onClick={addNote}
              className="bg-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded hover:bg-purple-700 flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus size={18} />
              Add Note
            </button>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-1">
            {notes.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-base sm:text-lg">
                No notes yet. Add a new note to get started!
              </p>
            ) : (
              notes.map(note => (
                <div
                  key={note.id}
                  onClick={() => handleNoteClick(note)}
                  className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedNote?.id === note.id ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-base sm:text-lg text-gray-800">{note.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{note.date}</p>
                  <p className="text-sm text-gray-600 mt-2 truncate-3-lines">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`${selectedNote ? 'block' : 'hidden'} md:block`}>
          {selectedNote ? (
            <div className="border rounded-lg p-4 sm:p-6 shadow-md h-full flex flex-col">
              {editingNote ? (
                <>
                  <input
                    type="text"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border rounded mb-3 text-lg sm:text-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote(prev => ({ ...prev, content: e.target.value }))}
                    className="flex-1 w-full p-2 border rounded mb-3 h-48 sm:h-64 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={saveEdit}
                      className="bg-green-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="bg-gray-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded hover:bg-gray-600 text-sm sm:text-base w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">{selectedNote.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingNote(selectedNote)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit Note"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => deleteNote(selectedNote.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete Note"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{selectedNote.date}</p>
                  <div className="text-gray-700 whitespace-pre-wrap flex-1 overflow-y-auto custom-scrollbar pr-1 text-base sm:text-lg">
                    {selectedNote.content}
                  </div>
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="md:hidden mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    ← Back to Notes
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-6 sm:p-8 text-center text-gray-500 h-full flex flex-col items-center justify-center">
              <BookOpen size={40} className="mx-auto mb-4 text-gray-300" />
              <p className="text-base sm:text-lg">
                Select a note from the left to view details
                <span className="md:hidden"> or add a new one.</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
