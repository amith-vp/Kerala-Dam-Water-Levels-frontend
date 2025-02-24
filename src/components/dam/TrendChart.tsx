import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Line, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";
import { LucideIcon } from "lucide-react";

interface DataPoint {
  [key: string]: any;
}

interface ChartConfig {
  type: 'line' | 'area';
  dataKey: string;
  color: string;
  label: string;
  yAxisId?: string;
}

interface TrendChartProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  data: DataPoint[];
  charts: ChartConfig[];
  unit: string;
  domain?: [number, number];
  height?: number;
  secondaryUnit?: string;
}

export function TrendChart({ 
  title, 
  icon: Icon, 
  iconColor, 
  data, 
  charts,
  unit,
  domain,
  height = 250,
  secondaryUnit
}: TrendChartProps) {
  const hasSecondaryAxis = charts.some(chart => chart.yAxisId === 'right');

  return (
    <Card className={`bg-white/50 dark:bg-black/40 backdrop-blur-sm border-l-4 transition-all duration-300 hover:shadow-lg`} style={{ borderLeftColor: iconColor }}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer 
                config={Object.fromEntries(
                  charts.map(chart => [
                    chart.dataKey,
                    { color: chart.color, label: chart.label }
                  ])
                )}
              >
                <ComposedChart
                  data={data}
                  margin={{ top: 15, right: hasSecondaryAxis ? 65 : 15, left: 5, bottom: 5 }}
                >
                  <defs>
                    {charts.map(chart => chart.type === 'area' && (
                      <linearGradient key={chart.dataKey} id={`${chart.dataKey}Gradient`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chart.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.4} />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-muted-foreground"
                    tickMargin={8}
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={domain}
                    className="text-xs text-muted-foreground"
                    tickMargin={16}
                    unit={` ${unit}`}
                    width={65}
                  />
                  {hasSecondaryAxis && (
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      className="text-xs text-muted-foreground"
                      tickMargin={8}
                      unit={secondaryUnit ? ` ${secondaryUnit}` : ''}
                      width={65}
                    />
                  )}
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend 
                    align="center"
                    height={32}
                    content={
                      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 px-2 py-1.5 border-t">
                        {charts.map(chart => (
                          <div key={chart.dataKey} className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: chart.color }}></div>
                            <span className="text-sm font-medium text-muted-foreground">
                              {chart.label} {chart.yAxisId !== 'right' ? `(${unit})` : secondaryUnit ? `(${secondaryUnit})` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    }
                  />
                  {charts.map(chart => {
                    if (chart.type === 'area') {
                      return (
                        <Area
                          key={chart.dataKey}
                          type="monotone"
                          yAxisId={chart.yAxisId || 'left'}
                          dataKey={chart.dataKey}
                          stroke={chart.color}
                          strokeWidth={2}
                          fill={`url(#${chart.dataKey}Gradient)`}
                          dot={false}
                          name={chart.dataKey}
                        />
                      );
                    }
                    return (
                      <Line
                        key={chart.dataKey}
                        type="monotone"
                        yAxisId={chart.yAxisId || 'left'}
                        dataKey={chart.dataKey}
                        stroke={chart.color}
                        strokeWidth={2}
                        dot={false}
                        name={chart.dataKey}
                      />
                    );
                  })}
                </ComposedChart>
              </ChartContainer>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No data available for the selected time range
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}