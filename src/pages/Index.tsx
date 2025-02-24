import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SplitPane } from "@/components/ui/split-pane";
import { fetchLiveDamData } from "@/lib/api";
import Map from "@/components/Map";
import DamList from "@/components/DamList";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from 'react-helmet';

const Index = () => {
  const { toast } = useToast();
  const [horizontalSizes, setHorizontalSizes] = useState([70, 30]);
  const [verticalSizes, setVerticalSizes] = useState([45, 55]);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dams"],
    queryFn: fetchLiveDamData,
    meta: {
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to fetch dam data. Please try again later.",
          variant: "destructive",
        });
      },
    },
  });

  if (!isClient) {
    return <div className="h-screen w-screen bg-gradient-to-br from-background to-secondary" />;
  }

  return (
    <div className="h-full w-full relative isolate">
      <div className="absolute inset-0 bg-gradient-to-br from-background to-background/50 -z-10" />
      <div className="absolute inset-0 p-2 sm:p-4 flex flex-col">
        <div className="flex-1 min-h-0 isolate">
          <SplitPane
            direction={isMobile ? "vertical" : "horizontal"}
            sizes={isMobile ? verticalSizes : horizontalSizes}
            onLayout={isMobile ? setVerticalSizes : setHorizontalSizes}
          >
            <div className="relative h-full w-full overflow-hidden rounded-lg shadow-lg">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm -z-10" />
              <Map dams={data?.dams || []} lastUpdate={data?.lastUpdate} />
            </div>
            <div className="h-full w-full overflow-hidden">
              <DamList
                dams={data?.dams || []}
                isLoading={isLoading}
                error={error as Error}
              />
            </div>
          </SplitPane>
        </div>
      </div>
    </div>
  );
};

export default Index;
