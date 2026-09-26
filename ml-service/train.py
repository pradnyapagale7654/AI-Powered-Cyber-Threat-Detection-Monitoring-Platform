import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from generate_dataset import generate_synthetic_data
from preprocessing import preprocess_features

def train_and_save_models():
    data_path = os.path.join('data', 'synthetic_network_traffic.csv')
    if not os.path.exists(data_path):
        print("Data file not found. Generating synthetic dataset...")
        data_path = generate_synthetic_data()

    print("Loading dataset for training...")
    df = pd.read_csv(data_path)

    X_scaled, scaler = preprocess_features(df, fit_scaler=True)
    y_threat = df['threat_category'].values

    print("Training Isolation Forest for anomaly detection...")
    # IsolationForest contamination approx 0.35 (since 35% anomalies in dataset)
    iso_forest = IsolationForest(n_estimators=100, contamination=0.35, random_state=42)
    iso_forest.fit(X_scaled)

    print("Training Random Forest Classifier for threat classification...")
    rf_classifier = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    rf_classifier.fit(X_scaled, y_threat)

    models_dir = 'models'
    os.makedirs(models_dir, exist_ok=True)

    joblib.dump(iso_forest, os.path.join(models_dir, 'isolation_forest.joblib'))
    joblib.dump(rf_classifier, os.path.join(models_dir, 'random_forest.joblib'))
    joblib.dump(scaler, os.path.join(models_dir, 'scaler.joblib'))

    print("All ML models successfully trained and saved into 'models/' directory!")

if __name__ == '__main__':
    train_and_save_models()
