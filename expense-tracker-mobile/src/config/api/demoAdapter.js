import { handleDemoRequest } from "@/infrastructure/demo/handleDemoRequest";

export function createDemoAdapter() {
  return (config) => handleDemoRequest(config);
}
