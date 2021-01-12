
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

}
