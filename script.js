
import { wCanvas, UMath, Color } from "./wCanvas/wcanvas.js";

import { KarnaughMap } from "./KarnaughMap.js";
import { MapStyle } from "./MapStyle.js";

const SAVE_CELL_SIZE = 128;
const SAVE_BORDER_WIDTH = 10;
const SAVE_STYLE = new MapStyle([0, 0, 0], 2, [0, 0, 0], 0.33, [0, 0, 0], 0.5, 4);

const MAP_STYLE = new MapStyle();

let selecting = false;
let selStart = new UMath.Vec2();
let selEnd = new UMath.Vec2();
let currentColor = new Color("#f00");
let touchIdentifier = undefined;

const DEFAULT_SELECTION_COLOR = new Color("#fff");
let useCurrentColorForSelection = false;

const GLOBAL_MAP = new KarnaughMap(0, 0, 128);
window.GLOBAL_MAP = GLOBAL_MAP;
GLOBAL_MAP.style = MAP_STYLE;

let groupColorSelector = null;

/**
 * @param {Number} x
 * @param {Number} y
 */
const startSelection = (x, y) => {
    if (!selecting) {
        selecting = true;
        selStart.x = x;
        selStart.y = y;
        selEnd.x = x;
        selEnd.y = y;

        return true;
    }

    return false;
}
window.startSelection = startSelection;

/**
 * @param {Number} x
 * @param {Number} y
 */
const updateSelection = (x, y) => {
    if (selecting) {
        selEnd.x = x;
        selEnd.y = y;

        return true;
    }

    return false;
}
window.updateSelection = updateSelection;

const endSelection = () => {
    selecting = false;
    return true;
}
window.endSelection = endSelection;

const confirmSelection = () => {
    GLOBAL_MAP.groups.push(selToGroup());
    
    window.changeColor([
        Math.round(UMath.map(Math.random(), 0, 1, 25, 230)),
        Math.round(UMath.map(Math.random(), 0, 1, 25, 230)),
        Math.round(UMath.map(Math.random(), 0, 1, 25, 230))
    ]);
}
window.confirmSelection = confirmSelection;

/**
 * @param {UMath.Vec2} pos
 * @returns {Boolean}
 */
function isInsideMap(pos) {
    const kmSize = GLOBAL_MAP.getSize().mul(GLOBAL_MAP.cellSize);
    return pos.x >= GLOBAL_MAP.cellSize + GLOBAL_MAP.pos.x && pos.y >= GLOBAL_MAP.cellSize + GLOBAL_MAP.pos.y &&
        pos.x < GLOBAL_MAP.pos.x + kmSize.x + GLOBAL_MAP.cellSize && pos.y < GLOBAL_MAP.pos.y + kmSize.y + GLOBAL_MAP.cellSize;
}

/**
 * @param {Color} color
 * @returns {import("./KarnaughMap.js").Group}
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
        gridSelStart.x, gridSelStart.y, gridSelEnd.x, gridSelEnd.y, color === undefined ? currentColor : color
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
        GLOBAL_MAP.drawGroup(canvas, selToGroup(useCurrentColorForSelection ? currentColor : DEFAULT_SELECTION_COLOR));
    }
}

/**
 * @param {HTMLButtonElement} btn
 * @param {Boolean} sync
 */
window.toggleSelectionColor = (btn, sync) => {
    if (!sync) { useCurrentColorForSelection = !useCurrentColorForSelection; }
    btn.style.color = useCurrentColorForSelection ? "#0f0" : "#f00";
}

window.addEventListener("load", () => {
    { // Selection Color
        const selColor = document.getElementById("selColor");
        if (selColor !== null) {
            window.toggleSelectionColor(selColor, true);
        }
    }

    groupColorSelector = document.getElementById("groupColor");

    const onResize = canvas => {
        canvas.element.width = window.innerWidth - 1;
        canvas.element.height = window.innerHeight - 1;

        const scale = Math.min(window.innerWidth, window.innerHeight) / 820;
        GLOBAL_MAP.cellSize = scale * 128;

        const gridSize = GLOBAL_MAP.getSize().add(1);
        GLOBAL_MAP.pos.x = (canvas.element.width - gridSize.x * GLOBAL_MAP.cellSize) / 2;
        GLOBAL_MAP.pos.y = (canvas.element.height - gridSize.y * GLOBAL_MAP.cellSize) / 2;
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
        offscreencanvas.element.width = gridSize.x * SAVE_CELL_SIZE + SAVE_BORDER_WIDTH * 2;
        offscreencanvas.element.height = gridSize.y * SAVE_CELL_SIZE + SAVE_BORDER_WIDTH * 2;
        offscreenCanvas.clear();

        // Moving the map to 0,0 and drawing it on the offscreen canvas
        GLOBAL_MAP.draw(offscreenCanvas, { "pos": new UMath.Vec2(0, 0), "cellSize": SAVE_CELL_SIZE, "style": SAVE_STYLE });

        // Creating href and opening it
        const a = document.createElement("a");
        a.href = offscreencanvas.element.toDataURL("image/png");
        a.download = "Karnaugh Map";
        a.click();
    }

    window.saveMap = () => {
        const a = document.createElement("a");
        a.href = "data:application/json," + encodeURI(GLOBAL_MAP.serialize());
        a.download = "Karnaugh Map";
        a.click();
    }

    window.loadMap = () => {
        const loader = document.createElement("input");
        loader.type = "file";
        loader.accept = ".txt,application/json";
        loader.multiple = false;

        loader.oninput = () => {
            const file = loader.files.item(0);
            if (file !== null) {
                file.text().then(
                    text => {
                        GLOBAL_MAP.deserialize(text);
                        onResize(mainCanvas);
                    }
                );
            }
        }

        loader.click();
        return true;
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

    /**
     * @param {Color|String|[Number, Number, Number]} color
     * @param {Boolean} isHex
     */
    window.changeColor = (color) => {
        currentColor = new Color(color);

        if (groupColorSelector !== null) {
            groupColorSelector.value = currentColor.toHex(false);
        }
    }
    window.changeColor(currentColor);
});

window.addEventListener("touchstart", ev => {
    // We get the first object that touched the screen
    const touch = ev.changedTouches.item(0);
    // If there's no other selection in progress
    // (This should also prevent touches from overriding mouse input if it started first)
    if (isInsideMap({ "x": touch.pageX, "y": touch.pageY }) && startSelection(touch.pageX, touch.pageY)) {
        // We set it as the one we're tracking
        touchIdentifier = touch.identifier;
    }
});

window.addEventListener("touchmove", ev => {
    // Should be undefined if mouse was selecting first
    if (touchIdentifier === undefined) { return; }

    // For each touch that changed
    for (let i = 0; i < ev.changedTouches.length; i++) {
        const touch = ev.changedTouches.item(i);
        
        // We check if it's the one we're tracking
        if (touch.identifier === touchIdentifier) {
            // If so update the selection
            updateSelection(touch.pageX, touch.pageY);
            break;
        }
    }
});

window.addEventListener("touchend", ev => {
    // Should be undefined if mouse was selecting first
    if (touchIdentifier === undefined) { return; }

    // For each touch that changed
    for (let i = 0; i < ev.changedTouches.length; i++) {
        const touch = ev.changedTouches.item(i);
        
        // We check if it's the one we're tracking
        if (touch.identifier === touchIdentifier) {
            // If so we end the selection and stop tracking it
            endSelection();
            touchIdentifier = undefined;
            break;
        }
    }
});

window.addEventListener("mousedown", ev => {
    if (isInsideMap(ev)) {
        const cellPos = GLOBAL_MAP.globalPosToGridCell(ev.x, ev.y);
        if (ev.ctrlKey) {
            GLOBAL_MAP.toggleOut(cellPos.x, cellPos.y);
        } else if (ev.shiftKey) {
            const i = GLOBAL_MAP.getGroupIndexAt(cellPos.x, cellPos.y);
            if (i >= 0) {
                GLOBAL_MAP.groups.splice(i, 1);
            }
        } else {
            // Selection only starts if it wasn't already started
            // So no touch events should be overridden by the mouse
            startSelection(ev.x, ev.y);
        }
    }
});

window.addEventListener("mousemove", ev => {
    // We only want to update the selection if it wasn't started from a touch object
    if (touchIdentifier === undefined) {
        updateSelection(ev.x, ev.y);
    }
});

window.addEventListener("mouseup", () => {
    // We only want to end the selection if it wasn't started from a touch object
    if (touchIdentifier === undefined) {
        endSelection()
    }
});

window.addEventListener("dblclick", ev => {
    if (isInsideMap(ev)) {
        const cellPos = GLOBAL_MAP.globalPosToGridCell(ev.x, ev.y);
        GLOBAL_MAP.toggleOut(cellPos.x, cellPos.y);
    }
})

window.addEventListener("keydown", ev => {
    if (ev.key === " ") {
        endSelection();
        confirmSelection();
    }
});
