import type { WasabeeOp, WasabeePortal } from "../../model";
import type { QuickDrawMode } from "./mode";
import wX from "../../wX";
import { greatCircleArcIntersectByLatLngs } from "../../geo";
import type { WLatLng } from "../../model/portal";

export class Burst implements QuickDrawMode {
  name: "splitter";

  anchor: WasabeePortal;
  op: WasabeeOp;

  constructor(op: WasabeeOp) {
    this.anchor = null;
    this.op = op;
  }

  getName() {
    return wX("toolbar.quick_draw.mode.burst");
  }

  getCandidates(op: WasabeeOp, latlng: WLatLng) {
    const candidates: WasabeePortal[] = [];
    if (op.anchors.length == 2) {
      candidates.push(op.getPortal(op.anchors[0]));
      candidates.push(op.getPortal(op.anchors[1]));
    } else {
      for (const a of op.anchors) {
        const to = op.getPortal(a);
        if (
          op.links.every(
            (l) =>
              !greatCircleArcIntersectByLatLngs(
                [latlng, to.latLng],
                l.getLatLngs(op)
              )
          )
        )
          candidates.push(to);
      }
    }
    return candidates;
  }

  onPortalClick(
    op: WasabeeOp,
    portal: WasabeePortal,
    options: { color?: string }
  ) {
    if (op.anchors.length == 0) {
      if (this.anchor) {
        op.addLink(portal, this.anchor, {
          order: op.nextOrder,
          color: options.color,
        });
        this.anchor = null;
      } else {
        this.anchor = portal;
      }
    } else {
      // sort candidate by decreasing distances
      const candidates = this.getCandidates(op, portal.latLng).map(
        (p) => [window.map.distance(portal.latLng, p.latLng), p] as const
      );
      candidates.sort((a, b) => b[0] - a[0]);
      op.startBatchMode();
      for (const [, to] of candidates) {
        op.addLink(portal, to, {
          order: op.nextOrder,
          color: options.color,
        });
      }
      op.endBatchMode();
    }
  }

  getGuides(latlng: L.LatLng) {
    if (this.op.anchors.length == 0 && this.anchor) {
      return [[latlng, this.anchor.latLng]];
    }
    const candidates = this.getCandidates(this.op, latlng);
    return candidates.map((p) => [latlng, p.latLng]);
  }

  getTooltip() {
    return wX("toolbar.quick_draw.tooltip.burst.portal");
  }
}
