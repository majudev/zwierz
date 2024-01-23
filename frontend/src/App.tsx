import React, { ReactElement, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from './types';
import Navigation from './components/Navigation.tsx';
import Login from './login/Login.tsx';
import Register from './login/Register.tsx';
import PasswordResetStep2 from './login/PasswordResetStep2.tsx';
import PasswordResetStep1 from './login/PasswordResetStep1.tsx';
import Profile from './profile/Profile.tsx';
import Trial from './trial/Trial.tsx';
import Appointments from './appointments/Appointments.tsx';
import AdminPanel from './adminpanel/AdminPanel.tsx';
import TrialsList from './commitee/TrialsList.tsx';
import CommiteeAppointments from './commitee/CommiteeAppointments.tsx';
import ShowTrial from './commitee/ShowTrial.tsx';
import TrialTutorial from './help-and-about/TrialTutorial.tsx';
import ReportTutorial from './help-and-about/ReportTutorial.tsx';
import PublicAppointments from './help-and-about/PublicAppointments.tsx';

function App(): ReactElement {
  const [loggedIn, setLoggedIn] = useState(false);
  const [trigger, pullTrigger] = useState(false);

  const [mode, setMode] = useState<SystemMode>(SystemMode.HO);

  const logOut = () => {
    setLoggedIn(false);
  };

  const logIn = () => {
    setLoggedIn(true);
  };

  const refreshMode = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/static/mode", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch instance mode');
      return;
    }
    const body = await response.json();
    setMode(body.data);
  }

  useEffect(() => {
    refreshMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Router>
      <div>
        <Navigation loggedIn={loggedIn} logIn={logIn} logOut={logOut} mode={mode} trigger={trigger}/>
        <Routes>
          <Route path="/login" element={<Login loggedIn={loggedIn} logOut={logOut} logIn={logIn} />} />
          <Route path="/register" element={<Register loggedIn={loggedIn} logOut={logOut} logIn={logIn} />} />
          <Route path="/passwordreset" element={<PasswordResetStep1 loggedIn={loggedIn} logOut={logOut} logIn={logIn} />} />
          <Route path="/passwordreset/:pwdresetkey" element={<PasswordResetStep2 loggedIn={loggedIn} logOut={logOut} logIn={logIn} />} />

          <Route path="/profile" element={<Profile loggedIn={loggedIn} logOut={logOut} logIn={logIn} trigger={trigger} pullTrigger={pullTrigger} />} />
          <Route path="/trial/ho" element={<Trial loggedIn={loggedIn} logOut={logOut} logIn={logIn} type={TrialType.HO} />} />
          <Route path="/trial/hr" element={<Trial loggedIn={loggedIn} logOut={logOut} logIn={logIn} type={TrialType.HR} />} />
          <Route path="/appointments" element={<Appointments loggedIn={loggedIn} logOut={logOut} logIn={logIn} mode={mode}/>} />

          <Route path="/commitee/trials/ho" element={<TrialsList loggedIn={loggedIn} logOut={logOut} logIn={logIn} mode={mode} type={TrialType.HO} />} />
          <Route path="/commitee/trials/hr" element={<TrialsList loggedIn={loggedIn} logOut={logOut} logIn={logIn} mode={mode} type={TrialType.HR} />} />
          <Route path="/commitee/appointments" element={<CommiteeAppointments loggedIn={loggedIn} logOut={logOut} logIn={logIn} mode={mode} />} />
          <Route path="/commitee/trial/:userId/:type" element={<ShowTrial loggedIn={loggedIn} logOut={logOut} logIn={logIn} mode={mode}/>} />
          <Route path="/admin" element={<AdminPanel loggedIn={loggedIn} logOut={logOut} logIn={logIn} mode={mode}/>} />

          <Route path="/public_appointments" element={<PublicAppointments loggedIn={loggedIn} logOut={logOut} logIn={logIn} mode={mode}/>} />
          <Route path="/trial-tutorial" element={<TrialTutorial />}/>
          <Route path="/report-tutorial" element={<ReportTutorial />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
