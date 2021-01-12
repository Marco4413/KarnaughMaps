
import { wCanvas, UMath } from "./wCanvas/wcanvas.js";

import { KarnaughMap } from "./KarnaughMap.js";

const SAVE_BORDER_WIDTH = 10;
const SAVE_STYLE = {
    "outlines": {
        "color": [0, 0, 0],
        "width": 2
    },
    "text": {
        "color": [0, 0, 0],
        "scale": 0.33
    },
    "outValues": {
        "color": [0, 0, 0],
        "scale": 0.5
    },
    "groups": {
        "borderWidth": 4
    }
};

const MAP_STYLE = {
    "outlines": {
        "color": [255, 255, 255],
        "width": 2
    },
    "text": {
        "color": [255, 255, 255],
        "scale": 0.33
    },
    "outValues": {
        "color": [255, 255, 255],
        "scale": 0.5
    },
    "groups": {
        "borderWidth": 4
    }
};

let selecting = false;
let selStart = new UMath.Vec2();
let selEnd = new UMath.Vec2();
let currentColor = [ 255, 0, 0 ];

const GLOBAL_MAP = new KarnaughMap(0, 0, 128);
window.GLOBAL_MAP = GLOBAL_MAP;
GLOBAL_MAP.style = MAP_STYLE;

/**
 * @param {[Number, Number, Number]} color
 */
function selToGroup(color) {

    const gridSelStart = GLOBAL_MAP.globalPosToGridCell(
        Math.min(selStart.x, selEnd.x),
        Math.min(selStart.y, selEnd.y)
    );

    const gridSelEnd = GLOBAL_MAP.globalPosToGridCell(
        Math.max(selStart.x, selEnd.x),
        Math.max(selStart.y, selEnd.y)
    );

    return GLOBAL_MAP.getAsGroup(
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

    GLOBAL_MAP.draw(canvas);

    if (selecting) {
        GLOBAL_MAP.drawGroup(canvas, selToGroup([ 255, 255, 255 ]));
    }
}

window.addEventListener("load", () => {
    const onResize = canvas => {
        canvas.canvas.width = window.innerWidth - 1;
        canvas.canvas.height = window.innerHeight - 1;

        const scale = Math.min(window.innerWidth, window.innerHeight) / 820;
        GLOBAL_MAP.cellSize = scale * 128;

        const gridSize = GLOBAL_MAP.getSize().add(1);
        GLOBAL_MAP.pos.x = (canvas.canvas.width - gridSize.x * GLOBAL_MAP.cellSize) / 2;
        GLOBAL_MAP.pos.y = (canvas.canvas.height - gridSize.y * GLOBAL_MAP.cellSize) / 2;
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
        const gridSize = GLOBAL_MAP.getSize().add(1);
        offscreenCanvas.canvas.width = gridSize.x * GLOBAL_MAP.cellSize + SAVE_BORDER_WIDTH * 2;
        offscreenCanvas.canvas.height = gridSize.y * GLOBAL_MAP.cellSize + SAVE_BORDER_WIDTH * 2;
        offscreenCanvas.clear();

        // Moving the map to 0,0 and drawing it on the offscreen canvas
        const oldPos = GLOBAL_MAP.pos.copy();
        GLOBAL_MAP.pos = UMath.Vec2.add({ "x": 0, "y": 0 }, SAVE_BORDER_WIDTH);
        GLOBAL_MAP.style = SAVE_STYLE;
        GLOBAL_MAP.draw(offscreenCanvas);
        GLOBAL_MAP.style = MAP_STYLE;
        GLOBAL_MAP.pos = oldPos;

        // Creating href and opening it
        const a = document.createElement("a");
        a.href = offscreenCanvas.canvas.toDataURL("image/png");
        a.download = "Karnaugh Map";
        a.click();
    }

    window.changeVariables = (count = GLOBAL_MAP.varCount, variableNames = [ "A", "B", "C", "D" ]) => {
        GLOBAL_MAP.changeVariables(count, variableNames);
        onResize(mainCanvas);
    }

    window.resetGroups = () => {
        GLOBAL_MAP.groups = [];
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
    const kmSize = GLOBAL_MAP.getSize().mul(GLOBAL_MAP.cellSize);
    if (
        ev.x >= GLOBAL_MAP.cellSize + GLOBAL_MAP.pos.x && ev.y >= GLOBAL_MAP.cellSize + GLOBAL_MAP.pos.y &&
        ev.x < GLOBAL_MAP.pos.x + kmSize.x + GLOBAL_MAP.cellSize && ev.y < GLOBAL_MAP.pos.y + kmSize.y + GLOBAL_MAP.cellSize
    ) {
        if (ev.ctrlKey) {
            const cellPos = GLOBAL_MAP.globalPosToGridCell(ev.x, ev.y);
            GLOBAL_MAP.toggleOut(cellPos.x, cellPos.y);
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

        GLOBAL_MAP.groups.push(selToGroup());
        
        currentColor = [
            UMath.map(Math.random(), 0, 1, 25, 230),
            UMath.map(Math.random(), 0, 1, 25, 230),
            UMath.map(Math.random(), 0, 1, 25, 230)
        ];
    }
});
