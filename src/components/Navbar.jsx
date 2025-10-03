import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600">RentHouse</Link>
      <ul className="flex gap-6">
        <li><Link to="/" className="hover:text-blue-500">Home</Link></li>
        <li><Link to="/listings" className="hover:text-blue-500">Find House</Link></li>
        <li><Link to="/login" className="hover:text-blue-500">Login</Link></li>
        <li><Link to="/signup" className="hover:text-blue-500">Signup</Link></li>
      </ul>
    </nav>
  );
}