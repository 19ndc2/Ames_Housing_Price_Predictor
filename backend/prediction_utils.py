
import joblib
import torch
import numpy as np
import pandas as pd

#Load exported model skicit model
models_data = joblib.load("all_models_export.pkl")

#Unpack
sklearn_models = models_data['sklearn_models']       
torch_models = models_data['torch_models']   
metrics = models_data['metrics']                 
preprocessing = models_data['preprocessing']

scaler = preprocessing['scaler']
pt = preprocessing['power_transformer']
ohe_map = preprocessing['ohe_map']
y_mean = preprocessing['y_train_t_log_mean'] 
y_std = preprocessing['y_train_t_log_std']

#Load torch models
mlp_model = torch.jit.load(torch_models['Perceptron_scripted'])
rbf_model = torch.jit.load(torch_models['rbf_scripted'])




#selected features
selected_features = ['OverallQual', 'GrLivArea', 'GarageCars', 'GarageArea',
                     'TotalBsmtSF', '1stFlrSF', 'YearBuilt', 'TotRmsAbvGrd',
                     'FullBath', 'YearRemodAdd', 'Neighborhood', 'CentralAir',
                     'LotArea', 'OverallCond', '2ndFlrSF', 'MSZoning', 
                     'KitchenQual', 'ExterQual', 'BsmtQual', 'FireplaceQu']

#selected catagorical features
selected_cat_features = ['Neighborhood', 'CentralAir', 'MSZoning', 'KitchenQual', 'ExterQual', 'BsmtQual', 'FireplaceQu']



#Example user input (single house)
example_user_input = {
    'OverallQual': 7,
    'GrLivArea': 2000,
    'GarageCars': 2,
    'GarageArea': 500,
    'TotalBsmtSF': 1000,
    '1stFlrSF': 1200,
    'YearBuilt': 2005,
    'TotRmsAbvGrd': 8,
    'FullBath': 2,
    'YearRemodAdd': 2015,
    'LotArea': 8000,
    'OverallCond': 5,
    '2ndFlrSF': 600,
    'Neighborhood': 'CollgCr',
    'CentralAir': 'Y',
    'MSZoning': 'RL',
    'KitchenQual': 'Gd',
    'ExterQual': 'TA',
    'BsmtQual': 'Gd',
    'FireplaceQu': 'None'
}

def getPredictions(user_input):
    #Convert to DataFrame
    input_df = pd.DataFrame([user_input])

    #make filtered ohe_map with selected features
    filtered_ohe_map = {k: v for k, v in ohe_map.items() if k in selected_cat_features}


    #Add all on hot encoded columns with 0
    for col_list in filtered_ohe_map.values():
        for dummy_col in col_list:
            input_df[dummy_col] = 0

    #Encode proper ohe columns to 1
    for orig_col, dummy_cols in filtered_ohe_map.items():
        if orig_col in input_df.columns:
            value = input_df.at[0, orig_col]
            dummy_name = f"{orig_col}_{value}"
            if dummy_name in dummy_cols:
                input_df.at[0, dummy_name] = 1


    #Reindex to match all scaler features
    all_scaler_features = scaler.feature_names_in_  # exact order the scaler was trained on
    input_df = input_df.reindex(columns=all_scaler_features, fill_value=0)

    #Keep only numeric columns for scaling (all features are numeric now)
    numeric_cols = input_df.columns

    # Scale numeric features
    input_df[numeric_cols] = scaler.transform(input_df[numeric_cols])

    # Drop extra columns not needed by your model
    input_df = input_df.reindex(columns=[c for c in selected_features if c in input_df.columns], fill_value=0)

    # Re-add OHE  catagorical columns post scale
    for orig_col, dummy_cols in filtered_ohe_map.items():
        # Add all dummy columns with 0 if they don't exist
        for dummy_col in dummy_cols:
            if dummy_col not in input_df.columns:
                input_df[dummy_col] = 0

        # Set the correct dummy to 1 based on user input
        if orig_col in user_input:
            dummy_name = f"{orig_col}_{user_input[orig_col]}"
            if dummy_name in input_df.columns:
                input_df.at[0, dummy_name] = 1
    



    #Feature Engineering
    input_df['TotalSF'] = input_df['TotalBsmtSF'] + input_df['1stFlrSF'] + input_df['2ndFlrSF']
    input_df['CurrHouseAge'] = input_df['YearRemodAdd'] - input_df['YearBuilt']
    input_df['GarageSizePerCar'] = input_df['GarageArea']/input_df['GarageCars']
    input_df['BathPerRoom'] = input_df['FullBath']/input_df['TotRmsAbvGrd']
    input_df['LotRatio'] = input_df['GrLivArea']/input_df['LotArea']
    input_df['GarageLotRatio'] = input_df['GarageArea']/input_df['LotArea']




    #Make predictions

    #Scikit-learn models
    predictions_sklearn = {}
    for name, model in sklearn_models.items():
        
        #reorder input to match model input
        input_df = input_df.reindex(columns=model.feature_names_in_, fill_value=0)
        pred = model.predict(input_df)

        # Only exponentiate if model was trained on log
        if name in ['linear', 'ridge', 'lasso', 'elastic_net']:
            pred = np.expm1(pred)
        predictions_sklearn[name] = pred.round(2)



    #Convert to torch tensor for PyTorch models
    input_tensor = torch.tensor(input_df.values.astype(np.float32))

    #PyTorch MLP
    mlp_model.eval()
    with torch.no_grad():
        mlp_pred_norm = mlp_model(input_tensor)
        mlp_pred_log = mlp_pred_norm * y_std + y_mean               
        mlp_pred = np.expm1(mlp_pred_log.numpy().flatten())

    #PyTorch RBF
    rbf_model.eval()
    with torch.no_grad():
        rbf_pred_norm = rbf_model(input_tensor)
        rbf_pred_log = rbf_pred_norm * y_std + y_mean               
        rbf_pred = np.expm1(rbf_pred_log.numpy().flatten())



    # Combine all predictions into a single dictionary
    predictions_all = predictions_sklearn.copy()  # start with sklearn predictions
    predictions_all['MLP'] = mlp_pred
    predictions_all['RBF'] = rbf_pred

    #get final dataframe
    metrics_df = pd.DataFrame({
        'rmse': metrics['rmse'],
        'r2': metrics['r2']
    })
    pred_df = pd.DataFrame.from_dict(predictions_all, orient='index', columns=['Prediction'])
    results_df = pred_df.join(metrics_df)
    results_df = results_df.astype(float)

    #print(results_df)
    return results_df

results_df_final = getPredictions(example_user_input)
