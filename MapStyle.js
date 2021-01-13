
import { isValidMapStyle } from "./validationUtils.js";

/**
 * Returns the specified MapStyle as a Dictionary
 * @param {MapStyle} mapStyle - The MapStyle to return as a Dictionary
 * @returns {Object} The specified MapStyle as a Dictionary
 */
export function mapStyleToDict(mapStyle) {
    return {
        "lines": {
            "color": mapStyle.lines.color.slice(0, 3),
            "width": mapStyle.lines.width
        },
        "text": {
            "color": mapStyle.text.color.slice(0, 3),
            "scale": mapStyle.text.scale
        },
        "outValues": {
            "color": mapStyle.outValues.color.slice(0, 3),
            "scale": mapStyle.outValues.scale
        },
        "groups": {
            "borderWidth": mapStyle.groups.borderWidth
        }
    }
}

export class MapStyle {

    /**
     * @param {[ Number, Number, Number ]} linesColor 
     * @param {Number} linesWidth 
     * @param {[ Number, Number, Number ]} textColor 
     * @param {Number} textScale 
     * @param {[ Number, Number, Number ]} outValuesColor 
     * @param {Number} outValuesScale 
     * @param {Number} groupsBorderWidth 
     */
    constructor(linesColor = [255, 255, 255], linesWidth = 2, textColor = [255, 255, 255], textScale = 0.33, outValuesColor = [255, 255, 255], outValuesScale = 0.5, groupsBorderWidth = 4) {
        this.lines = {
            "color": linesColor,
            "width": linesWidth
        };
        this.text = {
            "color": textColor,
            "scale": textScale
        };
        this.outValues = {
            "color": outValuesColor,
            "scale": outValuesScale
        };
        this.groups = {
            "borderWidth": groupsBorderWidth
        };
    }

    /**
     * Serializes this MapStyle into a JSON string
     * @returns {false|String} False if it failed to serialize, the serialized style if it succeeded
     */
    serialize() {
        if (isValidMapStyle(this)) {

            return JSON.stringify(
                mapStyleToDict(this), undefined, 0
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
            const style = JSON.parse(str);
            if (isValidMapStyle(style)) {
                this.lines = style.lines;
                this.text = style.text;
                this.outValues = style.outValues;
                this.groups = style.groups;

                return true;
            }
        } catch (err) {
            console.error("Failed to deserialize MapStyle:", str);
        }

        return false;

    }

}
