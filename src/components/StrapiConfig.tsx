
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Settings } from "lucide-react";

interface StrapiConfigProps {
  onConfigChange: (config: StrapiConfig) => void;
}

export interface StrapiConfig {
  apiUrl: string;
  apiToken: string;
}

const StrapiConfig = ({ onConfigChange }: StrapiConfigProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<StrapiConfig>({
    apiUrl: '',
    apiToken: ''
  });

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('strapiConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      onConfigChange(parsedConfig);
    }
  }, [onConfigChange]);

  const handleConfigUpdate = (field: keyof StrapiConfig, value: string) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onConfigChange(updatedConfig);
    
    // Save to localStorage
    localStorage.setItem('strapiConfig', JSON.stringify(updatedConfig));
  };

  const isConfigValid = config.apiUrl && config.apiToken;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Strapi Configuration</span>
            {isConfigValid && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Configured
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">Strapi API URL</Label>
              <Input
                id="apiUrl"
                type="url"
                placeholder="https://your-strapi-api.com"
                value={config.apiUrl}
                onChange={(e) => handleConfigUpdate('apiUrl', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Your Strapi API token"
                value={config.apiToken}
                onChange={(e) => handleConfigUpdate('apiToken', e.target.value)}
              />
            </div>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Get your API token from Strapi Admin → Settings → API Tokens</p>
              <p>• Make sure the token has "Upload" permissions</p>
              <p>• Configuration is saved locally in your browser</p>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default StrapiConfig;
