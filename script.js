
import { wCanvas, UMath } from "./wCanvas/wcanvas.js";

window.cellSize = 128;

let selecting = false;
let firstSel = new UMath.Vec2();
let lastSel = new UMath.Vec2();

/**
 * @param {UMath.Vec2} vec
 * @returns {UMath.Vec2}
 */
function constrainToGrid(vec) {
    const retVal = vec.copy();
    retVal.div(window.cellSize);
    retVal.x = Math.floor(retVal.x);
    retVal.y = Math.floor(retVal.y);
    retVal.mul(window.cellSize);
    return retVal;
}

/**
 * @returns {[ UMath.Vec2, UMath.Vec2 ]}
 */
function getSelectionCorners() {
    const topLeft = new UMath.Vec2( Math.min(firstSel.x, lastSel.x), Math.min(firstSel.y, lastSel.y) );
    const bottomRight = new UMath.Vec2( Math.max(firstSel.x, lastSel.x), Math.max(firstSel.y, lastSel.y) );

    return [ constrainToGrid( topLeft ), constrainToGrid( bottomRight ) ];
}

/**
 * @param {UMath.Vec2} topLeft
 * @param {UMath.Vec2} bottomRight
 * @returns {[ UMath.Vec2, UMath.Vec2 ]}
 */
function getRectPosSize(topLeft, bottomRight) {
    const rectSize = constrainToGrid( UMath.Vec2.sub( bottomRight, topLeft ).add(window.cellSize) );
    const origin   = constrainToGrid( topLeft ).add( UMath.Vec2.div( rectSize, 2 ) );
    return [ origin, rectSize ];
}

let horVariables = 0;
let verVariables = 0;

const variableNames = [ "A", "B", "C", "D" ];
const variableValues = [ "00", "01", "11", "10" ];


window.grid = [ ];

let confirmedGroups = [ ];

const currentColor = [ 255, 0, 0 ];

/**
 * @param {Number} n
 * @param {Boolean} resetSelections
 */
window.changeVariableCount = (n, resetSelections = true) => {
    switch (n) {
        case 2: {
            horVariables = 1;
            verVariables = 1;
            break;
        }
        case 3: {
            horVariables = 2;
            verVariables = 1;
            break;
        }
        default: {
            horVariables = 2;
            verVariables = 2;
        }
    }

    if (resetSelections) {
        confirmedGroups = [ ];
    }
}

function confirmRect() {
    const [ origin, rectSize ] = getRectPosSize( ...getSelectionCorners() );
    confirmedGroups.push(
        { origin, rectSize, color: currentColor.slice() }
    );

    currentColor[0] = Math.random() * 255;
    currentColor[1] = Math.random() * 255;
    currentColor[2] = Math.random() * 255;

    selecting = false;
    firstSel = new UMath.Vec2();
    lastSel = new UMath.Vec2();
}

/**
 * @param {wCanvas} canvas
 * @param {Number} deltaTime
 */
function draw(canvas, deltaTime) {

    canvas.clear();

    canvas.fill(255, 255, 255);
    canvas.stroke(255, 255, 255);

    const rows = Math.pow(2, verVariables);
    const cols = Math.pow(2, horVariables);

    {
        let firstRow = variableNames.slice(0, horVariables).join("");
        let firstCol = variableNames.slice(horVariables, horVariables + verVariables).join("");

        canvas.textSize(window.cellSize * 0.33);
        const origin = new UMath.Vec2(window.cellSize / 2, window.cellSize / 2);
        canvas.line(0, 0, window.cellSize, window.cellSize);
        canvas.text(firstRow, origin.x + 2.5, origin.y - 2.5, { "noStroke": true, "horizontalAlignment": "left", "verticalAlignment": "top" });
        canvas.text(firstCol, origin.x - 2.5, origin.y + 2.5, { "noStroke": true, "horizontalAlignment": "right", "verticalAlignment": "bottom" });

        for (let x = 0; x < cols; x++) {
            const text = variableValues[x].substr(-horVariables);
            canvas.text(text, window.cellSize + x * window.cellSize + window.cellSize / 2, window.cellSize / 2, { "noStroke": true, "horizontalAlignment": "center", "verticalAlignment": "center" });
        }

        for (let y = 0; y < rows; y++) {
            const text = variableValues[y].substr(-verVariables);
            canvas.text(text, window.cellSize / 2, window.cellSize + y * window.cellSize + window.cellSize / 2, { "noStroke": true, "horizontalAlignment": "center", "verticalAlignment": "center" });
        }
    }

    canvas.textSize(window.cellSize * 0.5);
    for (let y = 0; y < rows; y++) {
        const row = window.grid[y];
        if (row === undefined) { break; }
        for (let x = 0; x < cols; x++) {
            if (row[x] === undefined) { break; }

            canvas.text(String(row[x]), window.cellSize + x * window.cellSize + window.cellSize / 2, window.cellSize + y * window.cellSize + window.cellSize / 2, { "noStroke": true, "horizontalAlignment": "center", "verticalAlignment": "center" });
        }
    }

    for (let i = 0; i < confirmedGroups.length; i++) {
        const rect = confirmedGroups[i];

        canvas.stroke(...rect.color);
        canvas.rect(
            rect.origin.x, rect.origin.y,
            rect.rectSize.x, rect.rectSize.y,
            { "noFill": true, "rounded": {  } }
        );
    }

    if (selecting) {
        const [ origin, rectSize ] = getRectPosSize( ...getSelectionCorners() );
        canvas.stroke(...currentColor);
        canvas.rect(
            origin.x, origin.y,
            rectSize.x, rectSize.y,
            { "noFill": true, "rounded": {  } }
        );
    }

}

window.addEventListener("load", () => {

    window.changeVariableCount(4);

    new wCanvas(
        {
            "onSetup": canvas => {
                canvas.canvas.addEventListener("mousedown", ev => {
                    selecting = true;
                    firstSel.x = ev.x;
                    firstSel.y = ev.y;
                    lastSel.x = ev.x;
                    lastSel.y = ev.y;
                });

                canvas.canvas.addEventListener("mousemove", ev => {
                    if (selecting) {
                        lastSel.x = ev.x;
                        lastSel.y = ev.y;
                    }
                });

                canvas.startLoop();
            },
            "onResize": (canvas) => {
                canvas.canvas.width = Math.pow(2, horVariables) * window.cellSize + window.cellSize;
                canvas.canvas.height = Math.pow(2, verVariables) * window.cellSize + window.cellSize;
            },
            "onDraw": draw
        }
    );

});

window.addEventListener("mouseup", () => { selecting = false; });

window.addEventListener(
    "keydown", ev => {
        if (ev.key === " ") {
            confirmRect();
        }
    }
);
