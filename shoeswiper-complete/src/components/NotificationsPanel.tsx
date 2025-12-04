import React, { useState } from 'react';
import { FaTimes, FaBell, FaTag, FaExternalLinkAlt, FaTrash, FaCheck } from 'react-icons/fa';
import { usePriceAlerts, PriceNotification } from '../hooks/usePriceAlerts';
import { getAffiliateUrl } from '../lib/supabaseClient';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'notifications' | 'alerts';

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const {
    alerts,
    notifications,
    unreadCount,
    markNotificationRead,
    clearNotifications,
    removeAlert,
  } = usePriceAlerts();

  const [activeTab, setActiveTab] = useState<TabType>('notifications');

  const handleNotificationClick = (notification: PriceNotification) => {
    markNotificationRead(notification.id);
    window.open(getAffiliateUrl(notification.amazonUrl), '_blank');
  };

  const handleRemoveAlert = async (shoeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeAlert(shoeId);
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-panel-title"
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 z-50 transform transition-transform duration-300 ease-out overflow-hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <FaBell className="text-orange-500" aria-hidden="true" />
            <h2 id="notifications-panel-title" className="text-lg font-bold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" aria-label={`${unreadCount} unread notifications`}>
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800" role="tablist" aria-label="Notification types">
          <button
            onClick={() => setActiveTab('notifications')}
            role="tab"
            aria-selected={activeTab === 'notifications'}
            aria-controls="notifications-tabpanel"
            id="notifications-tab"
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-zinc-400'
            }`}
          >
            Price Drops
            {unreadCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full" aria-hidden="true">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            role="tab"
            aria-selected={activeTab === 'alerts'}
            aria-controls="alerts-tabpanel"
            id="alerts-tab"
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-zinc-400'
            }`}
          >
            Active Alerts ({alerts.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'notifications' ? (
            <div role="tabpanel" id="notifications-tabpanel" aria-labelledby="notifications-tab">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <FaTag className="text-2xl text-zinc-500" aria-hidden="true" />
                </div>
                <p className="text-white font-bold mb-1">No price drops yet</p>
                <p className="text-zinc-500 text-sm">
                  We'll notify you when shoes you're watching drop in price
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800" role="list" aria-label="Price drop notifications">
                {/* Clear All Button */}
                {notifications.length > 0 && (
                  <div className="p-3 flex justify-end">
                    <button
                      onClick={clearNotifications}
                      className="text-zinc-500 text-xs hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    aria-label={`${notification.shoeBrand} ${notification.shoeName}, price dropped from $${notification.oldPrice} to $${notification.newPrice}, save $${notification.savedAmount.toFixed(2)}`}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-zinc-900/50 transition-colors text-left ${
                      !notification.read ? 'bg-orange-500/5' : ''
                    }`}
                  >
                    {/* Image */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={notification.shoeImage}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      {!notification.read && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-zinc-950" aria-hidden="true" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-orange-500 font-bold uppercase">
                            {notification.shoeBrand}
                          </p>
                          <p className="text-white font-bold text-sm line-clamp-1">
                            {notification.shoeName}
                          </p>
                        </div>
                        <span className="text-zinc-500 text-xs flex-shrink-0">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      {/* Price Drop Info */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-zinc-500 line-through text-sm">
                          ${notification.oldPrice}
                        </span>
                        <span className="text-green-400 font-bold">
                          ${notification.newPrice}
                        </span>
                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-1.5 py-0.5 rounded">
                          -{notification.percentOff}%
                        </span>
                      </div>

                      <p className="text-green-400 text-xs mt-1">
                        You save ${notification.savedAmount.toFixed(2)}!
                      </p>
                    </div>

                    <FaExternalLinkAlt className="text-zinc-500 text-xs flex-shrink-0 mt-1" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
            </div>
          ) : (
            // Active Alerts Tab
            <div role="tabpanel" id="alerts-tabpanel" aria-labelledby="alerts-tab">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <FaBell className="text-2xl text-zinc-500" aria-hidden="true" />
                </div>
                <p className="text-white font-bold mb-1">No active alerts</p>
                <p className="text-zinc-500 text-sm">
                  Set price alerts on shoes you're interested in
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800" role="list" aria-label="Active price alerts">
                {alerts.map((alert) => (
                  <div
                    key={alert.shoeId}
                    className="p-4 flex items-center gap-3"
                  >
                    {/* Image */}
                    <img
                      src={alert.shoeImage}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-orange-500 font-bold uppercase">
                        {alert.shoeBrand}
                      </p>
                      <p className="text-white font-medium text-sm line-clamp-1">
                        {alert.shoeName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-zinc-400 text-xs">Alert at:</span>
                        <span className="text-yellow-400 font-bold text-sm">
                          ${alert.targetPrice}
                        </span>
                        {alert.triggered && (
                          <span className="bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                            <FaCheck className="text-[10px]" aria-hidden="true" /> Triggered
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => handleRemoveAlert(alert.shoeId, e)}
                      aria-label={`Remove price alert for ${alert.shoeName}`}
                      className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <FaTrash className="text-xs" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        {activeTab === 'notifications' && notifications.length > 0 && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
            <p className="text-center text-zinc-500 text-xs">
              Tap a notification to buy on Amazon with your affiliate link
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsPanel;
