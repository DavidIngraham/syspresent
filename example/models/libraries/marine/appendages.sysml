package MarineAppendages {
    private import ScalarValues::*;
    calc def GeometryMargins {
        in d : Real [29] ordered nonunique;
        in minimumAspectRatio : Real;
        in clearanceM : Real;
        doc /* Rectangular underwater foils centered at x=0 (keel) and
         * x=-arm*length (rudder), with a center-chord rudder stock. The swept
         * disk bounds all steering angles, including thickness for the current
         * elliptical 12-percent section. This is a planform screen, not a
         * bearing, bracket, hull-intersection or bulb-clearance assessment. */
        attribute keelChord : Real = d#(11)/d#(12);
        attribute rudderChord : Real = d#(13)/d#(14);
        attribute keelAspectMargin : Real = d#(12)*d#(12)/d#(11)/minimumAspectRatio-1;
        attribute rudderAspectMargin : Real = d#(14)*d#(14)/d#(13)/minimumAspectRatio-1;
        attribute keelRootMargin : Real = 1-keelChord/d#(1);
        attribute rudderStockMargin : Real = 1-2*d#(15);
        attribute sweptSeparationMargin : Real = (d#(15)*d#(1)-(keelChord+rudderChord)/2-clearanceM)/d#(1);
        return result : Real [5] ordered nonunique;
        (keelAspectMargin,rudderAspectMargin,keelRootMargin,rudderStockMargin,sweptSeparationMargin)
    }
}
