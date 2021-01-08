
import { wCanvas, UMath } from "./wCanvas/wcanvas.js";

import { KarnaughMap } from "./KarnaughMap.js";

let selecting = false;
let selStart = new UMath.Vec2();
let selEnd = new UMath.Vec2();
let currentColor = [ 255, 0, 0 ];

window.km = new KarnaughMap(0, 0, 128);
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

window.addEventListener("load", () => {
    const onResize = canvas => {
        canvas.canvas.width = window.innerWidth - 1;
        canvas.canvas.height = window.innerHeight - 1;

        const gridSize = window.km.getSize().add(1);
        window.km.pos.x = (canvas.canvas.width - gridSize.x * window.km.cellSize) / 2;
        window.km.pos.y = (canvas.canvas.height - gridSize.y * window.km.cellSize) / 2;
    }

    const mainCanvas = new wCanvas({
        "onResize": onResize,
        "onDraw": draw
    });

    const offscreenCanvas = new wCanvas({
        "canvas": document.createElement("canvas")
    });
    window.saveImage = () => {
        // Setting the offscreen canvas's size to the size of the map
        const gridSize = window.km.getSize().add(1);
        offscreenCanvas.canvas.width = gridSize.x * window.km.cellSize;
        offscreenCanvas.canvas.height = gridSize.y * window.km.cellSize;

        // Moving the map to 0,0 and drawing it on the offscreen canvas
        const oldPos = window.km.pos.copy();
        window.km.pos = new UMath.Vec2();
        window.km.draw(offscreenCanvas);
        window.km.pos = oldPos;

        // Creating href and opening it
        const a = document.createElement("a");
        a.href = offscreenCanvas.canvas.toDataURL("image/png");
        a.download = "Karnaugh Map";
        a.click();
    }

    window.changeVarCount = (count) => {
        count = Number(count);

        if (!Number.isNaN(count)) {
            window.km.changeVariables(count);
            onResize(mainCanvas);
            return true;
        }

        return false;
    }
});

window.addEventListener("mousedown", ev => {
    if (ev.ctrlKey) {
        const cellPos = window.km.globalPosToGridCell(ev.x, ev.y);
        window.km.cycleValue(cellPos.x, cellPos.y);
    } else {
        selecting = true;
        selStart.x = ev.x;
        selStart.y = ev.y;
        selEnd.x = ev.x;
        selEnd.y = ev.y;
    }
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
