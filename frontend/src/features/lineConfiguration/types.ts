export type UUID = string;

export type Machine = {
  id: UUID;
  name: string;
  type: string;
  imageUrl?: string;
  x: number;
  y: number;
  cfx: { host: string; port: number; topic: string };
  params: Record<string, string>;
};

export type Connection = {
  fromId: UUID;
  toId: UUID;
};

export type LineConfig = {
  id: UUID;
  name: string;
  machines: Machine[];
  connections: Connection[];
};
