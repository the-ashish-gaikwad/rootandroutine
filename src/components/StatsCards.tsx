import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StudyStats, formatDuration } from '@/types/study';
import { Clock, TrendingUp, Calendar, Flame } from 'lucide-react';

interface StatsCardsProps {
  stats: StudyStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Today',
      value: formatDuration(stats.today),
      icon: Clock,
      color: 'text-pastel-mint',
      bgColor: 'bg-pastel-mint/20',
    },
    {
      label: 'This Week',
      value: formatDuration(stats.thisWeek),
      icon: TrendingUp,
      color: 'text-pastel-lavender',
      bgColor: 'bg-pastel-lavender/20',
    },
    {
      label: 'This Month',
      value: formatDuration(stats.thisMonth),
      icon: Calendar,
      color: 'text-pastel-peach',
      bgColor: 'bg-pastel-peach/20',
    },
    {
      label: 'Streak',
      value: `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`,
      icon: Flame,
      color: 'text-pastel-coral',
      bgColor: 'bg-pastel-coral/20',
    },
  ];

  return (
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="notebook-shadow border-border/50 bg-card/80 backdrop-blur-sm"
        >
           <CardContent className="p-3 sm:p-4">
             <div className="flex items-center gap-2 sm:gap-3">
               <div className={`p-1.5 sm:p-2 rounded-lg ${card.bgColor}`}>
                 <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />
              </div>
              <div>
                 <p className="text-xs sm:text-sm text-muted-foreground">{card.label}</p>
                 <p className="text-base sm:text-xl font-semibold">{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
