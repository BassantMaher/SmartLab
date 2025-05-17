import { AlertTriangle, Sun, Thermometer, AlarmSmoke } from "lucide-react";

// Function to get icon component based on name
export const getMetricIcon = (iconName: string) => {
  switch (iconName) {
    case "Thermometer":
      return Thermometer;
    case "AlarmSmoke":
      return AlarmSmoke;
    case "Sun":
      return Sun;

    case "AlertTriangle":
      return AlertTriangle;
    default:
      return AlertTriangle;
  }
};
