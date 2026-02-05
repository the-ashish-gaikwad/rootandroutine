import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, Layers } from 'lucide-react';
import { ChartView, BarMode } from '@/types/study';
import { cn } from '@/lib/utils';

interface ChartControlsProps {
  view: ChartView;
  mode: BarMode;
  onViewChange: (view: ChartView) => void;
  onModeChange: (mode: BarMode) => void;
}

export function ChartControls({
  view,
  mode,
  onViewChange,
  onModeChange,
}: ChartControlsProps) {
  return (
     <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
      {/* View toggle */}
      <Tabs value={view} onValueChange={(v) => onViewChange(v as ChartView)}>
        <TabsList className="bg-muted/70">
           <TabsTrigger value="daily" className="text-xs sm:text-sm px-2 sm:px-3">
            Daily
          </TabsTrigger>
           <TabsTrigger value="weekly" className="text-xs sm:text-sm px-2 sm:px-3">
            Weekly
          </TabsTrigger>
           <TabsTrigger value="monthly" className="text-xs sm:text-sm px-2 sm:px-3">
            Monthly
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-muted/70 p-1 rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onModeChange('simple')}
          className={cn(
             'gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3',
            mode === 'simple' && 'bg-background shadow-sm'
          )}
        >
          <BarChart2 className="w-4 h-4" />
           <span className="hidden xs:inline">Simple</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onModeChange('stacked')}
          className={cn(
             'gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3',
            mode === 'stacked' && 'bg-background shadow-sm'
          )}
        >
          <Layers className="w-4 h-4" />
           <span className="hidden xs:inline">Stacked</span>
        </Button>
      </div>
    </div>
  );
}
