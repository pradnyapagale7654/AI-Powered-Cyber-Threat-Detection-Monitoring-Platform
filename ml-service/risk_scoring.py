def calculate_risk_score(anomaly_score, threat_type, failed_attempts=0, connection_count=1, request_rate=0.0):
    """
    Transparent Risk Scoring Engine
    Combines anomaly score (0-1), connection features, and threat category.
    Returns: dict with risk_score (0-100), severity ("Low", "Medium", "High", "Critical"), and contributing_factors.
    """
    base_score = float(anomaly_score) * 45.0
    
    threat_multipliers = {
        'Normal': 0.0,
        'Suspicious Traffic': 25.0,
        'Port Scan': 35.0,
        'Bot Activity': 40.0,
        'Brute Force': 45.0,
        'DoS': 50.0,
        'Other Anomaly': 30.0
    }
    
    threat_weight = threat_multipliers.get(threat_type, 20.0)
    
    # Feature penalties
    failed_attempts_score = min(20.0, float(failed_attempts) * 2.5)
    connection_score = min(15.0, (float(connection_count) / 100.0) * 15.0)
    rate_score = min(20.0, (float(request_rate) / 200.0) * 20.0)
    
    total_raw_score = base_score + threat_weight + failed_attempts_score + connection_score + rate_score
    
    if threat_type == 'Normal' and anomaly_score < 0.6:
        risk_score = min(24, int(round(total_raw_score * 0.2)))
    else:
        risk_score = int(round(min(100.0, max(0.0, total_raw_score))))
        
    if risk_score <= 24:
        severity = "Low"
    elif risk_score <= 49:
        severity = "Medium"
    elif risk_score <= 74:
        severity = "High"
    else:
        severity = "Critical"
        
    factors = []
    if anomaly_score >= 0.6:
        factors.append(f"High statistical anomaly index ({anomaly_score:.2f})")
    if failed_attempts > 2:
        factors.append(f"Multiple authentication failures ({failed_attempts} attempts)")
    if connection_count > 30:
        factors.append(f"Elevated concurrent connections ({connection_count})")
    if request_rate > 50.0:
        factors.append(f"High request rate velocity ({request_rate:.1f} req/s)")
    if threat_type != 'Normal':
        factors.append(f"Pattern matched behavior rule: {threat_type}")
    if not factors:
        factors.append("Standard network baseline behavior")

    return {
        "risk_score": risk_score,
        "severity": severity,
        "contributing_factors": factors
    }
