import React, {useState, useEffect} from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { TrialType, CommiteeRole, Rank, SSOManager, SystemMode } from '../types';
import 'bootstrap/js/src/modal';
import { toHaveFormValues } from '@testing-library/jest-dom/matchers';

function TeamsConfig(): JSX.Element {
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
            <h4 className="mb-1 mt-1">Lista drużyn</h4>
          </li>
          <li className="list-group-item">
            <table className="table">
              <tbody>
                {
                  teams.map((team, index) => {
                    return <tr className="align-middle">
                      <td className="longrecord">
                        {team.editmode ?
                          <input className="form-control" value={team.name} onChange={(e) => {var newArray = [...teams]; newArray[index].name = e.target.value; setTeams(newArray);}} disabled={buttonlock}/>
                        :
                          <p className="text-vert-center">{team.name}{team.archived ? ' (archiwalna)' : false}</p>
                        }
                      </td>
                      <td className="nowrap">
                        <p className="me-3 ms-3">{
                          (team.members === 1) ?
                          (team.members + ' osoba') : (team.members === 2 || team.members === 3 || team.members === 4 ? 
                          (team.members + ' osoby') : ((team.members > 20 && (team.members % 10 === 2 || team.members % 10 === 3 || team.members % 10 === 4)) ? 
                          (team.members + ' osoby') : (team.members + ' osób')))
                        }</p>
                      </td>
                      <td className="nowrap">
                        {!team.editmode ?
                          <button className="btn btn-dark nowrap" onClick={(e) => {var newArray = [...teams]; newArray[index].editmode = true; setTeams(newArray);}} disabled={buttonlock || team.archived}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/></svg></button>
                        :
                          <button className="btn btn-success nowrap" onClick={(e) => onTeamRenameAttempt(team.id, team.name)} disabled={buttonlock || team.archived}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16"><path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"></path></svg></button>
                        }
                        <button className="btn btn-danger nowrap" onClick={(e) => onTeamArchiveAttempt(team.id, !team.archived)} disabled={buttonlock}>{!team.archived ? 'Archiwizuj' : 'Dearchiwizuj'}</button>
                        <button className="btn btn-danger nowrap" onClick={(e) => onTeamDeleteAttempt(team.id)} disabled={buttonlock || team.members > 0}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"></path><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg></button>
                      </td>
                    </tr>
                  })
                }
              </tbody>
            </table>
          </li>
          {newTeamVisible && <li className="list-group-item">
            <table>
              <tbody>
                <tr className="align-middle">
                  <td className="longrecord">
                      <input className="form-control" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} disabled={buttonlock}/>
                  </td>
                  <td className="nowrap">
                    <p className="me-3 ms-3">0 osób</p>
                  </td>
                  <td className="nowrap">
                    <button className="btn btn-success nowrap" onClick={(e) => onTeamCreateAttempt(newTeamName)} disabled={buttonlock}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-lg" viewBox="0 0 16 16"><path d="M13.485 1.431a1.473 1.473 0 0 1 2.104 2.062l-7.84 9.801a1.473 1.473 0 0 1-2.12.04L.431 8.138a1.473 1.473 0 0 1 2.084-2.083l4.111 4.112 6.82-8.69a.486.486 0 0 1 .04-.045z"></path></svg></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </li>}
          {!newTeamVisible && <li className="list-group-item d-flex justify-content-end flex-row">
            <button type="button" className="btn btn-dark" onClick={(e) => {setNewTeamName(''); setNewTeamVisible(true)}} disabled={buttonlock}>Dodaj nową</button>
          </li>}
        </ul>
      </div>
    </div>
  </>);
}

export default TeamsConfig;
