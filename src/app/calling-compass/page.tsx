import { CallingCompassPageController } from "../_calling/CallingCompassPageController";
import { createCallingCompassViewModel } from "../../features/calling/application/calling-compass-service";

export default function CallingCompassPage() {
  return <CallingCompassPageController initialViewModel={createCallingCompassViewModel()} />;
}
