
import React, { useState } from 'react';
import PriceRuleEditor from '@/components/PriceRuleEditor';
import FileActions from '@/components/FileActions';
import { UpdateStrategies, defaultUpdateStrategies } from '@/utils/priceRules';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

const Index = () => {
  const [data, setData] = useState<UpdateStrategies | null>(null);
  const [jwtToken, setJwtToken] = useState<string>("");

  const handleSave = (updatedData: UpdateStrategies) => {
    setData(updatedData);
    console.log('Saved data:', JSON.stringify(updatedData, null, 2));
  };

  const handleExtractJWT = (token: string) => {
    setJwtToken(token);
    console.log('JWT Token extracted:', token);
  };

  const handleJWTUpdate = (newToken: string) => {
    setJwtToken(newToken);
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
          </motion.div>
        </header>

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-apple p-6 sm:p-8"
          >
            <PriceRuleEditor 
              initialData={data} 
              onSave={handleSave} 
              jwtToken={jwtToken}
              onJWTUpdate={handleJWTUpdate}
            />
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
