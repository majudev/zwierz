import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import NiceNavLink from './NiceNavLink';
import "bootstrap/js/src/collapse.js";
import "bootstrap/js/src/dropdown.js";

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
}

enum CommiteeRole {
  NONE,
  MEMBER,
  SCRIBE,
  UBERADMIN,
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function Navigation({loggedIn, logIn, logOut}: Props) : JSX.Element {
  const [role, setRole] = useState<CommiteeRole>(CommiteeRole.NONE);

  const navigate = useNavigate();
  const location = useLocation();

  const query = useQuery();

  useEffect(() => {
    if(!loggedIn && location.pathname !== '/login' && location.pathname !== '/passwordreset' && !location.pathname.match(/^\/passwordreset\/[a-zA-Z0-9]+/)){
      navigate('/login');
    }else if(location.pathname === '/login' && query.get("status") === 'success'){
      logIn();
      navigate('/profile');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  const checkLogintokenStatus = async function() {
    return true;
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">Zwierz</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <ul className="navbar-nav me-auto mb-2 mb-md-0">
            {(loggedIn && role === CommiteeRole.NONE) && <>
              <NiceNavLink to="/profile">Mój profil</NiceNavLink>
              <NiceNavLink to="/trial/ho">Moja próba na HO</NiceNavLink>
              <NiceNavLink to="/trial/hr">Moja próba na HR</NiceNavLink>
              <NiceNavLink to="/appointments">Moje spotkania z kapitułą</NiceNavLink>
            </>}
            {(loggedIn && (role === CommiteeRole.MEMBER || role === CommiteeRole.SCRIBE || role === CommiteeRole.UBERADMIN)) && <>
              <NiceNavLink to="/commitee/trials">Próby</NiceNavLink>
              <NiceNavLink to="/commitee/appointments">Spotkania</NiceNavLink>
            </>}
            {(loggedIn && role === CommiteeRole.UBERADMIN) && <NiceNavLink to="/admin">Panel administratora</NiceNavLink>}
            {!loggedIn && <NiceNavLink to="/public_appointments">Lista spotkań</NiceNavLink>}
          </ul>
          <ul className="navbar-nav mb-2 mb-md-0">
            {!loggedIn && <NiceNavLink to="/login">Zaloguj się</NiceNavLink>}
            {loggedIn && <NiceNavLink to="/logout">Wyloguj się</NiceNavLink>}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
