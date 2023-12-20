import React, { ReactElement, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation.tsx';
import Login from './login/Login.tsx';
import Register from './login/Register.tsx';

function App(): ReactElement {
  const [loggedIn, setLoggedIn] = useState(false);

  const logOut = () => {
    setLoggedIn(false);
  };

  const logIn = () => {
    setLoggedIn(true);
  };

  return (
    <Router>
      <div>
        <Navigation loggedIn={loggedIn} logIn={logIn} logOut={logOut} />
        <Routes>
          <Route path="/login" element={<Login loggedIn={loggedIn} logOut={logOut} logIn={logIn} />} />
          <Route path="/register" element={<Register loggedIn={loggedIn} logOut={logOut} logIn={logIn} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
