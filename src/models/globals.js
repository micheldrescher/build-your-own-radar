const Definitions = {

    // column names in the google sheet
    COLUMN_NAMES: ['id', 'name', 'ring', 'quadrant', 'isNew', 'description'],

    // static names of the radar rings - must be in order innermost to outermost!
    RING_NAMES: ['Adopt', 'Trial', 'Assess', 'Hold', 'Drop'],

    // "size" of a quadrant in degrees - 90 for 4 quadrants, 60 for 6 "quadrants" etc.
    // Must correspond to the number of quadrants
    QUADRANT_SIZE: 60,

    // Degrees of polar coordinae rotation to alleviate flipped y axis in computer graphics
    // but keeping clockwise rotation (trigonometric unit circle is anti-clockwise
    // Will be used in conjunction with the quadrant size, whether static or computed (see above)
    POLAR_OFFSET: -90

}

module.exports = Definitions