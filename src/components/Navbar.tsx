import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [filter, setFilter] = useState('');
  const [theme, setTheme] = useState<string>(
    localStorage.getItem('theme') || 'light'
  );

  // Define your menu categories
  const menuCategories = [
    {
      category: 'General',
      items: [
        { name: 'Home', path: '/' },
        { name: 'Teacher Chat', path: '/lunachat' },
      ],
    },
    {
      category: 'Learn',
      items: [
        { name: 'Basic Math', path: '/basicmath' },
        { name: 'Multiplication', path: '/multiplication' },
        { name: 'Speech', path: '/lunaspeech' },
        { name: 'Narrative', path: '/lunanarrative' },
      ],
    },
  ];

  // Determine current page name from the URL
  const allItems = menuCategories.flatMap(cat => cat.items);
  const currentItem = allItems.find(item => item.path === location.pathname);
  const pageName = currentItem?.name || 'LunaLearn';

  // Apply and persist theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Filter categories based on input
  const filteredCategories = menuCategories
    .map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase())
      ),
    }))
    .filter(cat => cat.items.length > 0);

  return (
    <div className="drawer">
      <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main Navbar */}
      <div className="drawer-content">
        <div className="navbar bg-base-100 shadow-md px-4">
          {/* Drawer toggle button */}
          <div className="flex-none">
            <label htmlFor="navbar-drawer" className="btn btn-ghost btn-circle">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>

          {/* Dynamic page title */}
          <div className="flex-1">
            <Link to="/" className="text-xl font-bold">
              {pageName}
            </Link>
          </div>

          {/* Theme toggle */}
          <div className="flex-none">
            <button
              className="btn btn-ghost btn-circle"
              onClick={() =>
                setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
              }
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414M16.95 16.95l1.414 1.414M7.05 7.05L5.636 5.636" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer Side Menu */}
      <div className="drawer-side">
        <label htmlFor="navbar-drawer" className="drawer-overlay" />
        <ul className="menu p-4 w-64 bg-base-100">
          {/* Filter input with clear button */}
          <li className="mb-2">
            <div className="input-group">
              <input
                type="text"
                placeholder="Filter menu..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="input input-bordered w-full text-base"
              />
              {filter && (
                <button
                  type="button"
                  className="btn btn-square"
                  onClick={() => setFilter('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </li>

          {/* Render filtered categories */}
          {filteredCategories.map(cat => (
            <React.Fragment key={cat.category}>
              <li className="menu-title mt-2 mb-1">
                <span>{cat.category}</span>
              </li>
              {cat.items.map(item => (
                <li key={item.path}>
                  <Link to={item.path}>{item.name}</Link>
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
