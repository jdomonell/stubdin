import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  Mail,
  CheckCircle,
  Music,
  MapPin,
  Calendar,
  Edit,
  Play,
  X,
  CreditCard,
  RefreshCw,
  CheckSquare,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';
import { getActivityLogs } from '@/lib/db/queries';

const iconMap: Record<ActivityType, LucideIcon> = {
  // Auth activities
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  
  // Artist activities
  [ActivityType.CREATE_ARTIST_PROFILE]: Music,
  [ActivityType.UPDATE_ARTIST_PROFILE]: Edit,
  [ActivityType.CREATE_EVENT]: Calendar,
  [ActivityType.UPDATE_EVENT]: Edit,
  [ActivityType.PUBLISH_EVENT]: Play,
  [ActivityType.CANCEL_EVENT]: X,
  
  // Venue activities
  [ActivityType.CREATE_VENUE_PROFILE]: MapPin,
  [ActivityType.UPDATE_VENUE_PROFILE]: Edit,
  
  // Booking activities
  [ActivityType.CREATE_BOOKING_REQUEST]: Mail,
  [ActivityType.ACCEPT_BOOKING_REQUEST]: CheckCircle,
  [ActivityType.REJECT_BOOKING_REQUEST]: X,
  [ActivityType.COUNTER_OFFER_BOOKING]: RefreshCw,
  
  // Ticket activities
  [ActivityType.PURCHASE_TICKET]: CreditCard,
  [ActivityType.TRANSFER_TICKET]: RefreshCw,
  [ActivityType.USE_TICKET]: CheckSquare,
  [ActivityType.REFUND_TICKET]: RefreshCw,
  
  // Review activities
  [ActivityType.CREATE_REVIEW]: Star,
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function formatAction(action: ActivityType): string {
  switch (action) {
    // Auth activities
    case ActivityType.SIGN_UP:
      return 'You signed up';
    case ActivityType.SIGN_IN:
      return 'You signed in';
    case ActivityType.SIGN_OUT:
      return 'You signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'You changed your password';
    case ActivityType.DELETE_ACCOUNT:
      return 'You deleted your account';
    case ActivityType.UPDATE_ACCOUNT:
      return 'You updated your account';
    
    // Artist activities
    case ActivityType.CREATE_ARTIST_PROFILE:
      return 'You created your artist profile';
    case ActivityType.UPDATE_ARTIST_PROFILE:
      return 'You updated your artist profile';
    case ActivityType.CREATE_EVENT:
      return 'You created a new event';
    case ActivityType.UPDATE_EVENT:
      return 'You updated an event';
    case ActivityType.PUBLISH_EVENT:
      return 'You published an event';
    case ActivityType.CANCEL_EVENT:
      return 'You cancelled an event';
    
    // Venue activities
    case ActivityType.CREATE_VENUE_PROFILE:
      return 'You created your venue profile';
    case ActivityType.UPDATE_VENUE_PROFILE:
      return 'You updated your venue profile';
    
    // Booking activities
    case ActivityType.CREATE_BOOKING_REQUEST:
      return 'You sent a booking request';
    case ActivityType.ACCEPT_BOOKING_REQUEST:
      return 'You accepted a booking request';
    case ActivityType.REJECT_BOOKING_REQUEST:
      return 'You rejected a booking request';
    case ActivityType.COUNTER_OFFER_BOOKING:
      return 'You made a counter offer';
    
    // Ticket activities
    case ActivityType.PURCHASE_TICKET:
      return 'You purchased a ticket';
    case ActivityType.TRANSFER_TICKET:
      return 'You transferred a ticket';
    case ActivityType.USE_TICKET:
      return 'You used a ticket';
    case ActivityType.REFUND_TICKET:
      return 'You refunded a ticket';
    
    // Review activities
    case ActivityType.CREATE_REVIEW:
      return 'You left a review';
    
    default:
      return 'Unknown action occurred';
  }
}

export default async function ActivityPage() {
  const logs = await getActivityLogs();

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Activity Log
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log) => {
                const Icon = iconMap[log.action as ActivityType] || Settings;
                const formattedAction = formatAction(
                  log.action as ActivityType
                );

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formattedAction}
                        {log.ipAddress && ` from IP ${log.ipAddress}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                When you perform actions like signing in or updating your
                account, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
