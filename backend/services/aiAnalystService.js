const axios = require('axios');

const analyzeIncidentWithAI = async (incidentData, customUserQuery = null) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return generateFallbackAIAnalysis(incidentData, false);
  }

  const systemInstruction = `You are CyberShield AI's senior Security Operations Center (SOC) Analyst. 
Analyze the provided network security incident using defensive cybersecurity principles only.
Return standard Markdown formatted with the following clear headings:

### What happened?
Clear explanation of the detected behavior.

### Why was it flagged?
Explain the relevant feature signals, anomaly score, and rate parameters.

### Severity explanation
Explain why the system assigned the ${incidentData.severity} severity and risk score (${incidentData.riskScore}/100).

### Investigation suggestions
Defensive triage steps for SOC engineers.

### Recommended next actions
Defensive mitigation and firewall/EDR hardening steps.

IMPORTANT SAFETY NOTICE: NEVER include instructions for executing attacks, bypassing controls, stealing credentials, or building exploit payloads. Keep all output strictly focused on defensive triage and incident response.`;

  const promptText = `
Incident ID: ${incidentData._id || incidentData.id || 'INC-DEMO'}
Threat Category: ${incidentData.threatType}
Severity: ${incidentData.severity} (Risk Score: ${incidentData.riskScore}/100)
Anomaly Score: ${incidentData.anomalyScore || 0.85}
Source IP: ${incidentData.sourceIP} -> Destination IP: ${incidentData.destinationIP}
Source Port: ${incidentData.sourcePort} -> Destination Port: ${incidentData.destinationPort}
Protocol: ${incidentData.protocol}
Features: ${JSON.stringify(incidentData.features || {})}
User Query: ${customUserQuery || "Analyze this incident and provide defensive mitigation steps."}
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [{
        parts: [{ text: `${systemInstruction}\n\n${promptText}` }]
      }]
    }, { timeout: 10000 });

    const aiContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (aiContent) {
      return {
        aiAvailable: true,
        analysisText: aiContent,
        provider: 'Gemini 1.5 Flash'
      };
    }
  } catch (err) {
    console.warn(`Gemini API call failed: ${err.message}. Returning structured analyst fallback...`);
  }

  return generateFallbackAIAnalysis(incidentData, true);
};

const generateFallbackAIAnalysis = (incidentData, apiKeyWasPresentButFailed = false) => {
  const threat = incidentData.threatType || 'Suspicious Traffic';
  const severity = incidentData.severity || 'Medium';
  const score = incidentData.riskScore || 50;
  const srcIP = incidentData.sourceIP || '192.168.1.100';
  const dstIP = incidentData.destinationIP || '10.0.0.5';
  const dstPort = incidentData.destinationPort || 80;

  const disclaimerMessage = apiKeyWasPresentButFailed
    ? "⚠️ AI API call experienced a connection error. Displaying automated SOC defensive analysis breakdown below."
    : "ℹ️ AI Security Analyst is unavailable because an AI API key has not been configured. Displaying automated SOC rule-based analysis below.";

  const text = `${disclaimerMessage}

### What happened?
The CyberShield AI engine detected a **${threat}** event originating from source address \`${srcIP}\` directed towards target \`${dstIP}\` on port \`${dstPort}\`. The overall activity pattern significantly deviated from standard network baseline metrics.

### Why was it flagged?
- **Anomaly Score:** ${incidentData.anomalyScore || 0.82} / 1.00
- **Rate Velocity:** Elevated packet volume and request frequency relative to learned host baseline.
- **Port Context:** Target port \`${dstPort}\` received repeated rapid connection attempts within a short duration window.

### Severity explanation
Assigned **${severity} Severity (Risk Score: ${score}/100)** because the behavioral signature corresponds to known non-baseline telemetry. Automated mitigation triage is recommended to isolate potential host compromises or unauthorized network discovery.

### Investigation suggestions
1. Inspect active connection sockets on \`${srcIP}\` and check memory processes for unrecognized binaries.
2. Review authentication and access control logs for \`${dstIP}\` around the incident timestamp.
3. Validate whether \`${srcIP}\` belongs to an authorized internal subnet, legitimate vulnerability scanner, or external origin.

### Recommended next actions
1. **Host Isolation:** Temporarily block inbound traffic from \`${srcIP}\` at the border firewall or security group.
2. **Access Revocation:** Validate host credentials and force password reset if repeated failed logins were recorded.
3. **Policy Enforcement:** Apply rate-limiting filters on destination port \`${dstPort}\`.`;

  return {
    aiAvailable: false,
    analysisText: text,
    provider: 'CyberShield Automated Rule Engine'
  };
};

module.exports = { analyzeIncidentWithAI };
