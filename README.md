# Ames Iowa ML House Price Predictor
This web app uses a variety of machine learning models to predict house prices in Ames Iowa. The calculator uses 20 user entered features.

## 🌐 Live Demo
https://19ndc2.github.io/Ames_Housing_Price_Predictor/

## Table of Contents
- [Installation](#installation)
- [Machine Learning Models](#ml-models)
- [Backend](#backend)
- [Frontend](#frontend)


## 🛠️ Installation 
- clone repo:
https://github.com/19ndc2/Ames_Housing_Price_Predictor.git
- install python dependancies:
pip install -r requirements.txt
- start backend server:
python backend.py
- navigate to frontend folder
cd frontend
- install frontend dependencies
npm install
- launch frontend
npm start

## 🤖 Machine Learning Models
This project uses a combination of **scikit-learn regressors** and **PyTorch neural networks** to predict house prices. The models were trained on the [House Prices: Advanced Regression Techniques dataset](https://www.kaggle.com/c/house-prices-advanced-regression-techniques).

---

### Preprocessing Steps
- Filled missing values (categorical with 'None' or mode, numeric with 0 or median)  
- One-hot encoded categorical features  
- Scaled numeric features using `StandardScaler`  
- Corrected skewed numeric features using `PowerTransformer`  
- Feature engineering, e.g., `TotalSF`, `GarageSizePerCar`, `BathPerRoom`  

---

### Models Implemented & Hyperparameters

#### Linear Models (scikit-learn)
- **Linear Regression** – default parameters  
- **Ridge Regression** – tuned `alpha` (best: 1)  
- **Lasso Regression** – tuned `alpha` (best: 0.0001, max_iter=10000)  
- **ElasticNet** – tuned `alpha` (best: 0.0001) and `l1_ratio` (best: 0.7, i.e., 70% Lasso)  

#### Tree-based Models (scikit-learn)
- **Decision Tree Regressor** – tuned `max_depth` (7) and `min_samples_split` (2)  
- **Random Forest Regressor** – tuned `n_estimators` (100), `max_features` ('sqrt'), `min_samples_split` (2)  
- **Gradient Boosting Regressor** – tuned `n_estimators` (300), `learning_rate` (0.1), `max_depth` (3), `min_samples_split` (2), `min_samples_leaf` (1)  

#### Ensemble Models *(not used on the website)*
- **Stacking Regressor** – meta-model: Linear Regression trained on predictions of base models  
- **Voting Regressor** – both average and weighted voting (weights based on validation RMSE)  

#### Neural Networks (PyTorch)
- **Multilayer Perceptron (MLP)** – 2 hidden layers, LeakyReLU activation, learning rate 0.001, 500 epochs  
- **Radial Basis Function (RBF) Network** – 100 hidden neurons, spread initialized via KMeans, learning rate 0.01, 500 epochs  
  - **Note:** RBF was used for demonstration only and was **not accurate**.  

---

### Evaluation Metrics
- RMSE (Root Mean Squared Error)  
- R² (Coefficient of Determination)  

---

### Exported Models
- TorchScript models for MLP and RBF (`mlp_model_scripted.pt`, `rbf_model_scripted.pt`)  
- `joblib` export containing:
  - All trained scikit-learn and PyTorch models  
  - Preprocessing objects (scaler, power transformer, one-hot encoding map)  
  - Model evaluation metrics


## ⚙️ Backend Overview

### Purpose
The backend serves the trained machine learning models to make house price predictions. It handles preprocessing of input data from the frontend (scaling, encoding categorical variables, and feature engineering) and returns predictions in JSON format.

### Framework
- Built with **Flask**, a lightweight Python web framework.
- Provides API endpoints for predictions and health checks.

### Structure
- `app.py` – main backend file defining routes for predictions.
- `models/` – stores trained models (e.g., `all_models_export.pkl`).
- `utils.py` *(optional)* – contains preprocessing functions and helper code.

### API Endpoints
- `POST /predict`  
  - Accepts input JSON containing house features.  
  - Preprocesses input data to match training format.  
  - Returns predicted house price.
- `GET /health` *(optional)* – simple health check endpoint.

### Data Handling
- Performs the same preprocessing as in training:
  - One-hot encoding for categorical features.
  - Scaling of numeric features.
  - Feature engineering (e.g., `TotalSF`, `GarageSizePerCar`, `BathPerRoom`).  
- Ensures input data is compatible with deployed models.

### Dependencies
- `Flask`  
- `joblib` (for loading scikit-learn models)  
- `torch` (for PyTorch models)  
- `pandas`, `numpy`  

### Notes
- Ensemble models were trained but are **not used on the deployed website**.  
- Only a single model (e.g., Random Forest or MLP) is used for online predictions to simplify deployment.  
- Handles error cases gracefully (e.g., missing input fields, invalid values).

## 👨‍💻 Frontend Overview

The frontend is a **React** app that allows users to input house features and view price predictions.

### Structure
- `frontend/src/App.js` – main component with form and table.
- `frontend/src/App.css` – app styling.
- `frontend/public/` – static assets.
- `frontend/package.json` – dependencies and scripts.

### Features
- **Form Input** – fields for house features, validated for correctness.
- **Prediction Table** – displays model outputs; responsive layout with wrapped text.
- **Styling** – vertical form layout, hoverable submit button, gray background outside form.

### Data Flow
1. User submits form.  
2. Data sent to backend API.  
3. Prediction returned and displayed in table.  

### Dependencies
- React  
- Axios (or fetch) for API calls  
- CSS for styling



