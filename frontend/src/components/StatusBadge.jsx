import React from 'react';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Pending':
      return (
        <span className="badge badge-pending">
          <Clock size={12} />
          <span>Pending</span>
        </span>
      );
    case 'Assigned':
      return (
        <span className="badge badge-assigned">
          <AlertCircle size={12} />
          <span>Assigned</span>
        </span>
      );
    case 'In Progress':
      return (
        <span className="badge badge-in-progress">
          <RefreshCw size={12} />
          <span>In Progress</span>
        </span>
      );
    case 'Completed':
      return (
        <span className="badge badge-completed">
          <CheckCircle2 size={12} />
          <span>Completed</span>
        </span>
      );
    case 'Cancelled':
      return (
        <span className="badge badge-cancelled">
          <XCircle size={12} />
          <span>Cancelled</span>
        </span>
      );
    default:
      return (
        <span className="badge badge-pending">
          <span>{status}</span>
        </span>
      );
  }
};

export default StatusBadge;
