import React, { useState } from 'react';
import './index.css'
import Home from './Home';

const App = () => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={`${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-gray-100'} min-h-screen transition-all`}>
      <header className="flex justify-between items-center p-4 shadow-md">
        <h1 className="text-2xl font-bold">ToDo App</h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        </button>
      </header>
      <Home theme={theme} />
    </div>
  );
};

export default App;
