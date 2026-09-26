import React from 'react';
import StatusBadge from './StatusBadge';

const ThreatBadge = ({ threat, ...props }) => {
  return <StatusBadge status={threat} type="threat" {...props} />;
};

export default ThreatBadge;
