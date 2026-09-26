import os
import random
import numpy as np
import pandas as pd

def generate_synthetic_data(num_records=5000, seed=42):
    np.random.seed(seed)
    random.seed(seed)

    records = []

    protocols = ['TCP', 'UDP', 'ICMP']
    threat_types = ['Normal', 'Port Scan', 'Brute Force', 'DoS', 'Bot Activity', 'Suspicious Traffic']
    probabilities = [0.65, 0.10, 0.08, 0.10, 0.04, 0.03]

    common_ports = [80, 443, 22, 21, 53, 3389, 8080, 445, 1433]

    for i in range(num_records):
        threat = np.random.choice(threat_types, p=probabilities)
        is_anomaly = 0 if threat == 'Normal' else 1

        if threat == 'Normal':
            duration = round(float(np.random.exponential(scale=2.5) + 0.1), 3)
            protocol = np.random.choice(protocols, p=[0.7, 0.25, 0.05])
            src_bytes = int(np.random.normal(loc=1200, scale=400))
            dst_bytes = int(np.random.normal(loc=4500, scale=1500))
            packet_count = int(np.random.normal(loc=25, scale=10))
            src_port = random.randint(1025, 65535)
            dst_port = random.choice([80, 443, 53, 8080])
            failed_attempts = 0 if random.random() > 0.05 else 1
            connection_count = max(1, int(np.random.normal(loc=5, scale=3)))
            request_rate = round(float(np.random.uniform(1.0, 15.0)), 2)

        elif threat == 'Port Scan':
            duration = round(float(np.random.uniform(0.01, 0.5)), 3)
            protocol = 'TCP' if random.random() > 0.15 else 'UDP'
            src_bytes = int(np.random.uniform(40, 120))
            dst_bytes = int(np.random.uniform(0, 80))
            packet_count = int(np.random.uniform(1, 4))
            src_port = random.randint(30000, 60000)
            dst_port = random.choice(common_ports)
            failed_attempts = max(0, int(np.random.poisson(lam=1)))
            connection_count = int(np.random.uniform(40, 200))
            request_rate = round(float(np.random.uniform(50.0, 300.0)), 2)

        elif threat == 'Brute Force':
            duration = round(float(np.random.uniform(0.1, 1.2)), 3)
            protocol = 'TCP'
            src_bytes = int(np.random.uniform(300, 800))
            dst_bytes = int(np.random.uniform(100, 400))
            packet_count = int(np.random.uniform(6, 18))
            src_port = random.randint(1025, 65535)
            dst_port = random.choice([22, 21, 3389, 445])  # SSH, FTP, RDP, SMB
            failed_attempts = int(np.random.randint(5, 35))
            connection_count = int(np.random.uniform(20, 80))
            request_rate = round(float(np.random.uniform(20.0, 100.0)), 2)

        elif threat == 'DoS':
            duration = round(float(np.random.uniform(0.001, 0.1)), 3)
            protocol = np.random.choice(['TCP', 'UDP', 'ICMP'], p=[0.5, 0.4, 0.1])
            src_bytes = int(np.random.uniform(64, 1500))
            dst_bytes = int(np.random.uniform(0, 64))
            packet_count = int(np.random.uniform(100, 1000))
            src_port = random.randint(1025, 65535)
            dst_port = random.choice([80, 443, 53])
            failed_attempts = 0
            connection_count = int(np.random.uniform(200, 1000))
            request_rate = round(float(np.random.uniform(500.0, 3000.0)), 2)

        elif threat == 'Bot Activity':
            duration = round(float(np.random.uniform(1.0, 10.0)), 3)
            protocol = 'TCP'
            src_bytes = int(np.random.uniform(1500, 5000))
            dst_bytes = int(np.random.uniform(2000, 8000))
            packet_count = int(np.random.uniform(30, 90))
            src_port = random.randint(1025, 65535)
            dst_port = random.choice([80, 443, 8080])
            failed_attempts = int(np.random.binomial(n=3, p=0.3))
            connection_count = int(np.random.uniform(15, 60))
            request_rate = round(float(np.random.uniform(35.0, 120.0)), 2)

        else: # Suspicious Traffic / Other Anomaly
            duration = round(float(np.random.uniform(0.5, 15.0)), 3)
            protocol = np.random.choice(protocols)
            src_bytes = int(np.random.uniform(10, 20000))
            dst_bytes = int(np.random.uniform(10, 30000))
            packet_count = int(np.random.uniform(5, 200))
            src_port = random.randint(1025, 65535)
            dst_port = random.randint(1, 65535)
            failed_attempts = int(np.random.randint(1, 10))
            connection_count = int(np.random.uniform(10, 150))
            request_rate = round(float(np.random.uniform(10.0, 250.0)), 2)

        src_bytes = max(0, src_bytes)
        dst_bytes = max(0, dst_bytes)
        packet_count = max(1, packet_count)

        records.append({
            'duration': duration,
            'protocol': protocol,
            'source_bytes': src_bytes,
            'destination_bytes': dst_bytes,
            'packet_count': packet_count,
            'source_port': src_port,
            'destination_port': dst_port,
            'failed_attempts': failed_attempts,
            'connection_count': connection_count,
            'request_rate': request_rate,
            'threat_category': threat,
            'is_anomaly': is_anomaly
        })

    df = pd.DataFrame(records)
    
    os.makedirs('data', exist_ok=True)
    file_path = os.path.join('data', 'synthetic_network_traffic.csv')
    df.to_csv(file_path, index=False)
    print(f"Successfully generated synthetic dataset with {len(df)} records at: {file_path}")
    print(df['threat_category'].value_counts())
    return file_path

if __name__ == '__main__':
    generate_synthetic_data()
