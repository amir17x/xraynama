import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface SpoilerAlertProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * کامپوننت نمایش اسپویلر
 * این کامپوننت متن را به صورت تار نمایش می‌دهد و فقط در صورت کلیک کاربر نمایان می‌شود
 */
const SpoilerAlert: React.FC<SpoilerAlertProps> = ({ 
  children, 
  title = 'این متن حاوی اسپویلر است!' 
}) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <Card className="my-4 border border-yellow-500 dark:bg-background">
      <CardContent className="p-4">
        {!revealed ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center text-yellow-500 font-semibold">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{title}</span>
            </div>
            <Button
              variant="outline"
              className="border-yellow-500 hover:bg-yellow-500/10 text-yellow-500 hover:text-yellow-600"
              onClick={() => setRevealed(true)}
            >
              نمایش متن
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground flex justify-between items-center">
              <span>اسپویلر</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => setRevealed(false)}
              >
                پنهان کردن
              </Button>
            </div>
            <div>{children}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpoilerAlert;