
import { wCanvas, UMath } from "./wCanvas/wcanvas.js";

import { KarnaughMap } from "./KarnaughMap.js";

let selecting = false;
let selStart = new UMath.Vec2();
let selEnd = new UMath.Vec2();
let currentColor = [ 255, 0, 0 ];

window.km = new KarnaughMap(200, 200, 128);
window.km.addGroup(0, 0, 0, 0, currentColor.slice());

/**
 * @param {wCanvas} canvas
 * @param {Number} deltaTime
 */
function draw(canvas, deltaTime) {
    canvas.clear();

    window.km.draw(canvas);

    if (selecting) {
        const gridSelStart = window.km.globalPosToGridCell(selStart.x, selStart.y);
        const gridSelEnd = window.km.globalPosToGridCell(selEnd.x, selEnd.y);

        window.km.groups[window.km.groups.length - 1] = window.km.getAsGroup(gridSelStart.x, gridSelStart.y, gridSelEnd.x, gridSelEnd.y, currentColor.slice());
    }
}

window.addEventListener("load", () => new wCanvas({ "onDraw": draw }));

window.addEventListener("mousedown", ev => {
    selecting = true;
    selStart.x = ev.x;
    selStart.y = ev.y;
    selEnd.x = ev.x;
    selEnd.y = ev.y;
});

window.addEventListener("mouseup", () => selecting = false);

window.addEventListener("mousemove", ev => {
    if (selecting) {
        selEnd.x = ev.x;
        selEnd.y = ev.y;
    }
});

window.addEventListener("keydown", ev => {
    if (ev.key === " ") {
        selecting = false;

        const gridSelStart = window.km.globalPosToGridCell(selStart.x, selStart.y);
        const gridSelEnd = window.km.globalPosToGridCell(selEnd.x, selEnd.y);
        window.km.addGroup(gridSelStart.x, gridSelStart.y, gridSelEnd.x, gridSelEnd.y, currentColor.slice());
        
        currentColor = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
    }
});
