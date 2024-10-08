import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import NiceNavLink from './NiceNavLink';
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from '../types';
import "bootstrap/js/src/collapse.js";
import "bootstrap/js/src/dropdown.js";

interface Props {
  loggedIn: boolean;
  logOut: () => void;
  logIn: () => void;
  mode: SystemMode;
  trigger: boolean;
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

function Navigation({loggedIn, logIn, logOut, mode, trigger}: Props) : JSX.Element {
  const [roleHO, setRoleHO] = useState<CommiteeRole>(CommiteeRole.NONE);
  const [roleHR, setRoleHR] = useState<CommiteeRole>(CommiteeRole.NONE);
  const [uberadmin, setUberadmin] = useState<boolean>(false);

  const [mentees, setMentees] = useState<Array<{type: TrialType, user: {id: number; name: string; rank: Rank}}>>([]);

  const [showTrialTutorial, setShowTrialTutorial] = useState(false);
  const [showReportTutorial, setShowReportTutorial] = useState(false);

  const [initMode, setInitMode] = useState(true);

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

    if(loggedIn){
      updateRole();
      updateMentees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  useEffect(() => {
    if(loggedIn){
      updateRole();
      updateMentees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  useEffect(() => {
    refreshTutorials(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshTutorials = async function(flushCache: boolean = false) {
    const response = await fetch(process.env.REACT_APP_API_URL + "/static/show-tutorials", {
      method: "GET",
      cache: flushCache ? "reload" : undefined,
      mode: 'same-origin'
    });
    if(!response.ok){
      alert('Cannot fetch tutorials details');
      return;
    }
    const body = await response.json();
    setShowTrialTutorial(body.data.showTrialTutorial);
    setShowReportTutorial(body.data.showReportTutorial);
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

    setInitMode(body.data.name === null || body.data.phone === null || /*body.data.interests.length === 0 ||*/ body.data.function === null || body.data.team.name === null);
  };

  const updateMentees = async function() {
    const response = await fetch(process.env.REACT_APP_API_URL + "/user/me/mentees", {
      method: "GET",
      mode: 'same-origin'
    });
    if(!response.ok){
      alert('Cannot fetch user mentees');
      return;
    }
    const body = await response.json();
    setMentees(body.data);
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
            {(!initMode && loggedIn && (mode === SystemMode.HO || mode === SystemMode.HO_HR) && roleHO === CommiteeRole.NONE) && <NiceNavLink to="/trial/ho">Moja próba{mode === SystemMode.HO_HR ? ' na HO' : ''}</NiceNavLink>}
            {(!initMode && loggedIn && (mode === SystemMode.HR || mode === SystemMode.HO_HR) && roleHR === CommiteeRole.NONE) && <NiceNavLink to="/trial/hr">Moja próba{mode === SystemMode.HO_HR ? ' na HR' : ''}</NiceNavLink>}
            {(!initMode && loggedIn && (roleHO === CommiteeRole.NONE || roleHR === CommiteeRole.NONE)) && <NiceNavLink to="/appointments">Moje spotkania z kapitułą</NiceNavLink>}
            {(!initMode && loggedIn && (mode === SystemMode.HO || mode === SystemMode.HO_HR) && (roleHO === CommiteeRole.MEMBER || roleHO === CommiteeRole.SCRIBE)) && <NiceNavLink to="/commitee/trials/ho">Próby{mode === SystemMode.HO_HR ? ' na HO' : ''}</NiceNavLink>}
            {(!initMode && loggedIn && (mode === SystemMode.HR || mode === SystemMode.HO_HR) && (roleHR === CommiteeRole.MEMBER || roleHR === CommiteeRole.SCRIBE)) && <NiceNavLink to="/commitee/trials/hr">Próby{mode === SystemMode.HO_HR ? ' na HR' : ''}</NiceNavLink>}
            {(!initMode && loggedIn && (roleHO === CommiteeRole.MEMBER || roleHO === CommiteeRole.SCRIBE || roleHR === CommiteeRole.MEMBER || roleHR === CommiteeRole.SCRIBE)) && <NiceNavLink to="/commitee/appointments">Spotkania</NiceNavLink>}
            
            {(loggedIn && uberadmin) && <NiceNavLink to="/admin">Panel administratora</NiceNavLink>}
            {!loggedIn && <NiceNavLink to="/public_appointments">Lista spotkań</NiceNavLink>}

            {!initMode && loggedIn && (mentees.length > 0) && <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">Podopieczni</a>
              <ul className="dropdown-menu">
                {
                  mentees.map((mentee) => {
                    return <li><Link className="dropdown-item" to={"/mentor/trial/" + mentee.user.id + "/" + mentee.type.toLowerCase()}>{mentee.user.name} ({mentee.type.toUpperCase()})</Link></li>;
                  })
                }
              </ul>
            </li>}

            {showTrialTutorial && <NiceNavLink to="/trial-tutorial">Jak ułożyć próbę?</NiceNavLink>}
            {showReportTutorial && <NiceNavLink to="/report-tutorial">Jak zrobić raport?</NiceNavLink>}
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
