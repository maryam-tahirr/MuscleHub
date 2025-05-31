import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="text-center px-6 py-12 max-w-md rounded-2xl shadow-md bg-white">
        <div className="flex justify-center mb-6 text-yellow-500">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-800 mb-2">404</h1>
        <p className="text-lg text-gray-600 mb-6">The page you’re looking for doesn’t exist.</p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
