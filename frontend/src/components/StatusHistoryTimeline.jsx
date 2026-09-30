import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, User, FileText } from 'lucide-react';

const StatusHistoryTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div style={{ color: '#6B7280', fontSize: '0.85rem', fontStyle: 'italic' }}>
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
          backgroundColor: '#E5E7EB',
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
                backgroundColor: '#FFFFFF',
                border: '2px solid #2563EB',
              }}
            />

            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
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
                    color: '#6B7280',
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
                  color: '#4B5563',
                }}
              >
                <User size={12} />
                <span>
                  Updated by: <strong style={{ color: '#1F2937' }}>{item.changedBy}</strong>
                </span>
              </div>

              {item.note && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#1F2937',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
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
