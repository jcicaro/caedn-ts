import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold text-black">
          Luna Icaro
        </Link>
      </div>


      <div className="flex-none hidden md:flex space-x-4">
        <Link to="/" className="btn btn-ghost">Home</Link>
        <Link to="/basicmath" className="btn btn-ghost">Basic Math</Link>
        <Link to="/multiplication" className="btn btn-ghost">Multiplication</Link>
        <Link to="/lunaspeech" className="btn btn-ghost">Speech</Link>
        <Link to="/lunanarrative" className="btn btn-ghost">Narrative</Link>
      </div>

      
      {/* <div className="flex-none">
        <ul className="menu menu-horizontal px-20">
          <li><Link to="/" className="btn btn-ghost">Home</Link></li>
          <li>
            <details>
              <summary className="btn btn-ghost">Learn</summary>
              <ul className="bg-base-100 rounded-t-none p-2">
                <li>
                  <Link to="/basicmath" className="btn btn-ghost">Basic Math</Link>
                </li>
                <li>
                  <Link to="/multiplication" className="btn btn-ghost">Multiplication</Link>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div> */}



      <div className="dropdown dropdown-end md:hidden">
        <label tabIndex={0} className="btn btn-ghost btn-circle">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
        <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-40"
        >
          <li><Link to="/">Home</Link></li>
          <li><Link to="/basicmath">Basic Math</Link></li>
          <li><Link to="/multiplication">Multiplication</Link></li>
          <li><Link to="/lunaspeech" className="btn btn-ghost">Speech</Link></li>
          <li><Link to="/lunanarrative" className="btn btn-ghost">Narrative</Link></li>
        </ul>
      </div>


    </div>
  );
}
