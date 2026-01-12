'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

interface InfoBoxProps {
  title: string;
  description: string;
  tutorial?: string[];
  defaultOpen?: boolean;
}

export function InfoBox({ title, description, tutorial, defaultOpen = false }: InfoBoxProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="bg-green-50 border-green-200 mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Lightbulb className="h-4 w-4 text-green-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-green-800 text-sm">{title}</h4>
              {tutorial && tutorial.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-green-700 hover:text-green-800 h-8 px-2"
                >
                  {isOpen ? (
                    <><ChevronUp className="h-4 w-4 mr-1" /> Fechar</>
                  ) : (
                    <><ChevronDown className="h-4 w-4 mr-1" /> Como usar</>
                  )}
                </Button>
              )}
            </div>
            <p className="text-sm text-green-700 mt-1">{description}</p>
            
            {isOpen && tutorial && tutorial.length > 0 && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs font-medium text-green-800 mb-2 flex items-center gap-1">
                  <Info className="h-3 w-3" /> Mini Tutorial:
                </p>
                <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                  {tutorial.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
