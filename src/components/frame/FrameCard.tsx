import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FrameAsset {
  id: string;
  name: string;
  mode: 'portrait' | 'landscape';
  thumbnail: string;
}

interface FrameCardProps {
  frame: FrameAsset;
  onSelect: (frameId: string) => void;
}

export const FrameCard = ({ frame, onSelect }: FrameCardProps) => {
  return (
    <Card variant="elevated" className="overflow-hidden group hover:shadow-lg transition-shadow">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg">{frame.name}</CardTitle>
        <CardDescription className="text-sm">
          Perfect for {frame.mode} oriented photos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mobile-first: stack on small screens, maintain aspect on larger */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center group-hover:bg-muted/80 transition-colors">
          <img
            src={frame.thumbnail}
            alt={`${frame.name} preview`}
            className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
          />
        </div>
        <Button 
          variant="gradient" 
          size="lg" 
          className="w-full"
          onClick={() => onSelect(frame.id)}
        >
          Use This Frame
        </Button>
      </CardContent>
    </Card>
  );
};