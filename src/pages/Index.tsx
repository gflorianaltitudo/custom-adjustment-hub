
import React, { useState } from 'react';
import PriceRuleEditor from '@/components/PriceRuleEditor';
import FileActions from '@/components/FileActions';
import { UpdateStrategies, defaultUpdateStrategies } from '@/utils/priceRules';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Edit, Check } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [data, setData] = useState<UpdateStrategies | null>(null);
  const [jwtToken, setJwtToken] = useState<string>("");
  const [isEditingJWT, setIsEditingJWT] = useState<boolean>(false);
  const [tempJWT, setTempJWT] = useState<string>("");

  const handleSave = (updatedData: UpdateStrategies) => {
    setData(updatedData);
    console.log('Saved data:', JSON.stringify(updatedData, null, 2));
  };

  const handleExtractJWT = (token: string) => {
    setJwtToken(token);
    setTempJWT(token);
    console.log('JWT Token extracted:', token);
  };

  const handleEditJWT = () => {
    setIsEditingJWT(true);
    setTempJWT(jwtToken);
  };

  const handleSaveJWT = () => {
    setJwtToken(tempJWT);
    setIsEditingJWT(false);
    toast.success('JWT Token updated');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container py-12 px-4 sm:px-6">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block px-3 py-1 mb-4 text-xs font-medium text-primary/80 bg-primary/10 rounded-full">
              Price Management
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
              Custom Adjustment Rules
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Configure how prices are adjusted based on market conditions and specific price ranges.
            </p>
            
            <div className="mt-6 flex justify-center">
              <FileActions 
                data={data || defaultUpdateStrategies} 
                onDataLoad={setData} 
                onExtractJWT={handleExtractJWT}
              />
            </div>

            <div className="mt-6 max-w-xl mx-auto">
              <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow-sm p-4 flex flex-col">
                <Label htmlFor="jwt-token" className="text-sm font-medium text-left mb-2">
                  JWT Token for API Authentication
                </Label>
                
                {isEditingJWT ? (
                  <div className="flex flex-col gap-2">
                    <Input
                      id="jwt-token"
                      value={tempJWT}
                      onChange={(e) => setTempJWT(e.target.value)}
                      className="font-mono text-xs"
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setIsEditingJWT(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSaveJWT}
                        className="flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 rounded border p-2 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-mono text-left">
                      {jwtToken || "No JWT token set"}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleEditJWT}
                      className="flex-shrink-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </header>

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-apple p-6 sm:p-8"
          >
            <PriceRuleEditor initialData={data} onSave={handleSave} />
          </motion.div>
        )}

        {!data && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground">
              Please open an existing configuration file or create a new one to start editing.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
