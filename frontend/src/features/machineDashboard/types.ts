export interface CFXData {
  MessageName: string;
  Version: string;
  TimeStamp: string;
  UniqueID: string;
  Source: string;
  Target: string | null;
  RequestID: string | null;
  MessageBody: Record<string, any>;
}
