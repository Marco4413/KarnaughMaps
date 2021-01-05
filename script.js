
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

window.grid = [
    [ "  ", "00", "01", "11", "10" ],
    [ "00",  "1",  "1",  "0",  "0" ],
    [ "01",  "0",  "0",  "0",  "1" ],
    [ "11",  "0",  "1",  "0",  "1" ],
    [ "10",  "1",  "1",  "0",  "0" ]
];

const confirmedGroups = [ ];

const currentColor = [ 255, 0, 0 ];

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

    canvas.textSize(window.cellSize / 2);
    canvas.clear();

    canvas.fill(255, 255, 255);
    for (let y = 0; y < window.grid.length; y++) {
        const row = window.grid[y];
        for (let x = 0; x < row.length; x++) {
            canvas.text(row[x], x * window.cellSize + window.cellSize / 2, y * window.cellSize + window.cellSize / 2, { "noStroke": true, "horizontalAlignment": "center", "verticalAlignment": "center" });
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
