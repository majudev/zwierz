import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from '../types';
import 'bootstrap/js/src/modal';
import { toHaveFormValues } from '@testing-library/jest-dom/matchers';

function HelpPanelConfig(): JSX.Element {
  const [teams, setTeams] = useState<Array<{id: number, name: string, archived: boolean; members: number; editmode: boolean;}>>([]);

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamVisible, setNewTeamVisible] = useState(false);

  const [buttonlock, setButtonlock] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    refreshTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshTeams = async function(){
    const response = await fetch(process.env.REACT_APP_API_URL + "/team/all", {
      method: "GET",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot fetch teams list');
      return;
    }
    const body = await response.json() as {data: Array<{id: number, name: string, archived: boolean; members: number;}>};
    setTeams(body.data.map((e) => {return {...e, editmode: false}}));
  }

  const onTeamCreateAttempt = async function(name: string){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/team/new", {
      method: "POST",
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
      })
    });
    if(!response.ok){
      alert('Cannot create team');
      setButtonlock(false);
      return;
    }
    await refreshTeams();
    setNewTeamVisible(false);
    setButtonlock(false);
  }

  const onTeamArchiveAttempt = async function(teamId: number, archived: boolean){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/team/" + teamId, {
      method: "PATCH",
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        archived: archived,
      })
    });
    if(!response.ok){
      alert('Cannot update team');
      setButtonlock(false);
      return;
    }
    await refreshTeams();
    setButtonlock(false);
  }

  const onTeamRenameAttempt = async function(teamId: number, name: string){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/team/" + teamId, {
      method: "PATCH",
      mode: 'same-origin',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
      })
    });
    if(!response.ok){
      alert('Cannot update team');
      setButtonlock(false);
      return;
    }
    await refreshTeams();
    setButtonlock(false);
  }

  const onTeamDeleteAttempt = async function(teamId: number){
    setButtonlock(true);
    const response = await fetch(process.env.REACT_APP_API_URL + "/team/" + teamId, {
      method: "DELETE",
      mode: 'same-origin',
    });
    if(!response.ok){
      alert('Cannot delete team');
      setButtonlock(false);
      return;
    }
    await refreshTeams();
    setButtonlock(false);
  }

  return (<>
    <div className="col-lg-6 col-sm-12">
      <div className="p-3">
        <ul className="list-group">
          <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
            <h4 className="mb-1 mt-1">Panel pomocy</h4>
          </li>
          <li className="list-group-item">
            <p>Funkcjonalność oczekuje na implementację</p>
          </li>
        </ul>
      </div>
    </div>
  </>);
}

export default HelpPanelConfig;
