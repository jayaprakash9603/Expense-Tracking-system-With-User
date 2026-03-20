import { handleDemoRequest } from "@/infrastructure/demo/runtime/handleDemoRequest";

export function createDemoAdapter() {
  return (config) => handleDemoRequest(config);
}
