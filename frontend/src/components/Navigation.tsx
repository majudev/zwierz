import {useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NiceNavLink from './NiceNavLink';
import packageJson from '../../package.json';
import "bootstrap/js/src/collapse.js";

interface Props {
  loggedIn: string;
}

function Navigation({loggedIn}: Props) : JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    if(loggedIn === ''){
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          {packageJson.appConfig.appName}
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <ul className="navbar-nav me-auto mb-2 mb-md-0">
            {loggedIn !== '' ? 
            <>
            <li className="nav-item">
              <NiceNavLink to="/sprzedaz">
                Moja sprzedaż
              </NiceNavLink>
            </li>
            <li className="nav-item">
              <NiceNavLink to="/faktury">
                Lista faktur
              </NiceNavLink>
            </li>
            <li className="nav-item">
              <NiceNavLink to="/administracja">
                Administracja
              </NiceNavLink>
            </li>
            <li className="nav-item">
              <NiceNavLink to="/statystyki">
                Statystyki
              </NiceNavLink>
            </li>
            </>
            : 
            <>
            <li className="nav-item">
              <NiceNavLink to="/login">
                Zaloguj się
              </NiceNavLink>
            </li>
            </>}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
