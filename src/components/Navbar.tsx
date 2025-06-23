import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold text-black">
          LunaLearn
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-2">
        <Link to="/" className="btn btn-ghost">Home</Link>

        <div className="dropdown dropdown-hover">
          <label tabIndex={0} className="btn btn-ghost">
            Learn
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-2 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li><Link to="/basicmath">Basic Math</Link></li>
            <li><Link to="/multiplication">Multiplication</Link></li>
            <li><Link to="/lunaspeech">Speech</Link></li>
            <li><Link to="/lunanarrative">Narrative</Link></li>
          </ul>
        </div>

        <Link to="/lunachat" className="btn btn-ghost">Chat</Link>
      </div>

      {/* Mobile Hamburger */}
      <div className="dropdown dropdown-end md:hidden">
        <label tabIndex={0} className="btn btn-ghost btn-circle">
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
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-44"
        >
          <li><Link to="/">Home</Link></li>
          <li><Link to="/basicmath">Basic Math</Link></li>
          <li><Link to="/multiplication">Multiplication</Link></li>
          <li><Link to="/lunaspeech">Speech</Link></li>
          <li><Link to="/lunanarrative">Narrative</Link></li>
          <li><Link to="/lunachat">Chat</Link></li>
        </ul>
      </div>
    </div>
  );
}
