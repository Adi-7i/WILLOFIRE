import { Clock } from 'lucide-react';
import { DashboardActivityItem } from '@/hooks/use-dashboard';

interface ActivityFeedProps {
    items: DashboardActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-muted/35 px-6 py-4">
                <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {items.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">No activity yet.</div>
                ) : (
                    items.map((activity) => (
                        <div key={activity.id} className="p-6 transition-colors hover:bg-muted/35">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-[rgba(63,110,106,0.22)] rounded-full p-2 text-[#95AAA7]">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                                </div>
                                <div className="text-xs text-muted-foreground/80 whitespace-nowrap">
                                    {activity.timestamp}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
