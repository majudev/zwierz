import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import NiceNavLink from './NiceNavLink';
import { TrialType, CommiteeRole, Rank, SSOManager } from '../types';
import "bootstrap/js/src/collapse.js";
import "bootstrap/js/src/dropdown.js";

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
  trigger: boolean;
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function Navigation({loggedIn, logIn, logOut, trigger}: Props) : JSX.Element {
  const [roleHO, setRoleHO] = useState<CommiteeRole>(CommiteeRole.NONE);
  const [roleHR, setRoleHR] = useState<CommiteeRole>(CommiteeRole.NONE);
  const [uberadmin, setUberadmin] = useState<boolean>(false);

  const [initMode, setInitMode] = useState(true);

  const [mode, setMode] = useState<'HO' | 'HO+HR' | 'HR'>('HO');

  const navigate = useNavigate();
  const location = useLocation();

  const query = useQuery();

  useEffect(() => {
    if(!loggedIn && location.pathname !== '/login' && location.pathname !== '/passwordreset' && !location.pathname.match(/^\/passwordreset\/[a-zA-Z0-9]+/)){
      navigate('/login');
    }else if(location.pathname === '/login' && query.get("status") === 'success'){
      logIn();
      navigate('/profile');
    }else if(loggedIn && location.pathname === '/login'){
      navigate('/profile');
    }
    if(loggedIn) updateRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  useEffect(() => {
    if(loggedIn) updateRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  /*useEffect(() => {
    if(!loggedIn && location.pathname !== '/login' && location.pathname !== '/passwordreset' && !location.pathname.match(/^\/passwordreset\/[a-zA-Z0-9]+/)){
      navigate('/login');
    }else if(location.pathname === '/login' && query.get("status") === 'success'){
      logIn();
      navigate('/profile');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);*/

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

  const updateRole = async function() {
    const response = await fetch(process.env.REACT_APP_API_URL + "/user/me", {
      method: "GET",
      mode: 'same-origin'
    });
    if(!response.ok){
      alert('Cannot fetch user details');
      return;
    }
    const body = await response.json();
    setRoleHO(body.data.role_HO as CommiteeRole);
    setRoleHR(body.data.role_HR as CommiteeRole);
    setUberadmin(body.data.uberadmin);

    setInitMode(body.data.name === null || body.data.phone === null || body.data.interests.length === 0 || body.data.function === null || body.data.team.name === null);
  };

  const loginStatusLoop = function() {
    const loginStatus = checkLogintokenStatus();
    if(loginStatus !== loggedIn){
      if(loginStatus){
        logIn();
      }else{
        logOut();
      }
    }
    setTimeout(loginStatusLoop, 500);
  };

  useEffect(() => {
    refreshMode();
    loginStatusLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkLogintokenStatus = function() : boolean {
    const expirationTime = Cookies.get("ZWIERZ_COOKIE_EXP");
    if(expirationTime === undefined) return false;
    const expirationTimestamp = Number.parseInt(expirationTime);
    const currentTimestamp = Math.floor((new Date()).getTime() / 1000);
    return expirationTimestamp - currentTimestamp > 5;
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
            {loggedIn && <NiceNavLink to="/profile">Mój profil</NiceNavLink>}
            {(!initMode && loggedIn && (mode === 'HO' || mode === 'HO+HR') && roleHO == CommiteeRole.NONE) && <NiceNavLink to="/trial/ho">Moja próba na HO</NiceNavLink>}
            {(!initMode && loggedIn && (mode === 'HR' || mode === 'HO+HR') && roleHR == CommiteeRole.NONE) && <NiceNavLink to="/trial/hr">Moja próba na HR</NiceNavLink>}
            {(!initMode && loggedIn && (roleHO == CommiteeRole.NONE || roleHR == CommiteeRole.NONE)) && <NiceNavLink to="/appointments">Moje spotkania z kapitułą</NiceNavLink>}
            {(!initMode && loggedIn && (mode === 'HO' || mode === 'HO+HR') && (roleHO == CommiteeRole.MEMBER || roleHO == CommiteeRole.SCRIBE)) && <NiceNavLink to="/commitee/trials/ho">Próby na HO</NiceNavLink>}
            {(!initMode && loggedIn && (mode === 'HR' || mode === 'HO+HR') && (roleHR == CommiteeRole.MEMBER || roleHR == CommiteeRole.SCRIBE)) && <NiceNavLink to="/commitee/trials/hr">Próby na HR</NiceNavLink>}
            {(!initMode && loggedIn && (roleHO == CommiteeRole.MEMBER || roleHO == CommiteeRole.SCRIBE || roleHR == CommiteeRole.MEMBER || roleHR == CommiteeRole.SCRIBE)) && <NiceNavLink to="/commitee/appointments">Spotkania</NiceNavLink>}
            
            {(loggedIn && uberadmin) && <NiceNavLink to="/admin">Panel administratora</NiceNavLink>}
            {!loggedIn && <NiceNavLink to="/public_appointments">Lista spotkań</NiceNavLink>}
          </ul>
          <ul className="navbar-nav mb-2 mb-md-0">
            {!loggedIn && <NiceNavLink to="/login">Zaloguj się</NiceNavLink>}
            {loggedIn && <a className="nav-link" href={process.env.REACT_APP_API_URL + "/auth/logout"}>Wyloguj się</a>}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
