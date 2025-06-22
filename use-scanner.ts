import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScanResult, ScanRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useScanner() {
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const { toast } = useToast();

  // Fetch scan history
  const { data: scanHistory = [] } = useQuery<ScanResult[]>({
    queryKey: ["/api/scans"],
    staleTime: 30000, // 30 seconds
  });

  // Poll for current scan updates
  const { data: updatedScan } = useQuery<ScanResult>({
    queryKey: ["/api/scan", currentScan?.id],
    enabled: !!currentScan && currentScan.status === "running",
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Update current scan when poll returns new data
  useEffect(() => {
    if (updatedScan) {
      setCurrentScan(updatedScan);
      
      if (updatedScan.status === "completed") {
        toast({
          title: "Scan completed",
          description: `${updatedScan.scanType} scan for ${updatedScan.target} finished successfully.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      } else if (updatedScan.status === "failed") {
        toast({
          title: "Scan failed",
          description: `${updatedScan.scanType} scan for ${updatedScan.target} failed.`,
          variant: "destructive",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      }
    }
  }, [updatedScan, toast]);

  // Start scan mutation
  const scanMutation = useMutation({
    mutationFn: async (request: ScanRequest) => {
      const response = await apiRequest("POST", "/api/scan", request);
      return response.json();
    },
    onSuccess: (data: ScanResult) => {
      setCurrentScan(data);
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      toast({
        title: "Scan started",
        description: `${data.scanType} scan for ${data.target} has begun.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Scan failed to start",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const performScan = async (scanType: string, target: string, options?: any) => {
    const request: ScanRequest = {
      scanType: scanType as any,
      target,
      options,
    };
    
    await scanMutation.mutateAsync(request);
  };

  return {
    performScan,
    currentScan,
    scanHistory,
    isLoading: scanMutation.isPending,
  };
}
