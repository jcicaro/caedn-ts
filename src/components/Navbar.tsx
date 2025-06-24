import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [filter, setFilter] = useState('');
  const [theme, setTheme] = useState<string>(
    localStorage.getItem('theme') || 'light'
  );

  const menuCategories = [
    {
      category: 'General',
      items: [{ name: 'Home', path: '/' }],
    },
    {
      category: 'Luna',
      items: [
        { name: 'Basic Math', path: '/basicmath' },
        { name: 'Multiplication', path: '/multiplication' },
        { name: 'Speech', path: '/lunaspeech' },
        { name: 'Narrative', path: '/lunanarrative' },
        { name: 'Teacher Chat', path: '/lunachat' },
      ],
    },
  ];

  const allItems = menuCategories.flatMap((cat) => cat.items);
  const currentItem = allItems.find((item) => item.path === location.pathname);
  const pageName = currentItem?.name || 'LunaLearn';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [openStates, setOpenStates] = useState<boolean[]>(
    menuCategories.map(() => true)
  );
  const [allOpen, setAllOpen] = useState(true);

  useEffect(() => {
    if (filter) {
      setOpenStates(menuCategories.map(() => true));
      setAllOpen(true);
    }
  }, [filter, menuCategories]);

  const toggleAll = () => {
    const newOpen = !allOpen;
    setAllOpen(newOpen);
    setOpenStates(menuCategories.map(() => newOpen));
  };

  const filteredCategories = menuCategories
    .map((cat) => {
      if (cat.category.toLowerCase().includes(filter.toLowerCase())) {
        return cat;
      }
      return {
        ...cat,
        items: cat.items.filter((item) =>
          item.name.toLowerCase().includes(filter.toLowerCase())
        ),
      };
    })
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="drawer">
      <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <div className="navbar bg-base-100 shadow-md px-4">
          <div className="flex-none">
            <label htmlFor="navbar-drawer" className="btn btn-ghost btn-circle">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <Link to="/" className="text-xl font-bold">
              {pageName}
            </Link>
          </div>
          <div className="flex-none">
            <button
              className="btn btn-ghost btn-circle"
              onClick={() =>
                setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
              }
            >
              {theme === 'light' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1M18.364 5.636l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14a7 7 0 000-14z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="drawer-side">
        <label htmlFor="navbar-drawer" className="drawer-overlay" />
        <div className="p-4 w-64 bg-base-100 h-full overflow-y-auto">

          {/* Open/Close All using collapse-arrow icons */}
          <div className="flex justify-end mb-4">
            <button
              className="btn btn-sm"
              onClick={toggleAll}
              aria-label={allOpen ? 'Close all categories' : 'Open all categories'}
            >
              {allOpen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* down chevron */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* right chevron */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Filter input */}
          <div className="hidden md:flex input-group mb-4">
            <input
              type="text"
              placeholder="Filter menu..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input input-bordered flex-1"
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="btn btn-square btn-md btn-outline"
                aria-label="Clear filter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {filteredCategories.map((cat, idx) => (
            <div
              key={cat.category}
              className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-2"
            >
              <input
                type="checkbox"
                checked={openStates[idx]}
                onChange={() => {
                  const newStates = [...openStates];
                  newStates[idx] = !newStates[idx];
                  setOpenStates(newStates);
                }}
                className="peer"
              />
              <div className="collapse-title text-lg font-medium">
                {cat.category}
              </div>
              <div className="collapse-content">
                {cat.items.map((item) => (
                  <Link
                    to={item.path}
                    key={item.path}
                    className="block py-1 hover:underline"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
