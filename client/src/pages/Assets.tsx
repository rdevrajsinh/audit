import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Badge component not available, using inline styles
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Server, Globe, Database, Cloud, Network, Edit, Trash2 } from "lucide-react";
import type { Asset } from "@shared/schema";

const assetTypeIcons = {
  web_app: Globe,
  server: Server,
  database: Database,
  cloud_service: Cloud,
  network_device: Network,
};

const assetTypeLabels = {
  web_app: "Web Application",
  server: "Server",
  database: "Database",
  cloud_service: "Cloud Service",
  network_device: "Network Device",
};

export default function Assets() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: "",
    type: "",
    ip: "",
    domain: "",
    port: "",
    tags: [] as string[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: assets, isLoading } = useQuery({
    queryKey: ["/api/assets"],
    enabled: isAuthenticated,
  });

  const createAssetMutation = useMutation({
    mutationFn: (asset: any) => apiRequest("POST", "/api/assets", asset),
    onSuccess: () => {
      toast({
        title: "Asset Created",
        description: "The asset has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      setIsAddDialogOpen(false);
      setNewAsset({
        name: "",
        type: "",
        ip: "",
        domain: "",
        port: "",
        tags: [],
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create asset. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (assetId: number) => apiRequest("DELETE", `/api/assets/${assetId}`),
    onSuccess: () => {
      toast({
        title: "Asset Deleted",
        description: "The asset has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete asset. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleCreateAsset = () => {
    if (!newAsset.name || !newAsset.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createAssetMutation.mutate({
      ...newAsset,
      port: newAsset.port ? parseInt(newAsset.port) : null,
      tags: newAsset.tags.filter(tag => tag.trim()),
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Assets" />
        
        <main className="flex-1 overflow-y-auto bg-muted/50 dark:bg-muted/50">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground dark:text-foreground">
                  Digital Assets
                </h2>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Manage and monitor your organization's digital infrastructure
                </p>
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Asset</DialogTitle>
                    <DialogDescription>
                      Register a new digital asset for monitoring and scanning.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Asset Name *</Label>
                      <Input
                        id="name"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        placeholder="e.g., Main Web Server"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Asset Type *</Label>
                      <Select
                        value={newAsset.type}
                        onValueChange={(value) => setNewAsset({ ...newAsset, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web_app">Web Application</SelectItem>
                          <SelectItem value="server">Server</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="cloud_service">Cloud Service</SelectItem>
                          <SelectItem value="network_device">Network Device</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ip">IP Address</Label>
                        <Input
                          id="ip"
                          value={newAsset.ip}
                          onChange={(e) => setNewAsset({ ...newAsset, ip: e.target.value })}
                          placeholder="192.168.1.100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="port">Port</Label>
                        <Input
                          id="port"
                          type="number"
                          value={newAsset.port}
                          onChange={(e) => setNewAsset({ ...newAsset, port: e.target.value })}
                          placeholder="80"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="domain">Domain/URL</Label>
                      <Input
                        id="domain"
                        value={newAsset.domain}
                        onChange={(e) => setNewAsset({ ...newAsset, domain: e.target.value })}
                        placeholder="example.com"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAsset}
                      disabled={createAssetMutation.isPending}
                    >
                      {createAssetMutation.isPending ? "Adding..." : "Add Asset"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Assets Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : assets && assets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map((asset: Asset) => {
                  const IconComponent = assetTypeIcons[asset.type as keyof typeof assetTypeIcons] || Server;
                  return (
                    <Card key={asset.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{asset.name}</CardTitle>
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                                {assetTypeLabels[asset.type as keyof typeof assetTypeLabels] || asset.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAssetMutation.mutate(asset.id)}
                              disabled={deleteAssetMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {asset.ip && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground dark:text-muted-foreground">IP:</span>
                              <span className="font-mono">{asset.ip}</span>
                            </div>
                          )}
                          {asset.domain && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground dark:text-muted-foreground">Domain:</span>
                              <span className="font-mono">{asset.domain}</span>
                            </div>
                          )}
                          {asset.port && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground dark:text-muted-foreground">Port:</span>
                              <span className="font-mono">{asset.port}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground dark:text-muted-foreground">Status:</span>
                            <Badge variant={asset.status === "active" ? "default" : "secondary"}>
                              {asset.status}
                            </Badge>
                          </div>
                          {asset.tags && asset.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {asset.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Server className="h-16 w-16 text-muted-foreground dark:text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">
                    No Assets Found
                  </h3>
                  <p className="text-muted-foreground dark:text-muted-foreground text-center mb-4">
                    Start by adding your first digital asset to begin monitoring and scanning.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Asset
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
