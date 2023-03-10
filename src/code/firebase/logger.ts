import { GetWasabeeServer } from "../config";
import { getJWT } from "../auth";
import { constants } from "../static";

import { port } from "./init";

interface FirebaseMessage {
  id: string;
  method: string;
  action: string;
  error: string;
  app_name: string;
  app_version: string;
  server: string;
  jwt: string;
}

export function postToFirebase(message: Partial<FirebaseMessage>) {
  // prevent analytics data from being sent if not enabled by the user: GPDR
  if (
    message.id === "analytics" &&
    localStorage[constants.SEND_ANALYTICS_KEY] !== "true"
  )
    return;
  // prevent any firebase (sw) initialisation if disable except for analytics
  if (
    message.id !== "analytics" &&
    localStorage[constants.FIREBASE_DISABLE] === "true"
  )
    return;

  if (message.id == "wasabeeLogin") {
    message.server = GetWasabeeServer();
    message.jwt = getJWT();
  }

  message.app_name = "Wasabee-IITC";
  message.app_version = window.plugin.wasabee.info.version;

  port.postMessage(message);
}
