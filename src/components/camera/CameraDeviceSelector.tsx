import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video } from "lucide-react";

interface CameraDevice {
  deviceId: string;
  label: string;
}

interface CameraDeviceSelectorProps {
  devices: CameraDevice[];
  selectedDeviceId: string;
  onDeviceChange: (deviceId: string) => void;
  show: boolean;
}

export const CameraDeviceSelector = ({ 
  devices, 
  selectedDeviceId, 
  onDeviceChange, 
  show 
}: CameraDeviceSelectorProps) => {
  if (!show || devices.length <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Video className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedDeviceId} onValueChange={onDeviceChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select camera" />
        </SelectTrigger>
        <SelectContent>
          {devices.map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};