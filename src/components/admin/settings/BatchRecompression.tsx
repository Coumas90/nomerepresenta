import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBatchRecompression } from "@/hooks/useBatchRecompression";
import { formatFileSize } from "@/lib/imageCompression";
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const BatchRecompression = () => {
  const { isRunning, progress, startRecompression } = useBatchRecompression();

  const progressPercent = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100) 
    : 0;

  const totalSavings = progress.savings.originalTotal - progress.savings.compressedTotal;
  const savingsPercent = progress.savings.originalTotal > 0
    ? ((totalSavings / progress.savings.originalTotal) * 100).toFixed(1)
    : '0';

  const isComplete = !isRunning && progress.completed > 0 && progress.completed === progress.total;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className={`h-5 w-5 ${isRunning ? 'animate-spin' : ''}`} />
          Batch Re-compression
        </CardTitle>
        <CardDescription>
          Re-compress all existing images with current settings. This will download each image, 
          compress it with your settings, and re-upload it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            This process may take several minutes depending on the number of images. 
            Do not close this page while re-compression is in progress.
          </AlertDescription>
        </Alert>

        {!isRunning && !isComplete && (
          <Button onClick={startRecompression} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Start Re-compression
          </Button>
        )}

        {isRunning && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress: {progress.completed} / {progress.total}</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            {progress.current && (
              <p className="text-sm text-muted-foreground truncate">
                Processing: {progress.current}
              </p>
            )}
          </div>
        )}

        {isComplete && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Re-compression complete!</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Images processed</p>
                <p className="text-2xl font-bold">{progress.completed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total savings</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatFileSize(totalSavings)} ({savingsPercent}%)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Original size</p>
                <p className="text-lg">{formatFileSize(progress.savings.originalTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New size</p>
                <p className="text-lg">{formatFileSize(progress.savings.compressedTotal)}</p>
              </div>
            </div>

            {progress.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Some images failed</AlertTitle>
                <AlertDescription>
                  {progress.errors.length} image(s) could not be re-compressed.
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={startRecompression} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
