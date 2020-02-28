import WasabeePortal from "./portal";
import ConfirmDialog from "./dialogs/confirmDialog";
import { targetPromise, GetWasabeeServer } from "./server";

export default class WasabeeAgent {
  constructor() {
    this.id = null;
    this.name = null;
    this.lat = 0;
    this.lng = 0;
    this.date = null;
    this.pic = null;
    this.cansendto = false;
    this.Vverified = false;
    this.blacklisted = false;
    this.rocks = false;
    this.squad = null;
    this.state = null;
  }

  static create(obj) {
    if (typeof obj == "string") {
      obj = JSON.parse(obj);
    }
    const a = new WasabeeAgent();
    a.id = obj.id;
    a.name = obj.name;
    a.lat = obj.lat;
    a.lng = obj.lng;
    a.date = obj.date;
    a.pic = obj.pic;
    a.cansendto = obj.cansendto;
    a.Vverified = obj.Vverified;
    a.blacklisted = obj.blacklisted;
    a.rocks = obj.rocks;
    a.squad = obj.squad;
    a.state = obj.state;

    // push the new data into the agent cache
    window.plugin.wasabee._agentCache.set(a.id, a);
    return a;
  }

  get latLng() {
    return new L.LatLng(this.lat, this.lng);
  }

  formatDisplay() {
    const server = GetWasabeeServer();
    const display = L.DomUtil.create("a", "wasabee-agent-label");
    if (this.Vverified || this.rocks) {
      L.DomUtil.addClass(display, "enl");
    }
    if (this.blacklisted) {
      L.DomUtil.addClass(display, "res");
    }
    display.href = `${server}/api/v1/agent/${this.id}?json=n`;
    display.target = "_new";
    L.DomEvent.on(display, "click", () => {
      window.open(display.href, this.id);
    });
    display.textContent = this.name;
    return display;
  }

  getPopup() {
    const content = L.DomUtil.create("div", "temp-op-dialog");
    const title = L.DomUtil.create("div", "desc", content);
    title.id = this.id;
    title.innerHTML = this.formatDisplay().outerHTML + this.timeSinceformat();
    const sendTarget = L.DomUtil.create("a", "temp-op-dialog", content);
    sendTarget.textContent = "Send Target";
    L.DomEvent.on(sendTarget, "click", () => {
      const selectedPortal = WasabeePortal.getSelected();
      if (!selectedPortal) {
        alert("Select a portal to send");
        return;
      }

      const f = selectedPortal.name;
      const name = this.name;
      const d = new ConfirmDialog();
      d.setup(
        "Send Target",
        `Do you want to send ${f} target to ${name}?`,
        () => {
          targetPromise(this, selectedPortal).then(
            function() {
              alert("target sent");
            },
            function(reject) {
              console.log(reject);
            }
          );
        }
      );
      d.enable();
    });
    return content;
  }

  timeSinceformat() {
    if (!this.date) return "";
    const date = new Date(this.date);
    if (date == 0) return "";

    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000 / 2592000 / 86400);

    if (interval > 1) return ` (ages ago)`;
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return ` (${interval} hours ago)`;
    interval = Math.floor(seconds / 60);
    if (interval > 1) return ` (${interval} minutes ago)`;
    interval = Math.floor(seconds);
    return ` (${interval} seconds ago)`;
  }
}
