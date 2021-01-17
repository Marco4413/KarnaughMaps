
import { wCanvas, UMath, Color } from "./wCanvas/wcanvas.js";
import { MapStyle, mapStyleToDict } from "./MapStyle.js";
import { isValidKarnaughMap } from "./validationUtils.js";

/**
 * @typedef {[Number, Number, Number, Number, [Number, Number, Number]]} Group
 */

/**
 * The count of variables on the x and y axis
 * @param {Number} count - The total number of variables
 * @returns {UMath.Vec2} The count of variables on the x and y axis
 */
export function getXYVarCount(count) {
    switch (count) {
        case 2: {
            return new UMath.Vec2(1, 1);
        }
        case 3: {
            return new UMath.Vec2(2, 1);
        }
        default: {
            return new UMath.Vec2(2, 2);
        }
    }
}

export class KarnaughMap {

    /**
     * @param {Number} x - The x pos at which the map should be drawn
     * @param {Number} y - The y pos at which the map should be drawn
     * @param {Number} cellSize - The size of all cells
     * @param {Number} variableCount - The number of variables it should contain [2; 4]
     * @param {Array<Array<Number>>} startingValues - the values it should start with
     */
    constructor(x, y, cellSize = 16, variableCount = 4) {

        this.style = new MapStyle();

        this.pos = new UMath.Vec2(x, y);
        this.cellSize = cellSize;
        this.groups = [];

        this.varNames = [ "A", "B", "C", "D" ];

        this.changeVariables(variableCount);

    }

    /**
     * Returns the size of the map's grid
     * @returns {UMath.Vec2} The size of the map's grid
     */
    getSize() {
        const varCount = getXYVarCount(this.varCount);
        return new UMath.Vec2(
            Math.pow(2, varCount.x),
            Math.pow(2, varCount.y)
        );
    }

    /**
     * Returns all groups of variables (e.g. ["AB", "CD"])
     * @returns {[String, String]} The two groups of variables
     */
    getVarGroups() {
        const varCount = getXYVarCount(this.varCount);
        return [ this.varNames.slice(0, varCount.x).join(""), this.varNames.slice(varCount.x, varCount.x + varCount.y).join("") ];
    }

    /**
     * Returns all the values that the variables can assume
     * @returns {{ x: Array<String>, y: Array<String> }} The values that the variables can assume
     */
    getVarValues() {
        const varValues = {
            "x": [],
            "y": []
        };
        
        const binaryValues = [ "00", "01", "11", "10" ];

        const varCount = getXYVarCount(this.varCount);
        const possibleValues = new UMath.Vec2(
            Math.pow(2, varCount.x),
            Math.pow(2, varCount.y)
        );

        for (let i = 0; i < possibleValues.x; i++) {
            varValues.x.push(binaryValues[i].substr(-varCount.x));
        }
        for (let i = 0; i < possibleValues.y; i++) {
            varValues.y.push(binaryValues[i].substr(-varCount.y));
        }

        return varValues;
    }

    /**
     * Used to change variable count and their names
     * @param {Number} count - The new ammount of variables [2; 4]
     * @param {Array<String>} names - The names of the variables (4 must be specified)
     * @param {Boolean} resetGroups - Whether or not to empty the groups array (Should always be true)
     */
    changeVariables(count, names = [ "A", "B", "C", "D" ], resetGroups = true) {
        this.varCount = count;
        this.varNames = names;

        const size = this.getSize();

        this.outValues = [];
        for (let y = 0; y < size.y; y++) {
            this.outValues[y] = [];
            for (let x = 0; x < size.x; x++) {
                this.outValues[y][x] = 0;
            }
        }

        if (resetGroups) {
            this.groups = [];
        }
    }

    /**
     * Switches between 0 and 1 the out value at x, y
     * @param {Number} x - The x coord on the grid of the out value to cycle between 0 and 1
     * @param {Number} y - The y coord on the grid of the out value to cycle between 0 and 1
     */
    toggleOut(x, y) {
        if (this.outValues[y] === undefined) { return; }
        if (this.outValues[y][x] === undefined) { return; }

        this.outValues[y][x] = (this.outValues[y][x] + 1) % 2;
    }

    /**
     * Gets a global pos on the canvas and returns the same one relative to the grid
     * @param {Number} x - A global x coord on the canvas
     * @param {Number} y - A global y coord on the canvas
     * @returns {UMath.Vec2} The pos of a specific cell relative to the grid
     */
    globalPosToGridCell(x, y) {
        const gridOrigin = UMath.Vec2.add(this.pos, this.cellSize);
        const gridSize = this.getSize();

        const relativePos = UMath.Vec2.sub({ x, y }, gridOrigin);

        const gridCell = new UMath.Vec2(
            Math.floor(relativePos.x / this.cellSize) % gridSize.x,
            Math.floor(relativePos.y / this.cellSize) % gridSize.y
        );

        return new UMath.Vec2(
            gridCell.x < 0 ? gridSize.x + gridCell.x : gridCell.x,
            gridCell.y < 0 ? gridSize.y + gridCell.y : gridCell.y
        );
    }

    /**
     * Takes 2 pos and a color and returns them as a group that can be added to this.groups
     * @param {Number} x1 - The starting x coord relative to the grid of the new group
     * @param {Number} y1 - The starting y coord relative to the grid of the new group
     * @param {Number} x2 - The ending x coord relative to the grid of the new group
     * @param {Number} y2 - The ending y coord relative to the grid of the new group
     * @param {Color|String|Number|Array<Number>} color - The color of the new group
     * @param {Boolean} onlyPowsOf2 - Whether or not to only use powers of base 2 as the group size
     * @returns {Group} The newly created group
     */
    getAsGroup(x1, y1, x2, y2, color = [255, 255, 255], onlyPowsOf2 = true) {
        const gridSize = this.getSize();

        const size = new UMath.Vec2(
            x2 - x1 + (x1 > x2 ? gridSize.x : 0),
            y2 - y1 + (y1 > y2 ? gridSize.y : 0)
        ).add(1);

        if (onlyPowsOf2) {
            size.x = Math.pow(2, Math.round(Math.log2(size.x)));
            size.y = Math.pow(2, Math.round(Math.log2(size.y)));
        }

        return [ x1, y1, size.x, size.y, new Color(color) ];
    }

    /**
     * Takes 2 pos and a color and adds them to this.groups
     * @param {Number} x1 - The starting x coord relative to the grid of the new group
     * @param {Number} y1 - The starting y coord relative to the grid of the new group
     * @param {Number} x2 - The ending x coord relative to the grid of the new group
     * @param {Number} y2 - The ending y coord relative to the grid of the new group
     * @param {Array<Number>} color - The color of the new group
     * @param {Boolean} onlyPowsOf2 - Whether or not to only use powers of base 2 as the group size
     * @returns {Group} The newly added group
     */
    addGroup(x1, y1, x2, y2, color = [255, 255, 255], onlyPowsOf2 = true) {
        this.groups.push(
            this.getAsGroup(x1, y1, x2, y2, color, onlyPowsOf2)
        );
        return this.groups[this.groups.length - 1];
    }

    /**
     * Draws the specified group on the specified canvas
     * @param {wCanvas} canvas - The canvas to draw the group on
     * @param {Group} group - The group to draw
     */
    drawGroup(canvas, group) {

        let [x, y, w, h, color] = group;
        
        canvas.stroke(color);
        canvas.strokeWeigth(this.style.groups.borderWidth);
        const maxSize = this.getSize();

        w = UMath.constrain(w, 1, maxSize.x);
        h = UMath.constrain(h, 1, maxSize.y);

        const start = new UMath.Vec2(x, y);
        const size = new UMath.Vec2(w, h);

        const xOverflow = Math.max(start.x + size.x - maxSize.x, 0);
        const yOverflow = Math.max(start.y + size.y - maxSize.y, 0);
        size.sub({ "x": xOverflow, "y": yOverflow });

        {
            canvas.rect(
                this.pos.x + (start.x + 1) * this.cellSize, this.pos.y + (start.y + 1) * this.cellSize,
                size.x * this.cellSize * (xOverflow > 0 ? 2 : 1), size.y * this.cellSize * (yOverflow > 0 ? 2 : 1),
                { "noFill": true, "rounded": { "radius": this.cellSize / 2, "radiusMode": "pixels", "corners": [true, xOverflow === 0, xOverflow === 0 && yOverflow === 0, yOverflow === 0] } }
            );
        }

        if (xOverflow > 0) {
            canvas.rect(
                this.pos.x + this.cellSize - xOverflow * this.cellSize, this.pos.y + (start.y + 1) * this.cellSize,
                xOverflow * this.cellSize * 2, size.y * this.cellSize * (yOverflow > 0 ? 2 : 1),
                { "noFill": true, "rounded": { "radius": this.cellSize / 2, "radiusMode": "pixels", "corners": [false, true, yOverflow === 0, false] } }
            );
        }

        if (yOverflow > 0) {
            canvas.rect(
                this.pos.x + (start.x + 1) * this.cellSize, this.pos.y + this.cellSize - yOverflow * this.cellSize,
                size.x * this.cellSize * (xOverflow > 0 ? 2 : 1), yOverflow * this.cellSize * 2,
                { "noFill": true, "rounded": { "radius": this.cellSize / 2, "radiusMode": "pixels", "corners": [false, false, xOverflow === 0, true] } }
            );
        }

        if (xOverflow > 0 && yOverflow > 0) {
            canvas.rect(
                this.pos.x + this.cellSize - xOverflow * this.cellSize, this.pos.y + this.cellSize - yOverflow * this.cellSize,
                xOverflow * this.cellSize * 2, yOverflow * this.cellSize * 2,
                { "noFill": true, "rounded": { "radius": this.cellSize / 2, "radiusMode": "pixels", "corners": [false, false, true, false] } }
            );
        }
    }

    /**
     * Draws the whole map on the specified canvas
     * @param {wCanvas} canvas - The canvas to draw the map on
     */
    draw(canvas) {
        canvas.fill(this.style.text.color);
        canvas.stroke(this.style.lines.color);
        canvas.strokeWeigth(this.style.lines.width);

        canvas.line(this.pos.x, this.pos.y, this.pos.x + this.cellSize, this.pos.y + this.cellSize);

        const textScale = this.cellSize * this.style.text.scale;
        canvas.textSize(textScale);

        const gridSize = this.getSize();

        {
            const [ xGroup, yGroup ] = this.getVarGroups();

            const maxWidth = Math.max(canvas.context.measureText(xGroup).width, canvas.context.measureText(yGroup).width);
            const rescale = maxWidth > this.cellSize / 2 ? (this.cellSize / 2) / maxWidth : 1;
            canvas.textSize(textScale * rescale);

            canvas.text(
                xGroup, this.pos.x + this.cellSize / 2, this.pos.y + this.cellSize / 2,
                { "alignment": { "horizontal": "left", "vertical": "bottom" } }
            );

            canvas.text(
                yGroup, this.pos.x + this.cellSize / 2, this.pos.y + this.cellSize / 2,
                { "alignment": { "horizontal": "right", "vertical": "top" } }
            );
        }

        canvas.textSize(textScale);
        const varValues = this.getVarValues();
        for (let i = 0; i < varValues.x.length; i++) {
            const x = this.pos.x + this.cellSize * (i + 1);
            canvas.line(x, this.pos.y, x, this.pos.y + this.cellSize * (gridSize.y + 1));

            canvas.text(
                varValues.x[i], x + this.cellSize / 2, this.pos.y + this.cellSize / 2,
                { "alignment": { "horizontal": "center", "vertical": "center" } }
            );
        }

        for (let i = 0; i < varValues.y.length; i++) {
            const y = this.pos.y + this.cellSize * (i + 1);
            canvas.line(this.pos.x, y, this.pos.x + this.cellSize * (gridSize.x + 1), y);

            canvas.text(
                varValues.y[i], this.pos.x + this.cellSize / 2, y + this.cellSize / 2,
                { "alignment": { "horizontal": "center", "vertical": "center" } }
            );
        }

        canvas.fill(this.style.outValues.color);
        canvas.textSize(window.cellSize * this.style.outValues.scale);
        for (let y = 0; y < Math.min(this.outValues.length, gridSize.y); y++) {
            const row = this.outValues[y];
            for (let x = 0; x < Math.min(row.length, gridSize.x); x++) {
                canvas.text(
                    row[x],
                    this.pos.x + this.cellSize * 1.5 + x * this.cellSize, this.pos.y + this.cellSize * 1.5 + y * this.cellSize,
                    { "alignment": { "horizontal": "center", "vertical": "center" } }
                );
            }
        }

        this.groups.forEach(
            group => this.drawGroup(canvas, group)
        );
    }

    /**
     * Serializes this KarnaughMap into a JSON string
     * @returns {false|String} False if it failed to serialize, the serialized style if it succeeded
     */
    serialize() {
        if (isValidKarnaughMap(this)) {

            return JSON.stringify(
                {
                    "groups": this.groups.map(group => {
                        const copy = group.slice();
                        copy[copy.length - 1] = copy[copy.length - 1].toRGB();
                        return copy;
                    }),
                    "outValues": this.outValues,
                    "style": mapStyleToDict(this.style),
                    "varCount": this.varCount,
                    "varNames": this.varNames
                }, undefined, 0
            );

        }

        return false;
    }

    /**
     * Loads the specified JSON string into itself
     * @param {String} str - The string to deserialize
     * @returns {Boolean} Whether or not deserialization was succesful
     */
    deserialize(str) {

        try {
            const kMap = JSON.parse(str);
            if (isValidKarnaughMap(kMap)) {
                this.groups = kMap.groups.map(group => {
                    group[group.length - 1] = new Color(group[group.length - 1]);
                    return group;
                });

                this.outValues = kMap.outValues;
                this.style = new MapStyle(
                        kMap.style.lines.color,
                        kMap.style.lines.width,
                        kMap.style.text.color,
                        kMap.style.text.scale,
                        kMap.style.outValues.color,
                        kMap.style.outValues.scale,
                        kMap.style.groups.borderWidth,
                );
                this.varCount = kMap.varCount;
                this.varNames = kMap.varNames;

                return true;
            }
        } catch (err) { }

        console.error("Failed to deserialize KarnaughMap:", str);

        return false;

    }
}

