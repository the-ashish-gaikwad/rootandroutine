import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  subMonths,
  format,
  parseISO,
  getDate,
} from 'date-fns';
import { ChartView, BarMode, StudySession, Subject, colorToHex } from '@/types/study';
import { cn } from '@/lib/utils';

interface StudyChartProps {
  sessions: StudySession[];
  subjects: Subject[];
  view: ChartView;
  mode: BarMode;
}

interface ChartDataPoint {
  label: string;
  total: number;
  [key: string]: number | string;
}

export function StudyChart({ sessions, subjects, view, mode }: StudyChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    let dataPoints: ChartDataPoint[] = [];

    if (view === 'daily') {
      // Days 1-31 of current month
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      dataPoints = days.map((day) => {
        const dayNum = getDate(day);
        const dateStr = format(day, 'yyyy-MM-dd');
        const daySessions = sessions.filter((s) => s.date === dateStr);

        const point: ChartDataPoint = {
          label: dayNum.toString(),
          total: 0,
        };

        if (mode === 'stacked') {
          subjects.forEach((subject) => {
            const subjectMinutes = daySessions
              .filter((s) => s.subjectId === subject.id)
              .reduce((sum, s) => sum + s.duration, 0);
            point[subject.id] = subjectMinutes / 60; // Convert to hours
            point.total += subjectMinutes / 60;
          });
        } else {
          point.total = daySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
        }

        return point;
      });
    } else if (view === 'weekly') {
      // Days of current week (Mon-Sun)
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

      dataPoints = days.map((day) => {
        const dayLabel = format(day, 'EEE');
        const dateStr = format(day, 'yyyy-MM-dd');
        const daySessions = sessions.filter((s) => s.date === dateStr);

        const point: ChartDataPoint = {
          label: dayLabel,
          total: 0,
        };

        if (mode === 'stacked') {
          subjects.forEach((subject) => {
            const subjectMinutes = daySessions
              .filter((s) => s.subjectId === subject.id)
              .reduce((sum, s) => sum + s.duration, 0);
            point[subject.id] = subjectMinutes / 60;
            point.total += subjectMinutes / 60;
          });
        } else {
          point.total = daySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
        }

        return point;
      });
    } else {
      // Monthly - last 12 months
      const months = Array.from({ length: 12 }, (_, i) => subMonths(now, 11 - i));

      dataPoints = months.map((month) => {
        const monthLabel = format(month, 'MMM');
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const monthSessions = sessions.filter((s) => {
          const sessionDate = parseISO(s.date);
          return sessionDate >= monthStart && sessionDate <= monthEnd;
        });

        const point: ChartDataPoint = {
          label: monthLabel,
          total: 0,
        };

        if (mode === 'stacked') {
          subjects.forEach((subject) => {
            const subjectMinutes = monthSessions
              .filter((s) => s.subjectId === subject.id)
              .reduce((sum, s) => sum + s.duration, 0);
            point[subject.id] = subjectMinutes / 60;
            point.total += subjectMinutes / 60;
          });
        } else {
          point.total = monthSessions.reduce((sum, s) => sum + s.duration, 0) / 60;
        }

        return point;
      });
    }

    return dataPoints;
  }, [sessions, subjects, view, mode]);

  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.total), 1);
    return Math.ceil(max);
  }, [chartData]);

  const formatTooltip = (value: number) => {
    const hours = Math.floor(value);
    const mins = Math.round((value - hours) * 60);
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  return (
     <div className="w-full h-[280px] sm:h-[350px] lg:h-[400px] notebook-paper rounded-lg p-2 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
           margin={{ top: 10, right: 40, left: 25, bottom: 10 }}
        >
          <XAxis
            type="number"
            domain={[0, maxValue]}
            tickFormatter={(v) => `${v}h`}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
             tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
             tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
             width={30}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const subject = subjects.find((s) => s.id === name);
              return [formatTooltip(value), subject?.name || 'Total'];
            }}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: 'var(--notebook-shadow)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          {mode === 'stacked' ? (
            subjects.map((subject) => (
              <Bar
                key={subject.id}
                dataKey={subject.id}
                stackId="stack"
                fill={colorToHex[subject.color]}
                radius={[0, 4, 4, 0]}
              />
            ))
          ) : (
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[0, 6, 6, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.total > 0
                      ? 'hsl(var(--primary))'
                      : 'hsl(var(--muted))'
                  }
                />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
      
      {mode === 'stacked' && subjects.length > 0 && (
         <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-4 justify-center">
          {subjects.map((subject) => (
             <div key={subject.id} className="flex items-center gap-1.5 text-xs sm:text-sm">
              <div
                 className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                style={{ backgroundColor: colorToHex[subject.color] }}
              />
              <span className="text-muted-foreground">{subject.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
