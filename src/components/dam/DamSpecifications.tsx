import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface DamSpecificationsProps {
  damData: any;
}

export function DamSpecifications({ damData }: DamSpecificationsProps) {
  return (
    <Card className="bg-white/50 dark:bg-black/40 backdrop-blur-sm border-l-4 border-l-sky-500 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Building2 className="h-4 w-4 text-sky-500" />
          Dam Specifications
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-2 rounded-lg bg-background/50 dark:bg-black/30">
              <div className="text-sm text-muted-foreground mb-1">Maximum Water Level</div>
              <div className="font-medium text-lg">{damData.MWL} m</div>
              <div className="text-xs text-muted-foreground mt-1">Highest permissible water level</div>
            </div>
            <div className="p-2 rounded-lg bg-background/50 dark:bg-black/30">
              <div className="text-sm text-muted-foreground mb-1">Full Reservoir Level</div>
              <div className="font-medium text-lg">{damData.FRL} m</div>
              <div className="text-xs text-muted-foreground mt-1">Normal maximum operating water level</div>
            </div>
            <div className="p-2 rounded-lg bg-background/50 dark:bg-black/30">
              <div className="text-sm text-muted-foreground mb-1">Live Storage at FRL</div>
              <div className="font-medium text-lg">{damData.liveStorageAtFRL} MCM</div>
              <div className="text-xs text-muted-foreground mt-1">Total water storage capacity at FRL</div>
            </div>
            <div className="p-2 rounded-lg bg-background/50 dark:bg-black/30">
              <div className="text-sm text-muted-foreground mb-1">Rule Level</div>
              {damData.ruleLevel && parseFloat(damData.ruleLevel) > 0 ? (
                <div className="font-medium text-lg">{damData.ruleLevel} m</div>
              ) : (
                <div className="font-medium text-lg">NA</div>
              )}
              <div className="text-xs text-muted-foreground mt-1">Target water level for normal operations</div>
            </div>
          </div>

          <div className="space-y-2 mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">Alert Levels</div>
            <div className="flex gap-1.5">
              {damData.redLevel && parseFloat(damData.redLevel) > 0 && (
                <div className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border border-red-200 dark:border-red-900/30">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <div className="text-xs font-medium text-red-600 dark:text-red-400">Red</div>
                  </div>
                  <div className="font-semibold mt-1">{damData.redLevel} m</div>
                </div>
              )}
              {damData.orangeLevel && parseFloat(damData.orangeLevel) > 0 && (
                <div className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border border-orange-200 dark:border-orange-900/30">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <div className="text-xs font-medium text-orange-600 dark:text-orange-400">Orange</div>
                  </div>
                  <div className="font-semibold mt-1">{damData.orangeLevel} m</div>
                </div>
              )}
              {damData.blueLevel && parseFloat(damData.blueLevel) > 0 && (
                <div className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-900/30">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Blue</div>
                  </div>
                  <div className="font-semibold mt-1">{damData.blueLevel} m</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}