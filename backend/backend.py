from flask import Flask, request, jsonify, render_template
from flask_cors import CORS  # <-- import this
import pandas as pd
import prediction_utils



app = Flask(__name__)
CORS(app)  # <-- allow cross-origin requests

@app.route("/predict", methods=["POST"])
def predict():
    #gets data in form of python dictionary
    data = request.get_json()

    #convert numbers from strings to actual numbers
    def to_number(val):
        try:
            return int(val)
        except (ValueError, TypeError):
            try:
                return float(val)
            except (ValueError, TypeError):
                return val  # leave as-is if not a number
    data = {k: to_number(v) for k, v in data.items()}


    # for key, value in data.items():
    #     print(f"Key: {key}, Value: {value}, Type: {type(value)}")


    
        
    #get prediction in form of dataframe
    #prediction_df = prediction_df.reset_index().rename(columns={'index': 'model'})
    prediction_df = prediction_utils.getPredictions(data)
    
    print(prediction_df)

    #convert DataFrame to JSON file
    result_json = prediction_df.to_dict(orient="records")

    #return JSON to front end
    return jsonify(result_json)

if __name__ == "__main__":
    app.run(debug=True)

    