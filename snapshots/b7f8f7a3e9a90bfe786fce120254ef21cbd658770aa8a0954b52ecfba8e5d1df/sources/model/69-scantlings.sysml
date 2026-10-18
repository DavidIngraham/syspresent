package MarineStructures {
    private import ScalarValues::*;
    calc def DesignMargins {
        in d : Real [29] ordered nonunique;
        in p : Real [41] ordered nonunique;
        in m : Real [21] ordered nonunique;
        in g : Real [60] ordered nonunique;
        in r : Real [12] ordered nonunique;
        in loads : Real [3] ordered nonunique;
        in waterline : Real;
        doc /* g extends the mass geometry vector with deck area at 52 and finite-laminate
         * I/Z pairs for hull, wing, keel and rudder at 53 through 60.
         * Inward polygon offsets define the laminate cross section; no thin-wall
         * stiffness extrapolation is used. Global bending uses worst-direction section modulus.
         * Proof-tip, ballast lateral inertia and operating loads are separate maxima.
         * No FDM bending credit; no buckling, fatigue, impact or joint qualification. */
        attribute modulus : Real = r#(1)*p#(14);
        attribute allowable : Real = r#(2)*p#(14);
        attribute hullI : Real = g#(53);
        attribute wingI : Real = g#(55);
        attribute keelI : Real = g#(57);
        attribute rudderI : Real = g#(59);
        attribute wingSpan : Real = RealFunctions::sqrt(d#(5)*d#(6));
        attribute wingForce : Real = loads#(1)*p#(36);
        attribute keelForce : Real = loads#(2)*p#(36);
        attribute rudderForce : Real = loads#(3)*p#(36);
        attribute hullMoment : Real = m#(1)*p#(35)*d#(1)/4;
        attribute wingMoment : Real = NumericalFunctions::max(wingForce/2,r#(4))*wingSpan;
        attribute keelTipForce : Real = NumericalFunctions::max(r#(4),d#(16)*p#(35)*p#(36));
        attribute keelMoment : Real = NumericalFunctions::max(keelForce/2,keelTipForce)*d#(12);
        attribute rudderMoment : Real = NumericalFunctions::max(rudderForce/2,r#(4))*d#(14);
        attribute hullStressMargin : Real = 1-hullMoment/(g#(54)*allowable);
        attribute wingStressMargin : Real = 1-wingMoment/(g#(56)*allowable);
        attribute keelStressMargin : Real = 1-keelMoment/(g#(58)*allowable);
        attribute rudderStressMargin : Real = 1-rudderMoment/(g#(60)*allowable);
        attribute hullDeflectionMargin : Real = 1-5*2*m#(1)*p#(35)*d#(1)*d#(1)/(384*modulus*hullI*r#(9));
        attribute wingDeflectionMargin : Real = 1-NumericalFunctions::max(wingForce/8,r#(4)/3)*wingSpan*wingSpan/(modulus*wingI*r#(8));
        attribute keelDeflectionMargin : Real = 1-NumericalFunctions::max(keelForce/8,keelTipForce/3)*d#(12)*d#(12)/(modulus*keelI*r#(8));
        attribute rudderDeflectionMargin : Real = 1-NumericalFunctions::max(rudderForce/8,r#(4)/3)*d#(14)*d#(14)/(modulus*rudderI*r#(8));
        attribute panelStressMargin : Real = 1-0.75*r#(3)*d#(25)*d#(25)/(m#(18)*m#(18)*allowable);
        attribute panelDeflectionMargin : Real = 1-5*r#(3)*d#(25)*d#(25)*d#(25)/(32*modulus*m#(18)*m#(18)*m#(18)*r#(10));
        attribute bodyAssembly : Real = m#(2)+m#(5)+m#(7)+m#(8)+m#(9)+m#(10);
        attribute bodyHandlingMargin : Real = 1-bodyAssembly/p#(37);
        attribute wingHandlingMargin : Real = 1-m#(3)/p#(37);
        attribute keelHandlingMargin : Real = 1-(m#(4)+d#(16))/p#(37);
        attribute batteryHandlingMargin : Real = 1-m#(6)/p#(37);
        attribute freeboardMargin : Real = (d#(4)-waterline)/r#(5)-1;
        attribute reserveVolumeMargin : Real = p#(32)*g#(5)/((1+r#(6))*m#(1))-1;
        attribute launchDepthMargin : Real = (r#(7)-(waterline-(2*g#(51)+d#(3)+d#(12))))/r#(7);
        attribute panelAreaMargin : Real = p#(38)*g#(52)/d#(18)-1;
        attribute hullPackingMargin : Real = 1-m#(14)/g#(5);
        attribute wingPackingMargin : Real = 1-m#(15)/g#(17);
        attribute keelPackingMargin : Real = 1-m#(16)/g#(29);
        attribute rudderPackingMargin : Real = 1-m#(17)/g#(41);
        attribute appendages : Real [5] ordered nonunique = MarineAppendages::GeometryMargins(d,r#(11),r#(12));
        attribute keelAspectMargin : Real = appendages#(1);
        attribute rudderAspectMargin : Real = appendages#(2);
        attribute keelRootMargin : Real = appendages#(3);
        attribute rudderStockMargin : Real = appendages#(4);
        attribute sweptSeparationMargin : Real = appendages#(5);
        return result : Real [*] ordered nonunique;
        (hullStressMargin,wingStressMargin,keelStressMargin,rudderStressMargin,hullDeflectionMargin,wingDeflectionMargin,keelDeflectionMargin,rudderDeflectionMargin,panelStressMargin,panelDeflectionMargin,bodyHandlingMargin,wingHandlingMargin,keelHandlingMargin,batteryHandlingMargin,freeboardMargin,reserveVolumeMargin,launchDepthMargin,panelAreaMargin,hullPackingMargin,wingPackingMargin,keelPackingMargin,rudderPackingMargin,keelAspectMargin,rudderAspectMargin,keelRootMargin,rudderStockMargin,sweptSeparationMargin)
    }
}
