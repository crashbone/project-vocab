import os from 'os';

export enum OS {
  Mac = 0,
  Windows = 1,
  Linux = 2
}

export function detectOS(): OS {
  const p = os.platform();
  if (p === 'darwin') return OS.Mac;
  if (p === 'win32') return OS.Windows;
  return OS.Linux;
}
const myOs = detectOS();


type SSL = {
  cert: string,
  key: string
}
const osSSL = {
  [OS.Mac]: {
    cert: './main/src/hidden/certs/cert2.pem',
    key: './main/src/hidden/certs/key2.pem'
  },
  [OS.Windows]: {
    cert: './main/src/hidden/certs/cert.pem',
    key: './main/src/hidden/certs/key.pem'
  },
  [OS.Linux]: {
    cert: './main/src/hidden/certs/ssl-cloudflare-cert.pem',
    key: './main/src/hidden/certs/ssl-cloudflare-key.pem'
  }
}
export function getSSL(): SSL {
  return osSSL[myOs];
}

const osFrontendIP = {
  [OS.Mac]: 'localhost',
  [OS.Windows]: 'localhost',
  [OS.Linux]: 'crashbone.com'
}


export function getFrontendIP() {
  return osFrontendIP[myOs];
}

const osBackendIP = {
  [OS.Mac]: 'localhost',
  [OS.Windows]: 'localhost',
  [OS.Linux]: '46.62.152.151'
}


export function getBackendIP() {
  return osBackendIP[myOs];
}