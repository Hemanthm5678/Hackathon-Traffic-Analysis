# Hackathon-Traffic-Analysis / Safe Route Finder

## Project Title: Traffic Risk Analysis and Route Safety Prediction

### **1. Overview**

This project, **"Safe Route Finder,"** provides an innovative solution for enhancing navigational safety by predicting accident risk along driving routes. It leverages machine learning models trained on real U.S. accident data to offer users a data-driven approach to choose safer paths. The application provides an API to fetch accident data and calculate route safety, making it a valuable tool for smart transportation initiatives, navigation apps, and road safety analysis.

Built with Python (Flask, scikit-learn, pandas) for the backend and HTML, CSS, JavaScript (Leaflet.js) for the interactive frontend.

### **2. Dataset**

We utilized the `US_Accidents_March23.csv` dataset, sourced from Kaggle.
This comprehensive dataset contains detailed accident records from 2016-2023 across the United States, including crucial information such as latitude, longitude, severity, weather conditions, time of day, and more. We used a processed version of this data (`encoded_features.csv`) to train our machine learning model, which estimates accident risk along a given route.

### **3. Key Features**

* **Predicts Accident Severity:** Utilizes a trained machine learning model (`accident_model.pkl`) to estimate the probability of a major accident for any given road segment.
* **Route Safety Scores:** Provides segment-by-segment safety scores based on historical data and predictive analysis, giving a granular view of risk.
* **Accident Heatmap API:** Offers a backend API and frontend visualization for displaying historical accident hotspots, allowing users to quickly identify high-risk areas.
* **Interactive Map Interface:** A user-friendly web interface built with Leaflet.js for dynamic map interactions.
* **Flask Backend:** A robust Python Flask API handles data processing, machine learning predictions, and serves data to the frontend.

### **4. Technology Stack**

**Frontend:**
* **HTML5, CSS3:** For the application's structure and styling.
* **JavaScript (ES6):** Powers the interactive map and API communication.
* **Leaflet.js:** Open-source JavaScript library for interactive maps.
* **Leaflet Routing Machine:** Used for initial route calculation.
* **Leaflet.heat:** For rendering the accident hotspot heatmap.

**Backend:**
* **Python 3.x:** Primary language for server-side logic and machine learning.
* **Flask:** A micro web framework for building the RESTful API.
* **Flask-CORS:** Enables cross-origin requests for frontend-backend communication.

**Machine Learning & Data Processing:**
* **scikit-learn:** For machine learning model implementation (KNN and predictive model).
* **pandas:** For efficient data loading and manipulation.
* **numpy:** For numerical operations.
* **joblib:** For efficient serialization and deserialization of the ML model.

### **5. Project Structure**

.
├── app.py                     # Flask backend application
├── accident_model.pkl         # Pre-trained machine learning model for severity prediction
├── encoded_features.csv       # Processed dataset with features for KNN and prediction
├── index.html                 # Main frontend HTML file
├── script.js                  # Frontend JavaScript logic for map, UI, and API calls
├── style.css                  # Frontend CSS for visual presentation
├── requirements.txt           # List of Python dependencies
├── US_Accidents_March23.csv   # Original raw accident dataset (for reference/re-training)
├── Traffic_analysis_accident_model.ipynb # Jupyter Notebook for ML model training and analysis walkthrough
└── README.md                  # This documentation file


### **6. Setup and Installation**

To get the Safe Route Finder running locally, follow these steps:

1.  **Prerequisites:**
    * Ensure you have **Python 3.8+** and `pip` installed on your system.
    * A modern web browser (Chrome, Firefox, Edge, Safari).

2.  **Clone the Repository (or download files):**
    ```bash
    git clone [https://github.com/Hemanthm5670/Hackathon-Traffic-Analysis.git](https://github.com/Hemanthm5670/Hackathon-Traffic-Analysis.git)
    cd Hackathon-Traffic-Analysis
    ```

3.  **Create a Virtual Environment (Recommended):**
    This isolates your project's dependencies to prevent conflicts with other Python projects.
    ```bash
    python -m venv venv
    ```

4.  **Activate the Virtual Environment:**
    * **On Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
    * **On macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```

5.  **Install Python Dependencies:**
    With your virtual environment active, install all required libraries listed in `requirements.txt`:
    ```bash
    pip install -r requirements.txt
    ```

### **7. Running the Application**

Ensure your virtual environment is activated before running.

1.  **Start the Backend Server:**
    This will launch the Flask API.
    ```bash
    python app.py
    ```
    You should see output similar to `* Running on http://127.0.0.1:5000` (or another port). Keep this terminal window open.

2.  **Open the Frontend:**
    In your web browser, navigate to the `index.html` file located in the project root directory.
    * You can typically just double-click `index.html` in your file explorer.
    * **Important:** Ensure the backend server (`app.py`) is already running *before* you open `index.html`.

### **8. How to Use the Safe Route Finder**

Once the application is loaded in your browser:

1.  **Observe Accident Heatmap:**
    * Upon initial load, the map will display a heatmap of historical accident concentration zones (primarily focused on the New Delhi region in the demo).
    * You can toggle this heatmap layer on or off using the "Toggle Accident Zones" button for a clearer view.

2.  **Input Your Route:**
    * In the "From" input field, type your starting location (e.g., "Connaught Place, New Delhi").
    * In the "To" input field, type your destination (e.g., "India Gate, New Delhi").

3.  **Get Safety Analysis:**
    * Click the "Find Safest Route" button.
    * A loading indicator and status message will appear while the backend processes your request.
    * The map will then display the analyzed route, color-coded based on predicted safety:
        * **Green:** Indicates safer road segments.
        * **Yellow:** Indicates segments with moderate predicted risk.
        * **Red:** Indicates segments with a higher predicted risk of accidents.

4.  **Interpret the Route:** Use the color-coding to understand which parts of your journey might be statistically more dangerous, allowing you to exercise extra caution or consider alternative routes if available.

### **9. Troubleshooting**

* **`ModuleNotFoundError` or `No module named 'flask'`:**
    * Ensure you have activated your Python virtual environment (`source venv/bin/activate` or `.\venv\Scripts\activate`) before running `pip install -r requirements.txt` and `python app.py`.
* **"Failed to fetch" / CORS errors in browser console:**
    * The most common cause is the Flask backend (`app.py`) not running. Start the backend *first*.
    * Ensure the backend is running on `http://127.0.0.1:5000` (or whatever URL your `script.js` is configured to call).
    * `Flask-Cors` is included in `requirements.txt` to mitigate these, but correct startup order is key.
* **Map not loading / Tiles missing / Geocoding fails:**
    * Verify you have an active internet connection. Leaflet relies on external tile servers and geocoding APIs.
* **`accident_model.pkl` or `encoded_features.csv` not found:**
    * Ensure these files are in the same directory as `app.py`.

### **10. Future Enhancements**

* Integrate real-time data: Incorporate live traffic, weather, and time-of-day into the risk prediction model.
* Suggest alternative routes: Provide multiple safety-ranked route options rather than just analyzing one.
* User feedback loop: Allow users to report new accidents or confirm dangerous areas to continuously improve the model.
* Mobile application: Develop a native mobile app for on-the-go safety analysis.
* Expand geographical coverage: Train models for other regions beyond the initial focus.

---
