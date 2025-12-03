import React from 'react';
import { EscrowTransaction, EscrowTimeline, buildEscrowTimeline } from '../../lib/escrow';

interface OrderTimelineProps {
  transaction: EscrowTransaction;
  compact?: boolean;
}

/**
 * Visual timeline of order/escrow events
 */
export function OrderTimeline({ transaction, compact = false }: OrderTimelineProps) {
  const timeline = buildEscrowTimeline(transaction);

  if (timeline.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {timeline.map((event, index) => (
        <TimelineEvent
          key={`${event.event}-${event.timestamp}`}
          event={event}
          isFirst={index === 0}
          isLast={index === timeline.length - 1}
          compact={compact}
        />
      ))}
    </div>
  );
}

interface TimelineEventProps {
  event: EscrowTimeline;
  isFirst: boolean;
  isLast: boolean;
  compact: boolean;
}

function TimelineEvent({ event, isFirst, isLast, compact }: TimelineEventProps) {
  const { icon, color } = getEventStyle(event.event);

  const formattedDate = formatEventDate(event.timestamp);

  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-xs text-zinc-400">{event.description}</span>
        <span className="text-xs text-zinc-600">{formattedDate}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${color}
          `}
        >
          {icon}
        </div>
        {!isLast && (
          <div className="w-0.5 h-full min-h-[2rem] bg-zinc-700" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
        <p className="font-medium text-white">{event.description}</p>
        <p className="text-sm text-zinc-500">{formattedDate}</p>
      </div>
    </div>
  );
}

function getEventStyle(eventType: string): { icon: React.ReactNode; color: string } {
  const iconClass = 'w-4 h-4 text-white';

  switch (eventType) {
    case 'created':
      return {
        color: 'bg-zinc-600',
        icon: (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        ),
      };
    case 'paid':
      return {
        color: 'bg-blue-500',
        icon: (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ),
      };
    case 'shipped':
      return {
        color: 'bg-purple-500',
        icon: (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ),
      };
    case 'delivered':
      return {
        color: 'bg-green-500',
        icon: (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
      };
    case 'escrow_started':
      return {
        color: 'bg-yellow-500',
        icon: (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    case 'released':
      return {
        color: 'bg-green-600',
        icon: (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    case 'refunded':
      return {
        color: 'bg-red-500',
        icon: (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        ),
      };
    default:
      return {
        color: 'bg-zinc-500',
        icon: (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
  }
}

function formatEventDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export default OrderTimeline;
