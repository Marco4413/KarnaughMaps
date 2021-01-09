
import { wCanvas, UMath } from "./wCanvas/wcanvas.js";

import { KarnaughMap } from "./KarnaughMap.js";

const SAVE_BORDER_WIDTH = 10;
const SAVE_COLORS = {
    "fill": [0, 0, 0],
    "stroke": [0, 0, 0]
};

let selecting = false;
let selStart = new UMath.Vec2();
let selEnd = new UMath.Vec2();
let currentColor = [ 255, 0, 0 ];

window.km = new KarnaughMap(0, 0, 128);

/**
 * @param {[Number, Number, Number]} color
 */
function selToGroup(color) {

    const gridSelStart = window.km.globalPosToGridCell(
        Math.min(selStart.x, selEnd.x),
        Math.min(selStart.y, selEnd.y)
    );

    const gridSelEnd = window.km.globalPosToGridCell(
        Math.max(selStart.x, selEnd.x),
        Math.max(selStart.y, selEnd.y)
    );

    return window.km.getAsGroup(
        gridSelStart.x, gridSelStart.y, gridSelEnd.x, gridSelEnd.y,
        color === undefined ? currentColor.slice() : color.slice()
    );
    
}

/**
 * @param {wCanvas} canvas
 * @param {Number} deltaTime
 */
function draw(canvas, deltaTime) {
    canvas.clear();

    window.km.draw(canvas);

    if (selecting) {
        window.km.drawGroup(canvas, selToGroup([ 255, 255, 255 ]));
    }
}

window.addEventListener("load", () => {
    const onResize = canvas => {
        canvas.canvas.width = window.innerWidth - 1;
        canvas.canvas.height = window.innerHeight - 1;

        const scale = Math.min(window.innerWidth, window.innerHeight) / 820;
        window.km.cellSize = scale * 128;

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
        offscreenCanvas.canvas.width = gridSize.x * window.km.cellSize + SAVE_BORDER_WIDTH * 2;
        offscreenCanvas.canvas.height = gridSize.y * window.km.cellSize + SAVE_BORDER_WIDTH * 2;
        offscreenCanvas.clear();

        // Moving the map to 0,0 and drawing it on the offscreen canvas
        const oldPos = window.km.pos.copy();
        const oldTheme = window.km.colors;
        window.km.pos = UMath.Vec2.add({ "x": 0, "y": 0 }, SAVE_BORDER_WIDTH);
        window.km.colors = SAVE_COLORS;
        window.km.draw(offscreenCanvas);
        window.km.colors = oldTheme;
        window.km.pos = oldPos;

        // Creating href and opening it
        const a = document.createElement("a");
        a.href = offscreenCanvas.canvas.toDataURL("image/png");
        a.download = "Karnaugh Map";
        a.click();
    }

    window.changeVariables = (count, variableNames = [ "A", "B", "C", "D" ]) => {
        if (count === undefined) {
            count = Math.log2(window.km.firstRow.length - 1) + Math.log2(window.km.firstCol.length - 1);
        }

        window.km.changeVariables(count, variableNames);
        onResize(mainCanvas);
    }

    window.resetGroups = () => {
        window.km.groups = [];
    }

    window.updateVariables = () => {
        const varCount = document.getElementById("varCount");
        const varNames = document.getElementById("varNames");

        let count = Number(varCount.value);
        if (Number.isNaN(count)) {
            varCount.value = "";
            count = undefined;
        }

        const names = varNames.value.replace(/\s+/g, "").split(",");
        window.changeVariables(count, names.join("").length > 0 ? names : undefined);
    }
});

window.addEventListener("mousedown", ev => {
    const kmSize = window.km.getSize().mul(window.km.cellSize);
    if (
        ev.x >= window.km.cellSize + window.km.pos.x && ev.y >= window.km.cellSize + window.km.pos.y &&
        ev.x < window.km.pos.x + kmSize.x + window.km.cellSize && ev.y < window.km.pos.y + kmSize.y + window.km.cellSize
    ) {
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

        window.km.groups.push(selToGroup());
        
        currentColor = [
            UMath.map(Math.random(), 0, 1, 25, 230),
            UMath.map(Math.random(), 0, 1, 25, 230),
            UMath.map(Math.random(), 0, 1, 25, 230)
        ];
    }
});
