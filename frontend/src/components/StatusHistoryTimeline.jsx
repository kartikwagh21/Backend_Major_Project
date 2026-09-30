import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, User, FileText } from 'lucide-react';

const StatusHistoryTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
        No status history recorded yet.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '1.25rem', marginTop: '0.75rem' }}>
      {/* Line */}
      <div
        style={{
          position: 'absolute',
          left: '5px',
          top: '8px',
          bottom: '8px',
          width: '2px',
          backgroundColor: '#1e293d',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.map((item, idx) => (
          <div key={item._id || idx} style={{ position: 'relative' }}>
            {/* Dot */}
            <div
              style={{
                position: 'absolute',
                left: '-1.25rem',
                top: '5px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#111726',
                border: '2px solid #3b82f6',
              }}
            />

            <div
              style={{
                backgroundColor: '#0c121e',
                border: '1px solid #1e293d',
                borderRadius: '8px',
                padding: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.35rem',
                }}
              >
                <StatusBadge status={item.status} />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    color: '#64748b',
                  }}
                >
                  <Calendar size={12} />
                  <span>
                    {new Date(item.changedAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                }}
              >
                <User size={12} />
                <span>
                  Updated by: <strong style={{ color: '#f8fafc' }}>{item.changedBy}</strong>
                </span>
              </div>

              {item.note && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    backgroundColor: '#111726',
                    border: '1px solid #1e293d',
                    padding: '0.4rem 0.55rem',
                    borderRadius: '4px',
                    marginTop: '0.35rem',
                  }}
                >
                  {item.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusHistoryTimeline;
