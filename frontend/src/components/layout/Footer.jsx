import { NavLink } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="fixed bottom-0 w-full bg-gray-100 border-t shadow-md flex justify-around items-center py-3 z-50">
            <NavLink
                to="/splitwise/dashboard"
                className={({ isActive }) =>
                    `px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                        isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-100'
                    }`
                }
            >
                Dashboard
            </NavLink>
            <NavLink
                to="/splitwise/activity"
                className={({ isActive }) =>
                    `px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                        isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-100'
                    }`
                }
            >
                Activity
            </NavLink>
            <NavLink
                to="/splitwise/userdetails"
                className={({ isActive }) =>
                    `px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                        isActive
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-100'
                    }`
                }
            >
                User Details
            </NavLink>
        </footer>
    );
};

export default Footer;
