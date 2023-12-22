import React, { ReactElement, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { TrialType, CommiteeRole, Rank, SSOManager } from './types';
import Navigation from './components/Navigation.tsx';
import Login from './login/Login.tsx';
import Register from './login/Register.tsx';
import PasswordResetStep2 from './login/PasswordResetStep2.tsx';
import PasswordResetStep1 from './login/PasswordResetStep1.tsx';
import Profile from './profile/Profile.tsx';
import Trial from './trial/Trial.tsx';

function App(): ReactElement {
  const [loggedIn, setLoggedIn] = useState(false);
  const [trigger, pullTrigger] = useState(false);

  const logOut = () => {
    setLoggedIn(false);
  };

  const logIn = () => {
    setLoggedIn(true);
  };

  return (
    <Router>
      <div>
        <Navigation loggedIn={loggedIn} logIn={logIn} logOut={logOut} trigger={trigger}/>
        <Routes>
          <Route path="/login" element={<Login loggedIn={loggedIn} logOut={logOut} logIn={logIn} />} />
          <Route path="/register" element={<Register loggedIn={loggedIn} logOut={logOut} logIn={logIn} />} />
          <Route path="/passwordreset" element={<PasswordResetStep1 loggedIn={loggedIn} logOut={logOut} logIn={logIn} />} />
          <Route path="/passwordreset/:pwdresetkey" element={<PasswordResetStep2 loggedIn={loggedIn} logOut={logOut} logIn={logIn} />} />

          <Route path="/profile" element={<Profile loggedIn={loggedIn} logOut={logOut} logIn={logIn} trigger={trigger} pullTrigger={pullTrigger} />} />
          <Route path="/trial/ho" element={<Trial loggedIn={loggedIn} logOut={logOut} logIn={logIn} type={TrialType.HO} />} />
          <Route path="/trial/hr" element={<Trial loggedIn={loggedIn} logOut={logOut} logIn={logIn} type={TrialType.HR} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
