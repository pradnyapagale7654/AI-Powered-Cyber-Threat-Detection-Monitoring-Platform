import React from 'react';
import StatusBadge from './StatusBadge';

const SeverityBadge = ({ severity, ...props }) => {
  return <StatusBadge status={severity} type="severity" {...props} />;
};

export default SeverityBadge;
