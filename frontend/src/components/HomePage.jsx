import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to SplitIt</h1>
        <p className="text-gray-600 mb-8 text-lg">Easily track shared expenses, split bills, and settle up with friends.</p>
        <div className="flex justify-center gap-6">
          <Link to="/login">
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-2 px-6 rounded-lg shadow-lg transition duration-300">
              Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="bg-green-500 hover:bg-green-600 text-white text-lg font-medium py-2 px-6 rounded-lg shadow-lg transition duration-300">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
