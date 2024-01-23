function TrialTutorial(): JSX.Element {
  return (<>
    <main className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-12 col-sm-12">
          <div className="p-3 pt-5 pb-5">
            <ul className="list-group">
              <li className="list-group-item list-group-item-info d-flex justify-content-center bg-dark text-center text-white">
                <h4 className="mb-1 mt-1">Jak ułożyć próbę?</h4>
              </li>
              <li className="list-group-item text-center">
                <img src={process.env.REACT_APP_API_URL + "/static/trial-tutorial-image"} style={{maxWidth: "100%"}} />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </>);
}

export default TrialTutorial;
