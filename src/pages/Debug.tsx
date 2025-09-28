import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function Debug() {
  const [tests, setTests] = useState([
    { name: 'Main Site', url: 'https://harvestia.vercel.app', status: 'loading' },
    { name: 'Mini Games Page', url: 'https://harvestia.vercel.app/mini-games', status: 'loading' },
    { name: 'Games Directory', url: 'https://harvestia.vercel.app/games/', status: 'loading' },
    { name: 'Solar Storm Game', url: 'https://harvestia.vercel.app/games/WebGL%20Build%20Solar%20Storm%20Sirvival/index.html', status: 'loading' },
    { name: 'Smart Farming Game', url: 'https://harvestia.vercel.app/games/WenGL%20Build%20Smart%20Farming%20Sim/index.html', status: 'loading' },
    { name: 'Solar Storm Framework JS', url: 'https://harvestia.vercel.app/games/WebGL%20Build%20Solar%20Storm%20Sirvival/Build/WebGL%20Build.framework.js.br', status: 'loading' },
    { name: 'Solar Storm Data File', url: 'https://harvestia.vercel.app/games/WebGL%20Build%20Solar%20Storm%20Sirvival/Build/WebGL%20Build.data.br', status: 'loading' },
    { name: 'Solar Storm WASM', url: 'https://harvestia.vercel.app/games/WebGL%20Build%20Solar%20Storm%20Sirvival/Build/WebGL%20Build.wasm.br', status: 'loading' }
  ]);

  const testUrl = async (url: string) => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // To avoid CORS issues
      });
      return 'success';
    } catch (error) {
      console.error(`Error testing ${url}:`, error);
      try {
        // Fallback test with GET request
        const getResponse = await fetch(url, { mode: 'no-cors' });
        return 'success';
      } catch (getError) {
        return 'error';
      }
    }
  };

  const testWithDetails = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      return {
        status: response.status,
        headers,
        result: response.ok ? 'success' : 'error'
      };
    } catch (error) {
      return {
        status: 0,
        headers: {},
        result: 'error',
        error: error.message
      };
    }
  };

  const runTests = async () => {
    const updatedTests = [...tests];
    
    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'loading';
      setTests([...updatedTests]);
      
      const status = await testUrl(updatedTests[i].url);
      updatedTests[i].status = status;
      setTests([...updatedTests]);
    }
  };

  useEffect(() => {
    runTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'loading':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">✓ OK</Badge>;
      case 'error':
        return <Badge variant="destructive">✗ Failed</Badge>;
      case 'loading':
        return <Badge variant="secondary">⟳ Testing...</Badge>;
      default:
        return <Badge variant="outline">? Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Site Status Debug
            <Button onClick={runTests} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-test
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-muted-foreground">{test.url}</div>
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Current Time:</strong> {new Date().toISOString()}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Location:</strong> {window.location.href}</p>
              <p><strong>Build Mode:</strong> {import.meta.env.MODE}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Quick Tests:</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('https://harvestia.vercel.app/mini-games', '_blank')}
              >
                Test Mini Games Page
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('https://harvestia.vercel.app/games/WebGL%20Build%20Solar%20Storm%20Sirvival/index.html', '_blank')}
              >
                Test Solar Storm Direct Link
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('https://harvestia.vercel.app/games/WenGL%20Build%20Smart%20Farming%20Sim/index.html', '_blank')}
              >
                Test Smart Farming Direct Link
              </Button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Unity WebGL Files Check:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Framework JS:</strong> Should have Content-Type: application/javascript</p>
              <p><strong>Data Files:</strong> Should have Content-Type: application/octet-stream</p>
              <p><strong>WASM Files:</strong> Should have Content-Type: application/wasm</p>
              <p><strong>Compressed Files:</strong> Should have Content-Encoding: br</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={async () => {
                const results = await testWithDetails('https://harvestia.vercel.app/games/WebGL%20Build%20Solar%20Storm%20Sirvival/Build/WebGL%20Build.framework.js.br');
                alert(JSON.stringify(results, null, 2));
              }}
            >
              Check Framework JS Headers
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}