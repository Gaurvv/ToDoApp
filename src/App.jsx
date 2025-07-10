import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, FileText, LogOut } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Routine from './components/Routine';
import Todo from './components/Todo';
import Notes from './components/Notes';
import Auth from './components/Auth';

const supabaseUrl = 'https://bhdkzlcegklpaihqswlz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZGt6bGNlZ2tscGFpaHFzd2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTI2NTUsImV4cCI6MjA2NzcyODY1NX0.4ooviWLbv-ZZQ1vdfhZdyqPLZI0D08aszLpquWO5cUo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const App = () => {
  const [activeTab, setActiveTab] = useState('routines');
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session) setShowAuth(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert('Logout error');
    else alert('Logged out');
  };

  const tabs = [
    { id: 'routines', label: 'Routines', icon: Calendar },
    { id: 'todos', label: 'Todos', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText }
  ];

  // FIX: Pass supabase and session to all components
  const renderContent = () => {
    switch (activeTab) {
      case 'routines':
        return <Routine supabase={supabase} session={session} />;
      case 'todos':
        return <Todo supabase={supabase} session={session} />;
      case 'notes':
        return <Notes supabase={supabase} session={session} />;
      default:
        return <Routine supabase={supabase} session={session} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-inter">
      {/* Top Navbar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Productivity Hub</h1>
        {!session ? (
          <button
            onClick={() => setShowAuth(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-gray-700 text-sm">
              Welcome, {session.user.user_metadata?.username || session.user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Show Auth Component if triggered and not signed in */}
      {!session && showAuth ? (
        <Auth supabase={supabase} />
      ) : session ? (
        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <nav className="flex justify-center mb-8">
            <div className="flex bg-white rounded-lg shadow-md p-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="max-w-6xl mx-auto">{renderContent()}</div>
        </div>
      ) : (
        !showAuth && (
          <div className="text-center py-32 text-gray-500 text-lg">
            Please click "Sign In" from the top to get started!
          </div>
        )
      )}
    </div>
  );
};

export default App;
