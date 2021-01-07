
import { wCanvas, UMath } from "./wCanvas/wcanvas.js";

export class KarnaughMap {

    /**
     * @param {Number} x - The x pos at which the map should be drawn
     * @param {Number} y - The y pos at which the map should be drawn
     * @param {Number} cellSize - The size of all cells
     * @param {Number} variableCount - The number of variables it should contain [2; 4]
     * @param {Array<Array<Number>>} startingValues - the values it should start with
     */
    constructor(x, y, cellSize = 16, variableCount = 4, startingValues = []) {

        this.pos = new UMath.Vec2(x, y);
        this.values = startingValues;
        this.cellSize = cellSize;
        this.groups = [];

        this.changeVariables(variableCount);

    }

    /**
     * @param {Number} count - The new ammount of variables [2; 4]
     * @param {Array<String>} names - The names of the variables (4 must be specified)
     * @param {Array<String>} values - The values the variables can take (Keep undefined)
     * @param {Boolean} resetGroups - Whether or not to empty the groups array (Should always be true)
     */
    changeVariables(count, names = [ "A", "B", "C", "D" ], values = [ "00", "01", "11", "10" ], resetGroups = true) {
        let xVarCount = 0;
        let yVarCount = 0;

        switch (count) {
            case 2: {
                xVarCount = 1;
                yVarCount = 1;
                break;
            }
            case 3: {
                xVarCount = 2;
                yVarCount = 1;
                break;
            }
            default: {
                xVarCount = 2;
                yVarCount = 2;
            }
        }

        this.firstRow = [ names.slice(0, xVarCount).join("") ];
        this.firstCol = [ names.slice(xVarCount, xVarCount + yVarCount).join("") ];

        const cols = Math.pow(2, xVarCount);
        const rows = Math.pow(2, yVarCount);
        for (let i = 0; i < cols; i++) {
            this.firstRow.push(values[i].substr(-xVarCount));
        }
        for (let i = 0; i < rows; i++) {
            this.firstCol.push(values[i].substr(-yVarCount));
        }

        if (resetGroups) {
            this.groups = [];
        }
    }

    /**
     * @returns {UMath.Vec2} The size of the map's grid
     */
    getSize() {
        return new UMath.Vec2(this.firstRow.length - 1, this.firstCol.length - 1);
    }

    /**
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
     * @param {Number} x1 - The starting x coord relative to the grid of the new group
     * @param {Number} y1 - The starting y coord relative to the grid of the new group
     * @param {Number} x2 - The ending x coord relative to the grid of the new group
     * @param {Number} y2 - The ending y coord relative to the grid of the new group
     * @param {Array<Number>} color - The color of the new group
     */
    getAsGroup(x1, y1, x2, y2, color = [255, 255, 255]) {
        const gridSize = this.getSize();

        const size = new UMath.Vec2(
            x2 - x1 + (x1 > x2 ? gridSize.x : 0),
            y2 - y1 + (y1 > y2 ? gridSize.y : 0)
        ).add(1);

        return [ x1, y1, size.x, size.y, color ];
    }

    /**
     * @param {Number} x1 - The starting x coord relative to the grid of the new group
     * @param {Number} y1 - The starting y coord relative to the grid of the new group
     * @param {Number} x2 - The ending x coord relative to the grid of the new group
     * @param {Number} y2 - The ending y coord relative to the grid of the new group
     * @param {Array<Number>} color - The color of the new group
     */
    addGroup(x1, y1, x2, y2, color = [255, 255, 255]) {
        this.groups.push(
            this.getAsGroup(x1, y1, x2, y2, color)
        );
        return this.groups[this.groups.length - 1];
    }

    /**
     * @param {wCanvas} canvas - The canvas to draw the group on
     * @param {[Number, Number, Number, Number, Array<Number>]} group - The group to draw
     */
    drawRect(canvas, group) {

        let [x, y, w, h, color] = group;
        
        canvas.stroke(...color);
        canvas.strokeWeigth(4);
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
     * @param {wCanvas} canvas - The canvas to draw the map on
     */
    draw(canvas) {
        canvas.fill(255, 255, 255);
        canvas.stroke(255, 255, 255);

        canvas.line(this.pos.x, this.pos.y, this.pos.x + this.cellSize, this.pos.y + this.cellSize);

        canvas.textSize(this.cellSize * 0.33);

        const gridSize = this.getSize();

        for (let i = 0; i < this.firstRow.length; i++) {

            const x = this.pos.x + i * this.cellSize;

            if (i > 0) {
                canvas.line(x, this.pos.y, x, this.pos.y + this.cellSize * this.firstCol.length);
            }

            canvas.text(
                this.firstRow[i], x + this.cellSize / 2, this.pos.y + this.cellSize / 2,
                i === 0 ? { "horizontalAlignment": "left", "verticalAlignment": "top" } : { "horizontalAlignment": "center", "verticalAlignment": "center" }
            );

        }

        for (let i = 0; i < this.firstCol.length; i++) {

            const y = this.pos.y + i * this.cellSize;

            if (i > 0) {
                canvas.line(this.pos.x, y, this.pos.x + this.cellSize * this.firstRow.length, y);
            }

            canvas.text(
                this.firstCol[i],
                this.pos.x + this.cellSize / 2, y + this.cellSize / 2,
                i === 0 ? { "horizontalAlignment": "right", "verticalAlignment": "bottom" } : { "horizontalAlignment": "center", "verticalAlignment": "center" }
            );

        }

        canvas.textSize(window.cellSize * 0.5);
        for (let y = 0; y < Math.min(this.values.length, gridSize.y); y++) {
            const row = this.values[y];
            for (let x = 0; x < Math.min(row.length, gridSize.x); x++) {
                canvas.text(
                    row[x],
                    this.pos.x + this.cellSize * 1.5 + x * this.cellSize, this.pos.y + this.cellSize * 1.5 + y * this.cellSize,
                    { "horizontalAlignment": "center", "verticalAlignment": "center" }
                );
            }
        }

        this.groups.forEach(
            group => this.drawRect(canvas, group)
        );
    }

}

