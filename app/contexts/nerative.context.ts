import { createContext } from "react";
import { IdentifiedCloudTrailLogs } from "~/routes/logs.interface";

export const NerativeContext = createContext({
    items: [] as IdentifiedCloudTrailLogs[],
    setItems: (items: IdentifiedCloudTrailLogs[]) => {},
    });

export default NerativeContext;

export interface IdentifiedCloudTrailLogsCtx {
    items: IdentifiedCloudTrailLogs[];
    setItems: (items: IdentifiedCloudTrailLogs[]) => void;
}