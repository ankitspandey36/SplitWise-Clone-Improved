import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import HomePage from './components/HomePage';
import DashBoard from './components/pages/DashBoard';
import Activity from './components/pages/Activity';
import Layout from './components/layout/Layout';
import UserDetails from './components/layout/UserDetails';
import SignUpVerification from './components/layout/SignUpVerification';
import ForgotPassword from './components/auth/ForgotPassword';
import ForgotPasswordCodeVerification from './components/auth/ForgotPasswordCodeVerification';
import ChangeForgotPassword from './components/auth/ChangeForgotPassword';
import { useEffect } from 'react';
import { axiosInstance } from './features/axios.js';
import IndividualGroup from './components/pages/IndividualGroup.jsx';
import ExpenseDetail from './components/pages/ExpenseDetail.jsx';
function App() {

  useEffect(() => {
    (async () => {
      try {
        await axiosInstance.post("/user/refresh");
      } catch (error) {
        console.log("Cant refresh");
      }
    })()
  }, [])
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/codeverification" element={<SignUpVerification />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/forgotpassword-emailverify" element={<ForgotPasswordCodeVerification />} />
        <Route path="/change-password" element={<ChangeForgotPassword />} />






        <Route path="/splitwise" element={<Layout />}>
          <Route path="dashboard" element={<DashBoard />} />
          <Route path="activity" element={<Activity />} />
          <Route path="userdetails" element={<UserDetails />} />
          <Route path='group/:groupId' element={<IndividualGroup />}></Route>
          <Route path='group/:groupId/expenses/:expenseId' element={<ExpenseDetail />}></Route>

        </Route>

      </Routes>


    </Router>
  );
}

export default App;