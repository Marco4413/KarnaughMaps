
import { wCanvas, UMath } from "./wCanvas/wcanvas.js";

import { KarnaughMap } from "./KarnaughMap.js";
import { MapStyle } from "./MapStyle.js";

const SAVE_BORDER_WIDTH = 10;
const SAVE_STYLE = new MapStyle([0, 0, 0], 2, [0, 0, 0], 0.33, [0, 0, 0], 0.5, 4);

const MAP_STYLE = new MapStyle();

let selecting = false;
let selStart = new UMath.Vec2();
let selEnd = new UMath.Vec2();
let currentColor = [ 255, 0, 0 ];
let touchIdentifier = undefined;

const DEFAULT_SELECTION_COLOR = [ 255, 255, 255 ];
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
 * @param {String} hex
 * @returns {[Number, Number, Number]}
 */
function hexToRGB(hex) {
    const RGBHex = hex.substr(1).match(/.{2}/g);
    return RGBHex.map(v => parseInt(v, 16));
}

/**
 * @param {[Number, Number, Number]} RGB
 * @returns {String}
 */
function RGBtoHex(RGB) {
    return "#" + RGB.map(v => {
        let hex = v.toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex;
    }).join("");
}

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
 * @param {[Number, Number, Number]} color
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
        GLOBAL_MAP.drawGroup(canvas, selToGroup(useCurrentColorForSelection ? currentColor.slice() : DEFAULT_SELECTION_COLOR.slice()));
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
    const isMobile = (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))return true; return false;})(navigator.userAgent||navigator.vendor||window.opera);

    { // Selection Confirm
        const selConf = document.getElementById("selConf");
        if (selConf !== null && !isMobile) {
            selConf.style.display = "none";
        }
    }

    { // Selection Color
        const selColor = document.getElementById("selColor");
        if (selColor !== null) {
            window.toggleSelectionColor(selColor, true);
        }
    }

    groupColorSelector = document.getElementById("groupColor");

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
     * @param {String|[Number, Number, Number]} color
     * @param {Boolean} isHex
     */
    window.changeColor = (color, isHex) => {
        currentColor = isHex ? hexToRGB(color) : color;

        if (groupColorSelector !== null) {
            groupColorSelector.value = RGBtoHex(currentColor);
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
        if (ev.ctrlKey) {
            const cellPos = GLOBAL_MAP.globalPosToGridCell(ev.x, ev.y);
            GLOBAL_MAP.toggleOut(cellPos.x, cellPos.y);
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
