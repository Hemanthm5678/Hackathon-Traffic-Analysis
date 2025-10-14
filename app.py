from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from sklearn.neighbors import NearestNeighbors
import numpy as np

# Initialize the Flask application
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# --- 1. LOAD MODELS AND DATA ---
try:
    model = joblib.load('accident_model.pkl')
    features_df = pd.read_csv('encoded_features.csv')
    
    # Load the sampled accident data for the heatmap
    accidents_df = pd.read_csv('accidents_sample.csv')
    
    # Prepare KNN model for fast location lookups
    location_features = features_df[['Start_Lat', 'Start_Lng']].copy()
    print("Fitting KNN model for location lookup...")
    knn = NearestNeighbors(n_neighbors=10, algorithm='ball_tree')
    knn.fit(location_features)
    print("KNN model and all data loaded successfully.")

except FileNotFoundError as e:
    print(f"ERROR: Could not find a required file. Please check file names. Details: {e}")
    model = None
    knn = None
    accidents_df = None

# --- API ENDPOINT #1: Provide data for the heatmap ---
@app.route('/api/accidents', methods=['GET'])
def get_accidents():
    if accidents_df is None:
        return jsonify({"error": "Accident data not loaded on server."}), 500
    
    # Convert lat, lng, and severity into a list of lists for the heatmap
    heat_data = accidents_df[['Start_Lat', 'Start_Lng', 'Severity']].values.tolist()
    return jsonify(heat_data)


# --- API ENDPOINT #2: Analyze a route for safety ---
@app.route('/api/find_safe_route', methods=['POST'])
def find_safe_route():
    if not model or not knn:
        return jsonify({"error": "Model or data not loaded"}), 500

    data = request.json
    waypoints = data.get('waypoints')

    if not waypoints or len(waypoints) < 2:
        return jsonify({"error": "Invalid waypoints data"}), 400

    route_safety_scores = []
    
    for point in waypoints:
        lat, lng = point
        
        # Create a DataFrame with the correct feature names to prevent the warning
        point_df = pd.DataFrame([[lat, lng]], columns=['Start_Lat', 'Start_Lng'])
        
        # Find 10 nearest historical accident locations
        distances, indices = knn.kneighbors(point_df)
        nearby_accidents_features = features_df.iloc[indices[0]]
        
        # Predict if these would be "Major" (1) or "Minor" (0)
        predictions = model.predict(nearby_accidents_features)
        
        # Risk score is the percentage of nearby accidents predicted to be "Major"
        risk_score = np.mean(predictions) if len(predictions) > 0 else 0
        route_safety_scores.append(risk_score)

    return jsonify({
        "waypoints": waypoints,
        "safety_scores": route_safety_scores
    })

# --- Run the Flask Application ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)