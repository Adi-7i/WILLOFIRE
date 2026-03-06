import { Clock } from 'lucide-react';

interface ActivityItem {
    id: string;
    title: string;
    description: string;
    timestamp: string;
}

const dummyActivities: ActivityItem[] = [
    {
        id: '1',
        title: 'Evaluated Answer',
        description: 'Chapter 4 Physics Mock Test',
        timestamp: '2 hours ago',
    },
    {
        id: '2',
        title: 'Uploaded PDF',
        description: 'Advanced Calculus Notes',
        timestamp: '5 hours ago',
    },
    {
        id: '3',
        title: 'Generated Mock Test',
        description: 'Based on Organic Chemistry',
        timestamp: '1 day ago',
    },
];

export function ActivityFeed() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {dummyActivities.map((activity) => (
                    <div key={activity.id} className="p-6 transition-colors hover:bg-slate-50">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 bg-amber-100 rounded-full p-2 text-amber-600">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                                <p className="text-sm text-slate-500">{activity.description}</p>
                            </div>
                            <div className="text-xs text-slate-400 whitespace-nowrap">
                                {activity.timestamp}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
