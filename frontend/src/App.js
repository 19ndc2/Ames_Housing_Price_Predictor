import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [overallQual, setOverallQual] = useState("7");
  const [overallCond, setOverallCond] = useState("5");
  const [neighborhood, setNeighborhood] = useState("CollgCr");
  const [centralAir, setCentralAir] = useState("Y");
  const [msZoning, setMSZoning] = useState("RL");
  const [kitchenQual, setKitchenQual] = useState("Gd");
  const [exterQual, setExterQual] = useState("TA");
  const [bsmtQual, setBsmtQual] = useState("TA");
  const [fireplaceQu, setFireplaceQu] = useState("TA");

  const [predictions, setPredictions] = useState([]);
  const tableRef = useRef(null);

  useEffect(() => {
    // Wake backend on initial load
    fetch("https://crusted-laura-unjudging.ngrok-free.dev/housing/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true" 
       },
      body: JSON.stringify({ dummy: true }) // dummy ping to wake backend
    })
      .then(() => console.log("Wake-up ping successful!"))
      .catch((err) => console.log("Wake-up call failed:", err));
  }, []);

  useEffect(() => {
    if (predictions.length > 0 && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [predictions]);

  const modelNames = [
    'Linear Regression', 'Ridge Regression', 'Lasso', 'Elastic Net', 
    'Random Forest', 'Decision Tree Regressor', 'Gradient Boosting Regressor',
    'Multi Layer Neural Network', 'Radial Basis Function Network (Currently Inaccurate for Demonstration)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const inputData = {
      OverallQual: overallQual,
      OverallCond: overallCond,
      Neighborhood: neighborhood,
      CentralAir: centralAir,
      MSZoning: msZoning,
      KitchenQual: kitchenQual,
      ExterQual: exterQual,
      BsmtQual: bsmtQual,
      FireplaceQu: fireplaceQu,
      GrLivArea: e.target.GrLivArea.value,
      GarageCars: e.target.GarageCars.value,
      GarageArea: e.target.GarageArea.value,
      TotalBsmtSF: e.target.TotalBsmtSF.value,
      "1stFlrSF": e.target["1stFlrSF"].value,
      YearBuilt: e.target.YearBuilt.value,
      TotRmsAbvGrd: e.target.TotRmsAbvGrd.value,
      FullBath: e.target.FullBath.value,
      YearRemodAdd: e.target.YearRemodAdd.value,
      LotArea: e.target.LotArea.value,
      "2ndFlrSF": e.target["2ndFlrSF"].value,
    };

    try {
      const response = await fetch(
        "https://crusted-laura-unjudging.ngrok-free.dev/housing/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true" 
           },
          body: JSON.stringify(inputData),
        }
      );

      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const result = await response.json();

      if (Array.isArray(result)) {
        const rowsWithModels = result.map((row, index) => ({
          model: modelNames[index] || `Model ${index + 1}`,
          Prediction: row.Prediction,
          rmse: row.rmse,
          r2: row.r2,
        }));
        setPredictions(rowsWithModels);
      } else {
        console.error("Expected an array but got:", result);
      }
    } catch (err) {
      console.error("Prediction fetch failed:", err);
    }
  };


  return (
    <div className="App">
      <h1>Housing Price Predictor</h1>
      <p>This is a demo house price predictor for Ames Iowa</p>
      <h2>Enter home features</h2>
      <form id="user_data" onSubmit={handleSubmit}>
        <label>
          Overall Material and Finish Quality:
          <select name="OverallQual" value={overallQual} onChange={(e) => setOverallQual(e.target.value)}>
            <option value="10">Very Excellent</option>
            <option value="9">Excellent</option>
            <option value="8">Very Good</option>
            <option value="7">Good</option>
            <option value="6">Above Average</option>
            <option value="5">Average</option>
            <option value="4">Below Average</option>
            <option value="3">Fair</option>
            <option value="2">Poor</option>
            <option value="1">Very Poor</option>
          </select>
          <br />
        </label>
        <label>
          Non Basement Living Area (sqft):
          <input type="number" name="GrLivArea" required placeholder="2000"/>
        </label><br/>
        <label>
          Number of Cars per Garage
          <input type="number" name="GarageCars" required placeholder="2"/>
        </label><br/>
        <label>
          Garage Square Feet (sqft)
          <input type="number" name="GarageArea" required placeholder="500"/>
        </label><br/>
        <label>
          Basement Square Feet (sqft)
          <input type="number" name="TotalBsmtSF" required placeholder="1000"/>
        </label><br/>
        <label>
          First Floor Square Feet (sqft)
          <input type="number" name="1stFlrSF" required placeholder="1200"/>
        </label><br/>
        <label>
          Year Built:
          <input type="number" name="YearBuilt" placeholder="2005" required/>
        </label><br/>
        <label>
          Total Rooms Above Ground:
          <input type="number" name="TotRmsAbvGrd" placeholder="8" required/>
        </label><br/>
        <label>
          Full Bathrooms above Ground:
          <input type="number" name="FullBath" placeholder="2" required/>
        </label><br/>
        <label>
          Year Remodeled:
          <input type="number" name="YearRemodAdd" placeholder="2015" required/>
        </label><br/>
        <label>
          Lot Area (sqft):
          <input type="number" name="LotArea" placeholder="8000" required/>
        </label><br/>
        <label>
          Overall Condition of House:
          <select name="OverallCond" value={overallCond} onChange={(e) => setOverallCond(e.target.value)}>
            <option value="10">Very Excellent</option>
            <option value="9">Excellent</option>
            <option value="8">Very Good</option>
            <option value="7">Good</option>
            <option value="6">Above Average</option>
            <option value="5">Average</option>
            <option value="4">Below Average</option>
            <option value="3">Fair</option>
            <option value="2">Poor</option>
            <option value="1">Very Poor</option>
          </select>
        </label>
        <br />
        <label>
          Second Floor sqft (sqft):
          <input type="number" name="2ndFlrSF" placeholder="600" required/>
        </label><br/>
        <label>
          Neighborhood: Physical locations within Ames city limits
          <select name="Neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}>
            <option value="Blmngtn">Bloomington Heights</option>
            <option value="Blueste">Bluestem</option>
            <option value="BrDale">Briardale</option>
            <option value="BrkSide">Brookside</option>
            <option value="ClearCr">Clear Creek</option>
            <option value="CollgCr">College Creek</option>
            <option value="Crawfor">Crawford</option>
            <option value="Edwards">Edwards</option>
            <option value="Gilbert">Gilbert</option>
            <option value="IDOTRR">Iowa DOT and Rail Road</option>
            <option value="MeadowV">Meadow Village</option>
            <option value="Mitchel">Mitchell</option>
            <option value="Names">North Ames</option>
            <option value="NoRidge">Northridge</option>
            <option value="NPkVill">Northpark Villa</option>
            <option value="NridgHt">Northridge Heights</option>
            <option value="NWAmes">Northwest Ames</option>
            <option value="OldTown">Old Town</option>
            <option value="SWISU">South & West of Iowa State University</option>
            <option value="Sawyer">Sawyer</option>
            <option value="SawyerW">Sawyer West</option>
            <option value="Somerst">Somerset</option>
            <option value="StoneBr">Stone Brook</option>
            <option value="Timber">Timberland</option>
            <option value="Veenker">Veenker</option>
          </select>
        </label>
        <br />
        <label>
          Central Air:
          <select name="CentralAir" value={centralAir} onChange={(e) => setCentralAir(e.target.value)}>
            <option value="Y">Yes</option>
            <option value="N">No</option>
          </select>
        </label>
        <br />
        <label>
          Zoning Classification of House Land
          <select name="MSZoning" value={msZoning} onChange={(e) => setMSZoning(e.target.value)}>
            <option value="A">Agriculture</option>
            <option value="C">Commercial</option>
            <option value="FV">Floating Village Residential</option>
            <option value="I">Industrial</option>
            <option value="RH">Residential High Density</option>
            <option value="RL">Residential Low Density</option>
            <option value="RP">Residential Low Density Park</option>
            <option value="RM">Residential Medium Density</option>
          </select>
        </label>
        <br />
        <label>
          Kitchen Quality:
          <select name="KitchenQual" value={kitchenQual} onChange={(e) => setKitchenQual(e.target.value)}>
            <option value="Ex">Excellent</option>
            <option value="Gd">Good</option>
            <option value="TA">Typical / Average</option>
            <option value="Fa">Fair</option>
            <option value="Po">Poor</option>
          </select>
        </label>
        <br />
        <label>
          Quality of Material on Exterior:
          <select name="ExterQual" value={exterQual} onChange={(e) => setExterQual(e.target.value)}>
            <option value="Ex">Excellent</option>
            <option value="Gd">Good</option>
            <option value="TA">Average / Typical</option>
            <option value="Fa">Fair</option>
            <option value="Po">Poor</option>
          </select>
        </label>
        <br />
        <label>
          Height of Basement
          <select name="BsmtQual" value={bsmtQual} onChange={(e) => setBsmtQual(e.target.value)}>
            <option value="Ex">Excellent (100+ inches)</option>
            <option value="Gd">Good (90-99 inches)</option>
            <option value="TA">Typical (80-89 inches)</option>
            <option value="Fa">Fair (70-79 inches)</option>
            <option value="Po">Poor (&lt;70 inches)</option>
            <option value="NA">No Basement</option>
          </select>
        </label>
        <br />
        <label>
          Fireplace Quality:
          <select name="FireplaceQu" value={fireplaceQu} onChange={(e) => setFireplaceQu(e.target.value)}>
            <option value="Ex">Excellent - Exceptional Masonry Fireplace</option>
            <option value="Gd">Good - Masonry Fireplace in main level</option>
            <option value="TA">Average - Prefabricated Fireplace in main living area or Masonry Fireplace in basement</option>
            <option value="Fa">Fair - Prefabricated Fireplace in basement</option>
            <option value="Po">Poor - Ben Franklin Stove</option>
            <option value="NA">No Fireplace</option>
          </select>
        </label>
        <br />
        <button type="submit">Predict</button>
      </form>

      <p>
      This demo runs uses a free tunnel.
      The first prediction may take up to a minute while the tunnel reconnects.
      </p>

      {predictions.length > 0 && (
        <div>
          <h2>Prediction Results</h2>
          <table id="predictionTable" ref={tableRef}>
            <thead>
              <tr>
                <th>Prediction Model</th>
                <th>Sale Price Prediction</th>
                <th>Model Average Error (RMSE)</th>
                <th>Model Accuracy (R²)</th>
              </tr>
            </thead>
            <tbody>
              {/*Rows will be inserted here dynamically*/}
              {predictions.map((row, index) => (
                <tr key={index}>
                  <td className="wrap-text">{row.model}</td>
                  <td>
                    ${Number(row.Prediction).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    ${Number(row.rmse).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    {(row.r2 * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
