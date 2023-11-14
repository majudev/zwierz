import React, { ReactElement, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation.tsx';
import Sells from './sells/Sells.tsx';
import Invoices from './invoices/Invoices.tsx';
import Administration from './administration/Administration.tsx';
import Statistics from './statistics/Statistics.tsx';
import Login from './components/Login.tsx';

function App(): ReactElement {
  const [loggedIn, setLoggedIn] = useState('');
  //const navigate = useNavigate();

  const logOut = () => {
    setLoggedIn('');
  };

  const logIn = (token: string) => {
    setLoggedIn(token);
  };

  return (
    <Router>
      <div>
        <Navigation loggedIn={loggedIn} />
        <Routes>
          <Route path="/sprzedaz" element={<Sells token={loggedIn} />} />
          <Route path="/faktury" element={<Invoices token={loggedIn} />} />
          <Route path="/administracja" element={<Administration token={loggedIn} />} />
          <Route path="/statystyki" element={<Statistics token={loggedIn} />} />
          <Route path="/login" element={<Login loggedIn={loggedIn} logOut={logOut} logIn={logIn} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
