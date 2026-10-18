package MarineHydrostatics {
    private import ScalarValues::*;
    doc /* Geometry kernel for full-angle static buoyancy. SI metres and cubic
     * metres; points are in world axes with Z up and gravity along -Z.
     * A watertight displacement body is partitioned into nonoverlapping tetrahedra.
     * The external numerical solver supplies pose and solves waterline equilibrium.
     * Flooded voids must be excluded from displacement geometry, not made heavy
     * as well unless retained water is separately trapped. No dynamic recovery claim. */
    calc def Vertex {
        in p : Real [*] ordered nonunique;
        in i : Integer;
        return xyz : Real [3] ordered nonunique;
        if i == 1 ? (p#(1),p#(2),p#(3)) else if i == 2 ? (p#(4),p#(5),p#(6)) else if i == 3 ? (p#(7),p#(8),p#(9)) else (p#(10),p#(11),p#(12))
    }
    calc def Moment {
        in p : Real [12] ordered nonunique;
        attribute ax : Real = p#(4)-p#(1);
        attribute ay : Real = p#(5)-p#(2);
        attribute az : Real = p#(6)-p#(3);
        attribute bx : Real = p#(7)-p#(1);
        attribute byy : Real = p#(8)-p#(2);
        attribute bz : Real = p#(9)-p#(3);
        attribute cx : Real = p#(10)-p#(1);
        attribute cy : Real = p#(11)-p#(2);
        attribute cz : Real = p#(12)-p#(3);
        attribute volume : Real = RealFunctions::abs(ax*(byy*cz-bz*cy)-ay*(bx*cz-bz*cx)+az*(bx*cy-byy*cx))/6;
        return moments : Real [4] ordered nonunique;
        (volume, volume*(p#(1)+p#(4)+p#(7)+p#(10))/4,
         volume*(p#(2)+p#(5)+p#(8)+p#(11))/4,
         volume*(p#(3)+p#(6)+p#(9)+p#(12))/4)
    }
    calc def Intersection {
        in a : Real [3] ordered nonunique;
        in b : Real [3] ordered nonunique;
        in waterline : Real;
        attribute t : Real = (waterline-a#(3))/(b#(3)-a#(3));
        return xyz : Real [3] ordered nonunique;
        (a#(1)+t*(b#(1)-a#(1)), a#(2)+t*(b#(2)-a#(2)), waterline)
    }
    calc def WetMoment {
        in p : Real [12] ordered nonunique;
        in waterline : Real;
        attribute wet : Integer [*] ordered nonunique = (1..4)->ControlFunctions::select { in i : Integer; (Vertex(p,i))#(3) <= waterline };
        attribute dry : Integer [*] ordered nonunique = (1..4)->ControlFunctions::select { in i : Integer; (Vertex(p,i))#(3) > waterline };
        attribute count : Integer = SequenceFunctions::size(wet);
        attribute clipped : Real [4] ordered nonunique = if count == 0 ? (0.0,0.0,0.0,0.0) else
            if count == 4 ? Moment(p) else PartialMoment(p,waterline,(wet,dry),count);
        attribute volume : Real = clipped#(1);
        attribute firstMomentX : Real = clipped#(2);
        attribute firstMomentY : Real = clipped#(3);
        attribute firstMomentZ : Real = clipped#(4);
        return moments : Real [4] ordered nonunique;
        (volume,firstMomentX,firstMomentY,firstMomentZ)
    }
    calc def PartialMoment {
        in p : Real [12] ordered nonunique;
        in waterline : Real;
        in order : Integer [4] ordered nonunique;
        in count : Integer;
        attribute a : Real [3] ordered nonunique = Vertex(p,order#(1));
        attribute b : Real [3] ordered nonunique = Vertex(p,order#(2));
        attribute c : Real [3] ordered nonunique = Vertex(p,order#(3));
        attribute d : Real [3] ordered nonunique = Vertex(p,order#(4));
        return moments : Real [4] ordered nonunique;
        if count == 1 ? Moment((a,Intersection(a,b,waterline),Intersection(a,c,waterline),Intersection(a,d,waterline))) else
        if count == 3 ? Difference(Moment(p),Moment((d,Intersection(d,a,waterline),Intersection(d,b,waterline),Intersection(d,c,waterline)))) else
        TwoWet(a,b,c,d,waterline)
    }
    calc def Difference {
        in a : Real [4] ordered nonunique;
        in b : Real [4] ordered nonunique;
        return values : Real [4] ordered nonunique;
        (a#(1)-b#(1),a#(2)-b#(2),a#(3)-b#(3),a#(4)-b#(4))
    }
    calc def TwoWet {
        in a : Real [3] ordered nonunique;
        in b : Real [3] ordered nonunique;
        in c : Real [3] ordered nonunique;
        in d : Real [3] ordered nonunique;
        in waterline : Real;
        attribute ac : Real [3] ordered nonunique = Intersection(a,c,waterline);
        attribute ad : Real [3] ordered nonunique = Intersection(a,d,waterline);
        attribute bc : Real [3] ordered nonunique = Intersection(b,c,waterline);
        attribute bd : Real [3] ordered nonunique = Intersection(b,d,waterline);
        attribute r1 : Real [4] ordered nonunique = Moment((a,ac,ad,b));
        attribute r2 : Real [4] ordered nonunique = Moment((b,ac,ad,bc));
        attribute r3 : Real [4] ordered nonunique = Moment((b,ad,bc,bd));
        return values : Real [4] ordered nonunique;
        (r1#(1)+r2#(1)+r3#(1),r1#(2)+r2#(2)+r3#(2),r1#(3)+r2#(3)+r3#(3),r1#(4)+r2#(4)+r3#(4))
    }
    calc def MeshMoments {
        in vertices : Real [*] ordered nonunique;
        in waterline : Real;
        in count : Integer;
        attribute rows : Real [*] ordered nonunique = (1..count)->ControlFunctions::collect { in i : Integer;
            WetMoment((1..12)->ControlFunctions::collect { in j : Integer; vertices#(12*(i-1)+j) },waterline) };
        return values : Real [4] ordered nonunique;
        (NumericalFunctions::sum((1..count)->ControlFunctions::collect { in i : Integer; rows#(4*i-3) }),
         NumericalFunctions::sum((1..count)->ControlFunctions::collect { in i : Integer; rows#(4*i-2) }),
         NumericalFunctions::sum((1..count)->ControlFunctions::collect { in i : Integer; rows#(4*i-1) }),
         NumericalFunctions::sum((1..count)->ControlFunctions::collect { in i : Integer; rows#(4*i) }))
    }
    calc def BalanceChecks {
        in massKg : Real;
        in densityKgM3 : Real;
        return positiveMassAndDensity : Real;
        if massKg > 0 and densityKgM3 > 0 ? 1.0 else 0.0
    }
    calc def Balance {
        in moments : Real [4] ordered nonunique;
        in centerOfGravity : Real [3] ordered nonunique;
        in massKg : Real;
        in densityKgM3 : Real;
        attribute g : Real = 9.80665;
        attribute massResidual : Real = densityKgM3*moments#(1)-massKg;
        attribute rollTorque : Real = g*(densityKgM3*moments#(3)-massKg*centerOfGravity#(2));
        attribute pitchTorque : Real = -g*(densityKgM3*moments#(2)-massKg*centerOfGravity#(1));
        return values : Real [3] ordered nonunique;
        (massResidual,rollTorque,pitchTorque)
    }


    calc def BuoyancyMomentSensitivity {
        in displacedVolumeM3 : Real;
        in signedHorizontalLeverM : Real;
        in waterDensityKgM3 : Real;
        return momentNm : Real;
        waterDensityKgM3 * 9.80665 * displacedVolumeM3 * signedHorizontalLeverM
    }
}
