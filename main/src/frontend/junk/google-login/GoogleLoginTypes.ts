/* eslint-disable @typescript-eslint/no-explicit-any */

export type GsiIdInitializeOptions = {
  client_id: string;
  callback: (response: any) => void;
  auto_select?: boolean;
};

export type GsiCodeClientOptions = {
  client_id: string;
  scope: string;
  redirect_uri: string;
  callback?: (response: any) => void;
};

export type GsiId = {
  initialize: (options: GsiIdInitializeOptions) => void;
  prompt: () => void;
  disableAutoSelect: () => void;
};

export type GsiOauth2CodeClient = {
  requestCode: () => void;
};

export type GsiOauth2 = {
  initCodeClient: (options: GsiCodeClientOptions) => GsiOauth2CodeClient;
};

export type Gsi = {
  accounts: {
    id: GsiId;
    oauth2: GsiOauth2;
  };
};
