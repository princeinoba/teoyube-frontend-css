import { createCallingCompassClientContext } from "@/features/calling/application/calling-compass-service";
import CompassExperienceClient from "./CompassExperienceClient";

export default function CompassExperience() {
  return <CompassExperienceClient initialContext={createCallingCompassClientContext("calling purpose")} />;
}
