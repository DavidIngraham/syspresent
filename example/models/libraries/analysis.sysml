package Analysis {
    package Marine {
        package Appendages {
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

        package Concept {
            private import ScalarValues::*;
            calc def Evaluate {
                in d : Real [29] ordered nonunique;
                in m : Real [21] ordered nonunique;
                in g : Real [60] ordered nonunique;
                in q : Real [24] ordered nonunique;
                in policy : Real [5] ordered nonunique;
                in voyage : Real [2] ordered nonunique;
                doc /* SI numerical boundary: voyage = conditional hours, maximum bus W.
                 * Policy = duration multiplier, delay hours, installed battery Wh/m3,
                 * equipment installed kg/m3, usable hull-volume fraction.
                 * No harvest credit: a finite-passage screening scenario, not perpetual
                 * energy balance or a completion deadline. Volume is necessary but not
                 * sufficient for local fit, access, watertightness or manufacturing. */
                attribute passageHours : Real = voyage#(1)*policy#(1)+policy#(2);
                attribute departureWh : Real = d#(17)*q#(16)*q#(17);
                attribute demandWh : Real = passageHours*(voyage#(2)/q#(15)+q#(20));
                attribute requiredWh : Real = demandWh+q#(23);
                attribute voyageEnergyMargin : Real = (departureWh-requiredWh)/100;
                attribute batteryVolumeM3 : Real = d#(17)/policy#(3);
                attribute equipmentVolumeM3 : Real = (m#(8)+m#(9)+m#(10))/policy#(4);
                attribute availableVolumeM3 : Real = (g#(5)-m#(14))*policy#(5);
                attribute installationVolumeMargin : Real = (availableVolumeM3-batteryVolumeM3-equipmentVolumeM3)/0.01;
                return result : Real [8] ordered nonunique;
                (voyageEnergyMargin,installationVolumeMargin,passageHours,departureWh,requiredWh,batteryVolumeM3,equipmentVolumeM3,availableVolumeM3)
            }
        }

        package Course {
            private import ScalarValues::*;
            calc def TackAverage {
                in a : Real; in b : Real; in lateralA : Real; in lateralB : Real;
                return vmg : Real;
                (a*RealFunctions::abs(lateralB)+b*RealFunctions::abs(lateralA))/(RealFunctions::abs(lateralA)+RealFunctions::abs(lateralB))
            }
            calc def Route {
                doc /* Policy element 6 scales positive-progress residuals; it is not a minimum ground-speed requirement. */
                in water : Real [8] ordered nonunique;
                in states : Real [48] ordered nonunique;
                in policy : Real [7] ordered nonunique;
                doc /* Cases ordered by wind 5 then 8 m/s, windward then leeward, tack + then -.
                 * Each state contains speed, heading, incidence, leeway, rudder and heel.
                 * Tack times cancel crosswind displacement. Equal time fractions per wind
                 * and 0.5/1.0 m/s downstream current are illustrative, not weather evidence.
                 * This is conditional on one persistent direction, not a probability
                 * distribution. Neither station hourly fractions nor scenario counts
                 * justify treating these equal speed weights as climatology.
                 * policy#5 is an optional duration budget in hours; zero disables that screen.
                 * policy#7 is 1 for easterly (upstream windward), 0 for westerly. */
                attribute cross0 : Real = states#(1)*TrigFunctions::sin(TrigFunctions::rad(states#(2)+states#(4)));
                attribute cross1 : Real = states#(7)*TrigFunctions::sin(TrigFunctions::rad(states#(8)+states#(10)));
                attribute cross2 : Real = states#(13)*TrigFunctions::sin(TrigFunctions::rad(states#(14)+states#(16)));
                attribute cross3 : Real = states#(19)*TrigFunctions::sin(TrigFunctions::rad(states#(20)+states#(22)));
                attribute cross4 : Real = states#(25)*TrigFunctions::sin(TrigFunctions::rad(states#(26)+states#(28)));
                attribute cross5 : Real = states#(31)*TrigFunctions::sin(TrigFunctions::rad(states#(32)+states#(34)));
                attribute cross6 : Real = states#(37)*TrigFunctions::sin(TrigFunctions::rad(states#(38)+states#(40)));
                attribute cross7 : Real = states#(43)*TrigFunctions::sin(TrigFunctions::rad(states#(44)+states#(46)));
                attribute vmg0 : Real = TackAverage(water#(1),water#(2),cross0,cross1);
                attribute vmg1 : Real = TackAverage(water#(3),water#(4),cross2,cross3);
                attribute vmg2 : Real = TackAverage(water#(5),water#(6),cross4,cross5);
                attribute vmg3 : Real = TackAverage(water#(7),water#(8),cross6,cross7);
                attribute windwardMean : Real = (vmg0+vmg2)/2;
                attribute leewardMean : Real = (vmg1+vmg3)/2;
                attribute downstream : Real = policy#(1)*(if policy#(7)>0.5 ? leewardMean else windwardMean)+(policy#(2)+policy#(3))/2;
                attribute upstream : Real = policy#(1)*(if policy#(7)>0.5 ? windwardMean else leewardMean)-(policy#(2)+policy#(3))/2;
                attribute duration : Real = if downstream>0 and upstream>0 ? policy#(4)/3600*(1/downstream+1/upstream) else 1000000.0;
                attribute downstreamProgress : Real = downstream/policy#(6);
                attribute upstreamProgress : Real = upstream/policy#(6);
                attribute durationMargin : Real = if policy#(5)>0 ? 1-duration/policy#(5) else 1.0;
                return result : Real [6] ordered nonunique;
                (downstreamProgress,upstreamProgress,durationMargin,downstream,upstream,duration)
            }
        }

        package Hydrostatics {
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

        package Propulsion {
            private import ScalarValues::*;
            calc def IdealAxialDiskPower {
                doc /* Steady ideal axial actuator disk. Inputs: thrust N, diameter m,
                 * fluid density kg/m3 and nonnegative axial inflow m/s. Output W.
                 * Excludes swirl/profile losses, installation effects, crossflow,
                 * ventilation and cavitation. Callers qualify the operating domain. */
                in thrustN : Real;
                in diameterM : Real;
                in densityKgM3 : Real;
                in axialSpeedMS : Real;
                attribute diskAreaM2 : Real = 3.141592653589793 * diameterM * diameterM / 4;
                attribute inducedSpeed : Real = (-axialSpeedMS + RealFunctions::sqrt(axialSpeedMS * axialSpeedMS + 2 * thrustN / (densityKgM3 * diskAreaM2))) / 2;
                return powerW : Real = thrustN * (axialSpeedMS + inducedSpeed);
            }
        }

        package Recovery {
            private import ScalarValues::*;
            calc def Segment {
                doc /* SI boundary: distance m, installed through-water speed m/s,
                 * along-track current m/s, cross-track current m/s, motor and essential
                 * battery withdrawal W, uncertainty multiplier. Output: feasible flag,
                 * ground speed m/s, transit s, protected energy Wh.
                 * Steady crab-angle compensation, no wave or acceleration model.
                 * Speed and power must be valid for the declared casualty state.
                 */
                in x : Real [7] ordered nonunique;
                attribute valid : Boolean = x#(1) >= 0 and x#(2) > 0 and x#(5) >= 0 and x#(6) > 0 and x#(7) >= 1;
                attribute authority : Boolean = valid and RealFunctions::abs(x#(4)) < x#(2);
                attribute ground : Real = if authority ? RealFunctions::sqrt(x#(2)*x#(2)-x#(4)*x#(4))+x#(3) else 0;
                attribute feasible : Boolean = authority and ground > 0;
                attribute duration : Real = if feasible ? x#(1)/ground else 0;
                attribute feasibleFlag : Real = if feasible ? 1 else 0;
                attribute protectedEnergy : Real = x#(7)*(x#(5)+x#(6))*duration/3600;
                return result : Real [4] ordered nonunique;
                (feasibleFlag,ground,duration,protectedEnergy)
            }
        }

        package Resistance {
            private import ScalarValues::*;
            doc /* Keuning and Katgert (2008), A Bare Hull Resistance Prediction Method
             * Derived from the Results of the Delft Systematic Yacht Hull Series Extended
             * to Higher Speeds, equation 1.7 and tables 1-2.
             * Source: https://www.scribd.com/document/346520042/Keuning-2008-pdf
             * Untrimmed, upright, bare-hull residuary resistance only. Not a total-drag,
             * heeled-hull, sail-induced trim, roughness or wave-added-resistance model.
             * Table-1 coordinate bounds are necessary screening limits, not evidence that
             * every combination inside their rectangular envelope is supported.
             * Beyond Fn 0.60 fewer hulls were tested; this implementation's admissible
             * domain stops at 0.60 pending speed-dependent coverage evidence. */
            calc def Coefficients {
                in fn : Real;
                attribute a0 : Real = if fn <= 0.20 ? -0.0005 + (fn - 0.15) / 0.05 * (-0.0003 - (-0.0005)) else if fn <= 0.25 ? -0.0003 + (fn - 0.20) / 0.05 * (-0.0002 - (-0.0003)) else if fn <= 0.30 ? -0.0002 + (fn - 0.25) / 0.05 * (-0.0009 - (-0.0002)) else if fn <= 0.35 ? -0.0009 + (fn - 0.30) / 0.05 * (-0.0026 - (-0.0009)) else if fn <= 0.40 ? -0.0026 + (fn - 0.35) / 0.05 * (-0.0064 - (-0.0026)) else if fn <= 0.45 ? -0.0064 + (fn - 0.40) / 0.05 * (-0.0218 - (-0.0064)) else if fn <= 0.50 ? -0.0218 + (fn - 0.45) / 0.05 * (-0.0388 - (-0.0218)) else if fn <= 0.55 ? -0.0388 + (fn - 0.50) / 0.05 * (-0.0347 - (-0.0388)) else if fn <= 0.60 ? -0.0347 + (fn - 0.55) / 0.05 * (-0.0361 - (-0.0347)) else if fn <= 0.65 ? -0.0361 + (fn - 0.60) / 0.05 * (0.0008 - (-0.0361)) else if fn <= 0.70 ? 0.0008 + (fn - 0.65) / 0.05 * (0.0108 - (0.0008)) else if fn <= 0.75 ? 0.0108 + (fn - 0.70) / 0.05 * (0.1023 - (0.0108)) else 0.1023;
                attribute a1 : Real = if fn <= 0.20 ? 0.0023 + (fn - 0.15) / 0.05 * (0.0059 - (0.0023)) else if fn <= 0.25 ? 0.0059 + (fn - 0.20) / 0.05 * (-0.0156 - (0.0059)) else if fn <= 0.30 ? -0.0156 + (fn - 0.25) / 0.05 * (0.0016 - (-0.0156)) else if fn <= 0.35 ? 0.0016 + (fn - 0.30) / 0.05 * (-0.0567 - (0.0016)) else if fn <= 0.40 ? -0.0567 + (fn - 0.35) / 0.05 * (-0.4034 - (-0.0567)) else if fn <= 0.45 ? -0.4034 + (fn - 0.40) / 0.05 * (-0.5261 - (-0.4034)) else if fn <= 0.50 ? -0.5261 + (fn - 0.45) / 0.05 * (-0.5986 - (-0.5261)) else if fn <= 0.55 ? -0.5986 + (fn - 0.50) / 0.05 * (-0.4764 - (-0.5986)) else if fn <= 0.60 ? -0.4764 + (fn - 0.55) / 0.05 * (0.0037 - (-0.4764)) else if fn <= 0.65 ? 0.0037 + (fn - 0.60) / 0.05 * (0.3728 - (0.0037)) else if fn <= 0.70 ? 0.3728 + (fn - 0.65) / 0.05 * (-0.1238 - (0.3728)) else if fn <= 0.75 ? -0.1238 + (fn - 0.70) / 0.05 * (0.7726 - (-0.1238)) else 0.7726;
                attribute a2 : Real = if fn <= 0.20 ? -0.0086 + (fn - 0.15) / 0.05 * (-0.0064 - (-0.0086)) else if fn <= 0.25 ? -0.0064 + (fn - 0.20) / 0.05 * (0.0031 - (-0.0064)) else if fn <= 0.30 ? 0.0031 + (fn - 0.25) / 0.05 * (0.0337 - (0.0031)) else if fn <= 0.35 ? 0.0337 + (fn - 0.30) / 0.05 * (0.0446 - (0.0337)) else if fn <= 0.40 ? 0.0446 + (fn - 0.35) / 0.05 * (-0.125 - (0.0446)) else if fn <= 0.45 ? -0.125 + (fn - 0.40) / 0.05 * (-0.2945 - (-0.125)) else if fn <= 0.50 ? -0.2945 + (fn - 0.45) / 0.05 * (-0.3038 - (-0.2945)) else if fn <= 0.55 ? -0.3038 + (fn - 0.50) / 0.05 * (-0.2361 - (-0.3038)) else if fn <= 0.60 ? -0.2361 + (fn - 0.55) / 0.05 * (-0.296 - (-0.2361)) else if fn <= 0.65 ? -0.296 + (fn - 0.60) / 0.05 * (-0.3667 - (-0.296)) else if fn <= 0.70 ? -0.3667 + (fn - 0.65) / 0.05 * (-0.2026 - (-0.3667)) else if fn <= 0.75 ? -0.2026 + (fn - 0.70) / 0.05 * (0.504 - (-0.2026)) else 0.504;
                attribute a3 : Real = if fn <= 0.20 ? -0.0015 + (fn - 0.15) / 0.05 * (0.007 - (-0.0015)) else if fn <= 0.25 ? 0.007 + (fn - 0.20) / 0.05 * (-0.0021 - (0.007)) else if fn <= 0.30 ? -0.0021 + (fn - 0.25) / 0.05 * (-0.0285 - (-0.0021)) else if fn <= 0.35 ? -0.0285 + (fn - 0.30) / 0.05 * (-0.1091 - (-0.0285)) else if fn <= 0.40 ? -0.1091 + (fn - 0.35) / 0.05 * (0.0273 - (-0.1091)) else if fn <= 0.45 ? 0.0273 + (fn - 0.40) / 0.05 * (0.2485 - (0.0273)) else if fn <= 0.50 ? 0.2485 + (fn - 0.45) / 0.05 * (0.6033 - (0.2485)) else if fn <= 0.55 ? 0.6033 + (fn - 0.50) / 0.05 * (0.8726 - (0.6033)) else if fn <= 0.60 ? 0.8726 + (fn - 0.55) / 0.05 * (0.9661 - (0.8726)) else if fn <= 0.65 ? 0.9661 + (fn - 0.60) / 0.05 * (1.3957 - (0.9661)) else if fn <= 0.70 ? 1.3957 + (fn - 0.65) / 0.05 * (1.1282 - (1.3957)) else if fn <= 0.75 ? 1.1282 + (fn - 0.70) / 0.05 * (1.7867 - (1.1282)) else 1.7867;
                attribute a4 : Real = if fn <= 0.20 ? 0.0061 + (fn - 0.15) / 0.05 * (0.0014 - (0.0061)) else if fn <= 0.25 ? 0.0014 + (fn - 0.20) / 0.05 * (-0.007 - (0.0014)) else if fn <= 0.30 ? -0.007 + (fn - 0.25) / 0.05 * (-0.0367 - (-0.007)) else if fn <= 0.35 ? -0.0367 + (fn - 0.30) / 0.05 * (-0.0707 - (-0.0367)) else if fn <= 0.40 ? -0.0707 + (fn - 0.35) / 0.05 * (-0.1341 - (-0.0707)) else if fn <= 0.45 ? -0.1341 + (fn - 0.40) / 0.05 * (-0.2428 - (-0.1341)) else if fn <= 0.50 ? -0.2428 + (fn - 0.45) / 0.05 * (-0.043 - (-0.2428)) else if fn <= 0.55 ? -0.043 + (fn - 0.50) / 0.05 * (0.4219 - (-0.043)) else if fn <= 0.60 ? 0.4219 + (fn - 0.55) / 0.05 * (0.6123 - (0.4219)) else if fn <= 0.65 ? 0.6123 + (fn - 0.60) / 0.05 * (1.0343 - (0.6123)) else if fn <= 0.70 ? 1.0343 + (fn - 0.65) / 0.05 * (1.1836 - (1.0343)) else if fn <= 0.75 ? 1.1836 + (fn - 0.70) / 0.05 * (2.1934 - (1.1836)) else 2.1934;
                attribute a5 : Real = if fn <= 0.20 ? 0.001 + (fn - 0.15) / 0.05 * (0.0013 - (0.001)) else if fn <= 0.25 ? 0.0013 + (fn - 0.20) / 0.05 * (0.0148 - (0.0013)) else if fn <= 0.30 ? 0.0148 + (fn - 0.25) / 0.05 * (0.0218 - (0.0148)) else if fn <= 0.35 ? 0.0218 + (fn - 0.30) / 0.05 * (0.0914 - (0.0218)) else if fn <= 0.40 ? 0.0914 + (fn - 0.35) / 0.05 * (0.3578 - (0.0914)) else if fn <= 0.45 ? 0.3578 + (fn - 0.40) / 0.05 * (0.6293 - (0.3578)) else if fn <= 0.50 ? 0.6293 + (fn - 0.45) / 0.05 * (0.8332 - (0.6293)) else if fn <= 0.55 ? 0.8332 + (fn - 0.50) / 0.05 * (0.899 - (0.8332)) else if fn <= 0.60 ? 0.899 + (fn - 0.55) / 0.05 * (0.7534 - (0.899)) else if fn <= 0.65 ? 0.7534 + (fn - 0.60) / 0.05 * (0.323 - (0.7534)) else if fn <= 0.70 ? 0.323 + (fn - 0.65) / 0.05 * (0.4973 - (0.323)) else if fn <= 0.75 ? 0.4973 + (fn - 0.70) / 0.05 * (-1.5479 - (0.4973)) else -1.5479;
                attribute a6 : Real = if fn <= 0.20 ? 0.0001 + (fn - 0.15) / 0.05 * (0.0005 - (0.0001)) else if fn <= 0.25 ? 0.0005 + (fn - 0.20) / 0.05 * (0.001 - (0.0005)) else if fn <= 0.30 ? 0.001 + (fn - 0.25) / 0.05 * (0.0015 - (0.001)) else if fn <= 0.35 ? 0.0015 + (fn - 0.30) / 0.05 * (0.0021 - (0.0015)) else if fn <= 0.40 ? 0.0021 + (fn - 0.35) / 0.05 * (0.0045 - (0.0021)) else if fn <= 0.45 ? 0.0045 + (fn - 0.40) / 0.05 * (0.0081 - (0.0045)) else if fn <= 0.50 ? 0.0081 + (fn - 0.45) / 0.05 * (0.0106 - (0.0081)) else if fn <= 0.55 ? 0.0106 + (fn - 0.50) / 0.05 * (0.0096 - (0.0106)) else if fn <= 0.60 ? 0.0096 + (fn - 0.55) / 0.05 * (0.01 - (0.0096)) else if fn <= 0.65 ? 0.01 + (fn - 0.60) / 0.05 * (0.0072 - (0.01)) else if fn <= 0.70 ? 0.0072 + (fn - 0.65) / 0.05 * (0.0038 - (0.0072)) else if fn <= 0.75 ? 0.0038 + (fn - 0.70) / 0.05 * (-0.0115 - (0.0038)) else -0.0115;
                attribute a7 : Real = if fn <= 0.20 ? 0.0052 + (fn - 0.15) / 0.05 * (-0.002 - (0.0052)) else if fn <= 0.25 ? -0.002 + (fn - 0.20) / 0.05 * (-0.0043 - (-0.002)) else if fn <= 0.30 ? -0.0043 + (fn - 0.25) / 0.05 * (-0.0172 - (-0.0043)) else if fn <= 0.35 ? -0.0172 + (fn - 0.30) / 0.05 * (-0.0078 - (-0.0172)) else if fn <= 0.40 ? -0.0078 + (fn - 0.35) / 0.05 * (0.1115 - (-0.0078)) else if fn <= 0.45 ? 0.1115 + (fn - 0.40) / 0.05 * (0.2086 - (0.1115)) else if fn <= 0.50 ? 0.2086 + (fn - 0.45) / 0.05 * (0.1336 - (0.2086)) else if fn <= 0.55 ? 0.1336 + (fn - 0.50) / 0.05 * (-0.2272 - (0.1336)) else if fn <= 0.60 ? -0.2272 + (fn - 0.55) / 0.05 * (-0.3352 - (-0.2272)) else if fn <= 0.65 ? -0.3352 + (fn - 0.60) / 0.05 * (-0.4632 - (-0.3352)) else if fn <= 0.70 ? -0.4632 + (fn - 0.65) / 0.05 * (-0.4477 - (-0.4632)) else if fn <= 0.75 ? -0.4477 + (fn - 0.70) / 0.05 * (-0.0977 - (-0.4477)) else -0.0977;
                return result : Real [8] ordered nonunique;
                (a0,a1,a2,a3,a4,a5,a6,a7)
            }
            calc def InputChecks {
                in h : Real [9] ordered nonunique;
                in speed : Real;
                in density : Real;
                in gravity : Real;
                attribute positiveInputs : Real = if h#(1) > 0 and h#(2) > 0 and h#(3) > 0 and h#(4) > 0 and h#(5) > 0 and h#(6) > 0 and h#(7) > 0 and h#(8) > 0 and h#(9) > 0 and speed > 0 and density > 0 and gravity > 0 ? 1.0 else 0.0;
                return result : Real;
                positiveInputs
            }
            calc def Evaluate {
                in h : Real [9] ordered nonunique;
                in speed : Real;
                in density : Real;
                in gravity : Real;
                doc /* h: upright static Lwl, Bwl, canoe-body draft, canoe-body displacement,
                 * waterplane area, LCB distance aft of forward perpendicular, LCF distance
                 * aft of forward perpendicular, prismatic coefficient, midship coefficient.
                 * Lengths metres, area m2, displacement m3; speed m/s, density kg/m3.
                 * Caller rejects nonpositive dimensions and any negative domain margin.
                 * Negative regression resistance is exposed, never silently clamped. */
                attribute fn : Real = speed / (gravity*h#(1))**0.5;
                attribute a : Real [8] ordered nonunique = Coefficients(fn);
                attribute lcb : Real = h#(6)/h#(1);
                attribute cp : Real = h#(8);
                attribute volumeArea : Real = h#(4)**(2.0/3.0)/h#(5);
                attribute beamLength : Real = h#(2)/h#(1);
                attribute centers : Real = h#(6)/h#(7);
                attribute volumeLength : Real = h#(4)**(1.0/3.0)/h#(1);
                attribute cm : Real = h#(9);
                attribute beamDraft : Real = h#(2)/h#(3);
                attribute ratio : Real = a#(1) + volumeLength * (a#(2)*lcb + a#(3)*cp + a#(4)*volumeArea + a#(5)*beamLength + a#(6)*centers + a#(7)*beamDraft + a#(8)*cm);
                attribute resistance : Real = ratio*density*gravity*h#(4);
                attribute resistance_N : Real = resistance;
                attribute resistance_weight_ratio : Real = ratio;
                attribute froude : Real = fn;
                attribute froude_lower : Real = fn-0.15;
                attribute froude_upper : Real = 0.60-fn;
                attribute lcb_lower : Real = lcb-0.500;
                attribute lcb_upper : Real = 0.582-lcb;
                attribute cp_lower : Real = cp-0.519;
                attribute cp_upper : Real = 0.599-cp;
                attribute volume_area_lower : Real = volumeArea-0.079;
                attribute volume_area_upper : Real = 0.265-volumeArea;
                attribute beam_length_lower : Real = beamLength-0.170;
                attribute beam_length_upper : Real = 0.366-beamLength;
                attribute center_ratio_lower : Real = centers-0.920;
                attribute center_ratio_upper : Real = 1.002-centers;
                attribute volume_length_lower : Real = volumeLength-0.120;
                attribute volume_length_upper : Real = 0.230-volumeLength;
                attribute cm_lower : Real = cm-0.646;
                attribute cm_upper : Real = 0.790-cm;
                attribute beam_draft_lower : Real = beamDraft-2.46;
                attribute beam_draft_upper : Real = 19.38-beamDraft;
                return result : Real [21] ordered nonunique;
                (resistance_N,resistance_weight_ratio,froude,froude_lower,froude_upper,lcb_lower,lcb_upper,cp_lower,cp_upper,volume_area_lower,volume_area_upper,beam_length_lower,beam_length_upper,center_ratio_lower,center_ratio_upper,volume_length_lower,volume_length_upper,cm_lower,cm_upper,beam_draft_lower,beam_draft_upper)
            }
        }

        package Sailing {
            private import ScalarValues::*;

            calc def Core {
                in d : Real [29] ordered nonunique;
                in p : Real [41] ordered nonunique;
                in q : Real [*] ordered nonunique;
                in s : Real [9] ordered nonunique;
                in aero : Real [3] ordered nonunique;
                in massData : Real [21] ordered nonunique;
                in hydro : Real [12] ordered nonunique;
                in surface : Real [9] ordered nonunique;
                // enabled, Fx, Fy, air roll moment, signed mast moment, min Va, max |CL|, added resistance, incidence margin
                doc /* s: wind, windward flag, fouling multiplier, speed, wind-from heading,
                 * incidence, leeway, rudder angle, heel (angles degrees). hydro:
                 * waterline Z, restoring moment, wetted hull area, then nine upright static
                 * canoe-body metrics from Analysis::Marine::Resistance::Evaluate. aero moment at midchord.
                 * Axes and equations preserve the existing body-frame convention. */
                attribute lwl_m : Real = hydro#(4);
                attribute beam_m : Real = d#(2);
                attribute sail_m2 : Real = d#(5);
                attribute sail_AR : Real = d#(6);
                attribute keel_m2 : Real = d#(11);
                attribute keel_span_m : Real = d#(12);
                attribute rudder_m2 : Real = d#(13);
                attribute rudder_span_m : Real = d#(14);
                attribute ballast_kg : Real = d#(16);
                attribute sail_x_fraction : Real = d#(10);
                attribute battery_Wh : Real = d#(17);
                attribute panel_m2 : Real = d#(18);
                attribute rudder_arm_fraction : Real = d#(15);
                attribute g : Real = p#(35);
                attribute rho_air : Real = p#(33);
                attribute rho_water : Real = p#(32);
                attribute rho_ballast : Real = p#(34);
                attribute nu_air : Real = p#(30);
                attribute nu_water : Real = p#(31);
                attribute foil_efficiency : Real = p#(28);
                attribute wing_cd0 : Real = p#(15);
                attribute foil_cd0 : Real = p#(29);
                attribute wing_cl_limit : Real = p#(16);
                attribute foil_cl_limit : Real = p#(27);
                attribute load_factor : Real = p#(36);
                attribute residuary_factor : Real = p#(25);
                attribute viscous_form_factor : Real = p#(26);
                attribute solar_resource_factor : Real = p#(12);
                attribute electronics_W : Real = p#(11);
                attribute foil_alpha_limit_deg : Real = q#(1);
                attribute rudder_inflow_ratio : Real = q#(2);
                attribute hinge_fraction : Real = q#(3);
                attribute friction_Nm : Real = q#(4);
                attribute max_froude : Real = q#(5);
                attribute min_wing_Re : Real = q#(6);
                attribute min_foil_Re : Real = q#(7);
                attribute control_speed_m_s : Real = q#(9);
                attribute control_wind_m_s : Real = q#(10);
                attribute peak_irradiance_W_m2 : Real = q#(11);
                attribute panel_efficiency : Real = q#(12);
                attribute harvest_efficiency : Real = q#(13);
                attribute charge_efficiency : Real = q#(14);
                attribute discharge_efficiency : Real = q#(15);
                attribute usable_fraction : Real = q#(16);
                attribute initial_fraction : Real = q#(17);
                attribute charge_C_rate : Real = q#(18);
                attribute discharge_C_rate : Real = q#(19);
                attribute self_discharge_W : Real = q#(20);
                attribute dark_hours : Real = q#(21);
                attribute solar_hours : Real = q#(22);
                attribute reserve_Wh : Real = q#(23);
                attribute yaw_reserve_Nm : Real = q#(8);
                attribute wind : Real = s#(1);
                attribute upwind : Boolean = s#(2) > 0.5;
                attribute foul : Real = s#(3);
                attribute v : Real = s#(4);
                attribute theta : Real = TrigFunctions::rad(s#(5));
                attribute alpha : Real = TrigFunctions::rad(s#(6));
                attribute beta : Real = TrigFunctions::rad(s#(7));
                attribute delta : Real = TrigFunctions::rad(s#(8));
                attribute heel : Real = TrigFunctions::rad(s#(9));
                attribute cb : Real = TrigFunctions::cos(beta);
                attribute sb : Real = TrigFunctions::sin(beta);
                attribute ch : Real = TrigFunctions::cos(heel);
                attribute wingHeight : Real = RealFunctions::sqrt(sail_m2 * sail_AR);
                attribute wingChord : Real = sail_m2 / wingHeight;
                attribute keelChord : Real = keel_m2 / keel_span_m;
                attribute rudderChord : Real = rudder_m2 / rudder_span_m;
                attribute mass : Real = massData#(1);
                attribute draft : Real = hydro#(1)+d#(3);
                attribute wingZ : Real = d#(4)+wingHeight/2-hydro#(1);
                attribute keelZ : Real = draft+keel_span_m/2;
                attribute rudderZ : Real = draft+rudder_span_m/2;
                attribute righting : Real = hydro#(2);
                attribute awx : Real = wind * TrigFunctions::cos(theta) + v * cb;
                attribute awy : Real = wind * TrigFunctions::sin(theta) - v * sb;
                attribute va : Real = RealFunctions::sqrt(awx * awx + awy * awy);
                attribute qa : Real = 0.5 * rho_air * va * va;
                attribute cl : Real = aero#(1)*p#(17);
                attribute cd : Real = (aero#(2)+p#(15))*p#(18);
                attribute xs : Real = if surface#(1)>0.5 ? surface#(2) else qa * sail_m2 * (cl * ch * awy - cd * awx) / va;
                attribute ys : Real = if surface#(1)>0.5 ? surface#(3) else qa * sail_m2 * (cl * ch * awx + cd * awy) / va;
                attribute drive : Real = xs * cb + ys * sb;
                attribute sideNormal : Real = ys * cb - xs * sb;
                attribute qk : Real = 0.5 * rho_water * v * v;
                attribute qr : Real = qk * rudder_inflow_ratio * rudder_inflow_ratio;
                attribute ark : Real = keel_span_m * keel_span_m / keel_m2;
                attribute arr : Real = rudder_span_m * rudder_span_m / rudder_m2;
                attribute foilAlphaLimit : Real = TrigFunctions::rad(foil_alpha_limit_deg);
                attribute clk : Real = 2 * TrigFunctions::pi / (1 + 2 / (foil_efficiency * ark)) * beta * ch;
                attribute clr : Real = 2 * TrigFunctions::pi / (1 + 2 / (foil_efficiency * arr)) * (beta + delta) * ch;
                attribute lk : Real = qk * keel_m2 * clk * ch;
                attribute lr : Real = qr * rudder_m2 * clr * ch;
                attribute dk : Real = qk * keel_m2 * (foil_cd0 * foul + clk * clk / (TrigFunctions::pi * foil_efficiency * ark));
                attribute dr : Real = qr * rudder_m2 * (foil_cd0 * foul + clr * clr / (TrigFunctions::pi * foil_efficiency * arr));
                attribute fn : Real = v / RealFunctions::sqrt(g * lwl_m);
                attribute hullRe : Real = v * lwl_m / nu_water;
                attribute logRe : Real = OpenSysMLMathFunctions::ln(hullRe) / OpenSysMLMathFunctions::ln(10);
                attribute cf : Real = 0.075 / ((logRe - 2) * (logRe - 2));
                attribute wetted : Real = hydro#(3);
                attribute delft : Real [21] ordered nonunique = Analysis::Marine::Resistance::Evaluate((hydro#(4),hydro#(5),hydro#(6),hydro#(7),hydro#(8),hydro#(9),hydro#(10),hydro#(11),hydro#(12)),v,rho_water,g);
                attribute hullDrag : Real = qk * wetted * cf * viscous_form_factor * foul + residuary_factor*delft#(1);
                attribute resistance : Real = hullDrag + dk + dr + surface#(8);
                attribute sailX : Real = sail_x_fraction * d#(1);
                attribute rudderX : Real = -rudder_arm_fraction * d#(1);
                attribute heeling : Real = (if surface#(1)>0.5 ? surface#(4) else ys * wingZ * ch) + ((lk * cb + dk * sb) * keelZ + (lr * cb + dr * sb) * rudderZ + hullDrag * sb * draft / 2) * ch;
                attribute rudderTorque : Real = qr * rudder_m2 * RealFunctions::sqrt(clr * clr + foil_cd0 * foil_cd0) * hinge_fraction * rudderChord + friction_Nm;
                attribute rudderEnvelopeTorque : Real = qr * rudder_m2 * foil_cl_limit * hinge_fraction * rudderChord + friction_Nm;
                attribute waterVMG : Real = (if upwind ? 1 else -1) * v * TrigFunctions::cos(theta + beta);
                attribute wingRe : Real = (if surface#(1)>0.5 ? surface#(6) else va) * wingChord / nu_air;
                attribute keelRe : Real = v * keelChord / nu_water;
                attribute rudderRe : Real = v * rudder_inflow_ratio * rudderChord / nu_water;
                attribute normalCoefficient : Real = cl*TrigFunctions::cos(alpha)+cd*TrigFunctions::sin(alpha);
                attribute mastMomentCoefficient : Real = aero#(3)*q#(24)+((if s#(5)<0 ? 1-d#(9) else d#(9))-0.5)*normalCoefficient;
                attribute wingTorque : Real = if surface#(1)>0.5 ? RealFunctions::abs(surface#(5))+friction_Nm else Analysis::Energy::Actuation::MastTorque(rho_air,va,sail_m2,wingChord,mastMomentCoefficient,friction_Nm);
                attribute wingPower : Real [3] ordered nonunique = Analysis::Energy::Actuation::DrivePower(wingTorque,p#(19),p#(3),p#(2),p#(4),p#(5),p#(6),p#(7),p#(8));
                attribute rudderPower : Real [3] ordered nonunique = Analysis::Energy::Actuation::DrivePower(rudderTorque,p#(20),p#(3),1,1,0.1,p#(9)*rudderTorque,p#(10),1-p#(10));
                attribute averagePower : Real = electronics_W+wingPower#(1)+rudderPower#(1);
                attribute peakPower : Real = electronics_W+wingPower#(2)+rudderPower#(2);
                attribute harvestPower : Real = panel_m2 * peak_irradiance_W_m2 * panel_efficiency * harvest_efficiency * solar_resource_factor;
                attribute nightRate : Real = -averagePower / discharge_efficiency - self_discharge_W;
                attribute dayRate : Real = (if harvestPower >= averagePower ? NumericalFunctions::min((harvestPower - averagePower) * charge_efficiency, charge_C_rate * battery_Wh) else (harvestPower - averagePower) / discharge_efficiency) - self_discharge_W;
                attribute cycleEnergy : Real = dark_hours * nightRate + solar_hours * dayRate;
                attribute reserveMargin : Real = initial_fraction * usable_fraction * battery_Wh + dark_hours * nightRate - reserve_Wh;
                attribute surgeResidual : Real = (drive-resistance)/10;
                attribute swayResidual : Real = (sideNormal-lk-lr)/10;
                attribute yawResidual : Real = (-ys*sailX+(lr*cb+dr*sb)*rudderX-(if surface#(1)>0.5 ? surface#(5) else qa*sail_m2*wingChord*mastMomentCoefficient))/10;
                attribute rollResidual : Real = (righting-heeling)/20;
                attribute wingLiftMargin : Real = if surface#(1)>0.5 ? NumericalFunctions::min(1-surface#(7)/wing_cl_limit,surface#(9)) else 1-RealFunctions::abs(cl)/wing_cl_limit;
                attribute keelLiftMargin : Real = 1-RealFunctions::abs(clk)/foil_cl_limit;
                attribute rudderLiftMargin : Real = 1-RealFunctions::abs(clr)/foil_cl_limit;
                attribute keelAngleMargin : Real = 1-RealFunctions::abs(beta*ch)/foilAlphaLimit;
                attribute rudderAngleMargin : Real = 1-RealFunctions::abs((beta+delta)*ch)/foilAlphaLimit;
                attribute wingDriveMargin : Real = 1-load_factor*wingTorque/d#(19);
                attribute rudderDriveMargin : Real = 1-load_factor*rudderEnvelopeTorque/d#(20);
                attribute froudeMargin : Real = 1-fn/max_froude;
                attribute wingReMargin : Real = wingRe/min_wing_Re-1;
                attribute keelReMargin : Real = keelRe/min_foil_Re-1;
                attribute rudderReMargin : Real = rudderRe/min_foil_Re-1;
                attribute cycleMargin : Real = cycleEnergy/100;
                attribute reserveMarginScaled : Real = reserveMargin/100;
                attribute peakMargin : Real = (discharge_C_rate*battery_Wh-peakPower/discharge_efficiency-self_discharge_W)/100;
                attribute wingResultant : Real = if surface#(1)>0.5 ? RealFunctions::sqrt(xs*xs+ys*ys) else qa*sail_m2*RealFunctions::sqrt(cl*cl+cd*cd);
                attribute keelResultant : Real = RealFunctions::sqrt(lk*lk+dk*dk);
                attribute rudderResultant : Real = RealFunctions::sqrt(lr*lr+dr*dr);
                attribute delftResistanceMargin : Real = delft#(2);
                attribute delftDomain4 : Real = delft#(4);
                attribute delftDomain5 : Real = delft#(5);
                attribute delftDomain6 : Real = delft#(6);
                attribute delftDomain7 : Real = delft#(7);
                attribute delftDomain8 : Real = delft#(8);
                attribute delftDomain9 : Real = delft#(9);
                attribute delftDomain10 : Real = delft#(10);
                attribute delftDomain11 : Real = delft#(11);
                attribute delftDomain12 : Real = delft#(12);
                attribute delftDomain13 : Real = delft#(13);
                attribute delftDomain14 : Real = delft#(14);
                attribute delftDomain15 : Real = delft#(15);
                attribute delftDomain16 : Real = delft#(16);
                attribute delftDomain17 : Real = delft#(17);
                attribute delftDomain18 : Real = delft#(18);
                attribute delftDomain19 : Real = delft#(19);
                attribute delftDomain20 : Real = delft#(20);
                attribute delftDomain21 : Real = delft#(21);
                return result : Real [*] ordered nonunique;
                (surgeResidual, swayResidual, yawResidual, rollResidual, wingLiftMargin, keelLiftMargin, rudderLiftMargin, keelAngleMargin, rudderAngleMargin, wingDriveMargin, rudderDriveMargin, froudeMargin, wingReMargin, keelReMargin, rudderReMargin, cycleMargin, reserveMarginScaled, peakMargin, waterVMG, v, cl, cd, clk, clr, drive, resistance, heeling, righting, wingTorque, rudderTorque, averagePower, peakPower, harvestPower, cycleEnergy, reserveMargin, wingRe, keelRe, rudderRe, ys, lk, lr, hullDrag, dk, dr, wingResultant, keelResultant, rudderResultant, delftResistanceMargin, delftDomain4, delftDomain5, delftDomain6, delftDomain7, delftDomain8, delftDomain9, delftDomain10, delftDomain11, delftDomain12, delftDomain13, delftDomain14, delftDomain15, delftDomain16, delftDomain17, delftDomain18, delftDomain19, delftDomain20, delftDomain21)
            }




            calc def Evaluate {
                in d : Real [29] ordered nonunique;
                in p : Real [41] ordered nonunique;
                in q : Real [*] ordered nonunique;
                in s : Real [9] ordered nonunique;
                in aero : Real [3] ordered nonunique;
                in massData : Real [21] ordered nonunique;
                in hydro : Real [12] ordered nonunique;
                return result : Real [*] ordered nonunique;
                Core(d,p,q,s,aero,massData,hydro,(hydro#(1)*0,hydro#(1)*0,hydro#(1)*0,hydro#(1)*0,hydro#(1)*0,hydro#(1)*0,hydro#(1)*0,hydro#(1)*0,hydro#(1)*0))
            }
            calc def InputChecks {
                doc /* Executable numerical preconditions shared by scalar and batch
                 * operating evaluation. Each output is one for valid, zero otherwise. */
                in p : Real [41] ordered nonunique;
                in s : Real [9] ordered nonunique;
                in hydro : Real [12] ordered nonunique;
                attribute driveEfficiencies : Real = if p#(2) > 0 and p#(2) <= 1 and p#(3) > 0 and p#(3) <= 1 ? 1.0 else 0.0;
                attribute wingDuty : Real = if p#(7) >= 0 and p#(8) >= 0 and p#(7)+p#(8) <= 1.000000000001 ? 1.0 else 0.0;
                attribute rudderDuty : Real = if p#(10) >= 0 and p#(10) <= 1 ? 1.0 else 0.0;
                attribute positiveSpeed : Real = if s#(4) > 0 ? 1.0 else 0.0;
                attribute positiveWettedArea : Real = if hydro#(3) > 0 ? 1.0 else 0.0;
                return result : Real [5] ordered nonunique;
                (driveEfficiencies,wingDuty,rudderDuty,positiveSpeed,positiveWettedArea)
            }
        }

        package Surface {
            private import ScalarValues::*;
            doc /* SI magnitudes. Neutral log profile and strip quadrature are a first
             * surface-layer screen, not a stability-corrected wave boundary-layer model.
             * Wave resistance is an explicitly uncalibrated sensitivity coefficient.
             * Deep-water wave/current action transport assumes slow spatial variation;
             * a uniform river current is not itself a shoaling transition. */
            calc def WindSample {
                in x : Real [9] ordered nonunique;
                // reference wind, reference height, roughness, sample height, heading,
                // vessel speed, leeway (radians), shear enabled, minimum valid height.
                attribute height : Real = NumericalFunctions::max(x#(4),x#(9));
                attribute ratio : Real = if x#(8)>0.5 ? OpenSysMLMathFunctions::ln(height/x#(3))/OpenSysMLMathFunctions::ln(x#(2)/x#(3)) else 1;
                attribute ax : Real = x#(1)*ratio*TrigFunctions::cos(x#(5))+x#(6)*TrigFunctions::cos(x#(7));
                attribute ay : Real = x#(1)*ratio*TrigFunctions::sin(x#(5))-x#(6)*TrigFunctions::sin(x#(7));
                attribute speed : Real = RealFunctions::sqrt(ax*ax+ay*ay);
                attribute heightMargin : Real = x#(4)/x#(9)-1;
                return result : Real [5] ordered nonunique;
                (ratio,ax,ay,speed,heightMargin)
            }
            calc def StripLoad {
                in x : Real [10] ordered nonunique;
                // rho, strip area, apparent x/y, heel rad, height above mean water,
                // CL, CD, chord, signed mast moment coefficient.
                attribute va : Real = RealFunctions::sqrt(x#(3)*x#(3)+x#(4)*x#(4));
                attribute pressureArea : Real = 0.5*x#(1)*va*va*x#(2);
                attribute xs : Real = pressureArea*(x#(7)*TrigFunctions::cos(x#(5))*x#(4)-x#(8)*x#(3))/va;
                attribute ys : Real = pressureArea*(x#(7)*TrigFunctions::cos(x#(5))*x#(3)+x#(8)*x#(4))/va;
                attribute rollMoment : Real = ys*x#(6);
                attribute mastMoment : Real = pressureArea*x#(9)*x#(10);
                return result : Real [4] ordered nonunique;
                (xs,ys,rollMoment,mastMoment)
            }
            calc def FetchSea {
                in x : Real [3] ordered nonunique;
                // reference 10 m wind, effective fetch, gravity; SMB deep-water growth.
                attribute wind : Real = NumericalFunctions::max(x#(1),0.1);
                attribute fetch : Real = x#(3)*x#(2)/(wind*wind);
                attribute hArg : Real = 0.0125*OpenSysMLMathFunctions::exp(0.42*OpenSysMLMathFunctions::ln(fetch));
                attribute tArg : Real = 0.077*OpenSysMLMathFunctions::exp(0.25*OpenSysMLMathFunctions::ln(fetch));
                attribute hTanh : Real = (1-OpenSysMLMathFunctions::exp(-2*hArg))/(1+OpenSysMLMathFunctions::exp(-2*hArg));
                attribute tTanh : Real = (1-OpenSysMLMathFunctions::exp(-2*tArg))/(1+OpenSysMLMathFunctions::exp(-2*tArg));
                attribute height : Real = if x#(1)>0 ? 0.283*wind*wind/x#(3)*hTanh else 0;
                attribute period : Real = NumericalFunctions::max(1,2*TrigFunctions::pi*1.2*wind/x#(3)*tTanh);
                return result : Real [2] ordered nonunique;
                (height,period)
            }
            calc def SpeedRetention {
                in x : Real [2] ordered nonunique;
                // Added resistance and calm-water resistance at the solved state.
                // Local R ~ V^2 and unchanged available thrust: sensitivity, not a VPP.
                attribute ratio : Real = RealFunctions::sqrt(NumericalFunctions::max(0,1-x#(1)/x#(2)));
                return result : Real [1] ordered nonunique;
                (ratio)
            }
            calc def WaveScreen {
                in x : Real [13] ordered nonunique;
                // incident Hs, absolute period, current along propagation, L, B,
                // water-relative speed, cos(wave-to minus heading), resistance coeff,
                // freeboard, wing-root height, appendage-tip immersion, g, rho.
                attribute omega : Real = 2*TrigFunctions::pi/x#(2);
                attribute discriminant : Real = x#(12)+4*x#(3)*omega;
                attribute root : Real = RealFunctions::sqrt(NumericalFunctions::max(discriminant,0.000001));
                attribute sqrtK : Real = 2*omega/(root+RealFunctions::sqrt(x#(12)));
                attribute k : Real = sqrtK*sqrtK;
                attribute sigma : Real = RealFunctions::sqrt(x#(12)*k);
                attribute groupSpeed : Real = 0.5*RealFunctions::sqrt(x#(12)/k);
                attribute absoluteGroup : Real = groupSpeed+x#(3);
                attribute incidentGroup : Real = x#(12)/(2*omega);
                attribute height : Real = x#(1)*RealFunctions::sqrt(sigma*incidentGroup/(omega*NumericalFunctions::max(absoluteGroup,0.000001)));
                attribute wavelength : Real = 2*TrigFunctions::pi/k;
                attribute encounter : Real = RealFunctions::abs(sigma-k*x#(6)*x#(7));
                attribute coupling : Real = NumericalFunctions::min(1,k*k*x#(4)*x#(4));
                attribute resistance : Real = x#(8)*x#(13)*x#(12)*x#(5)*height*height/16*coupling*(0.25+0.375*(1-x#(7)));
                attribute blockingMargin : Real = discriminant/x#(12);
                attribute steepnessMargin : Real = 0.1-height/wavelength;
                attribute hullClearance : Real = x#(9)-height;
                attribute wingClearance : Real = x#(10)-height;
                attribute appendageImmersion : Real = x#(11)-height;
                return result : Real [9] ordered nonunique;
                (height,wavelength,encounter,resistance,blockingMargin,steepnessMargin,hullClearance,wingClearance,appendageImmersion)
            }
            calc def HarmonicResponse {
                in x : Real [7] ordered nonunique;
                // Wave amplitude, wavenumber, signed encounter frequency, phase,
                // relative propagation heading, heave gain, slope gain. Wave phase
                // increases as k*x - omega*t; pitch is rotation about body +y.
                attribute a : Real = x#(1);
                attribute phase : Real = x#(4);
                attribute slope : Real = -a*x#(2)*TrigFunctions::sin(phase)*x#(7);
                attribute slopeRate : Real = a*x#(2)*x#(3)*TrigFunctions::cos(phase)*x#(7);
                attribute heave : Real = a*TrigFunctions::cos(phase)*x#(6);
                attribute pitch : Real = -slope*TrigFunctions::cos(x#(5));
                attribute roll : Real = slope*TrigFunctions::sin(x#(5));
                attribute heaveRate : Real = a*x#(3)*TrigFunctions::sin(phase)*x#(6);
                attribute pitchRate : Real = -slopeRate*TrigFunctions::cos(x#(5));
                attribute rollRate : Real = slopeRate*TrigFunctions::sin(x#(5));
                return result : Real [6] ordered nonunique;
                (heave,pitch,roll,heaveRate,pitchRate,rollRate)
            }
        }

        package WavePerformance {
            private import ScalarValues::*;
            calc def OrbitalVelocity {
                in x : Real [7] ordered nonunique;
                // amplitude, k, intrinsic omega, depth z<=0, phase, direction, gravity.
                attribute decay : Real = OpenSysMLMathFunctions::exp(x#(2)*NumericalFunctions::min(x#(4),0));
                attribute scale : Real = x#(1)*x#(3)*decay;
                attribute vx : Real = scale*TrigFunctions::cos(x#(5))*TrigFunctions::cos(x#(6));
                attribute vy : Real = scale*TrigFunctions::cos(x#(5))*TrigFunctions::sin(x#(6));
                attribute vz : Real = scale*TrigFunctions::sin(x#(5));
                return result : Real [3] ordered nonunique;
                (vx,vy,vz)
            }
            calc def FoilLoad {
                in x : Real [12] ordered nonunique;
                // rho, area, span, relative speed, incidence rad, heel rad,
                // efficiency, profile Cd, fouling, CL limit, alpha limit rad, wet fraction.
                attribute ar : Real = x#(3)*x#(3)/x#(2);
                attribute cl : Real = 2*TrigFunctions::pi/(1+2/(x#(7)*ar))*x#(5)*TrigFunctions::cos(x#(6));
                attribute pressure : Real = 0.5*x#(1)*x#(4)*x#(4)*x#(2)*x#(12);
                attribute lift : Real = pressure*cl*TrigFunctions::cos(x#(6));
                attribute drag : Real = pressure*(x#(8)*x#(9)+cl*cl/(TrigFunctions::pi*x#(7)*ar));
                attribute liftMargin : Real = 1-RealFunctions::abs(cl)/x#(10);
                attribute angleMargin : Real = 1-RealFunctions::abs(x#(5)*TrigFunctions::cos(x#(6)))/x#(11);
                return result : Real [4] ordered nonunique;
                (lift,drag,liftMargin,angleMargin)
            }
            calc def ImpedanceTerm {
                in x : Real [6] ordered nonunique;
                // encounter omega, rigid mass, added mass, stiffness, radiation damping, extra damping.
                attribute realPart : Real = x#(4)-x#(1)*x#(1)*(x#(2)+x#(3));
                attribute imaginaryPart : Real = -x#(1)*(x#(5)+x#(6));
                return result : Real [2] ordered nonunique;
                (realPart,imaginaryPart)
            }
            calc def BalanceCorrection {
                in x : Real [12] ordered nonunique;
                // baseline four normalized residuals; old/new total appendage drag,
                // old/new total lift; old/new water yaw moment; old/new water roll moment.
                attribute surgeResidual : Real = x#(1)+(x#(5)-x#(6))/10;
                attribute swayResidual : Real = x#(2)+(x#(7)-x#(8))/10;
                attribute yawResidual : Real = x#(3)+(x#(10)-x#(9))/10;
                attribute rollResidual : Real = x#(4)+(x#(11)-x#(12))/20;
                return result : Real [4] ordered nonunique;
                (surgeResidual,swayResidual,yawResidual,rollResidual)
            }
            calc def Actuation {
                in p : Real [41] ordered nonunique;
                in q : Real [*] ordered nonunique;
                in x : Real [3] ordered nonunique;
                // Wing torque, rudder torque, battery Wh; same duty model as Core.
                attribute wing : Real [3] ordered nonunique = Analysis::Energy::Actuation::DrivePower(x#(1),p#(19),p#(3),p#(2),p#(4),p#(5),p#(6),p#(7),p#(8));
                attribute rudder : Real [3] ordered nonunique = Analysis::Energy::Actuation::DrivePower(x#(2),p#(20),p#(3),1,1,0.1,p#(9)*x#(2),p#(10),1-p#(10));
                attribute peak : Real = p#(11)+wing#(2)+rudder#(2);
                attribute averagePower : Real = p#(11)+wing#(1)+rudder#(1);
                attribute peakMargin : Real = (q#(19)*x#(3)-peak/q#(15)-q#(20))/100;
                return result : Real [3] ordered nonunique;
                (averagePower,peak,peakMargin)
            }
        }

        package Weather {
            private import ScalarValues::*;
            calc def TwoRegimeCoverage {
                in eastProbability : Real;
                in westPass : Boolean;
                in eastPass : Boolean;
                return coverage : Real;
                (1-eastProbability)*(if westPass ? 1 else 0) + eastProbability*(if eastPass ? 1 else 0)
            }
            calc def ConditionalPassageHours {
                in eastProbability : Real;
                in westPass : Boolean;
                in eastPass : Boolean;
                in westHours : Real;
                in eastHours : Real;
                attribute coverage : Real = TwoRegimeCoverage(eastProbability,westPass,eastPass);
                return hours : Real;
                if coverage > 0 ? ((1-eastProbability)*(if westPass ? westHours else 0) + eastProbability*(if eastPass ? eastHours else 0))/coverage else 0
            }
            doc /* Arithmetic for two mutually exclusive full-passage regime hypotheses.
             * Caller must validate 0<=p<=1, finite nonnegative times for passing cases,
             * and report coverage=0 as no conditional time (not a zero-hour passage).
             * Station hourly direction fractions are not full-passage probabilities.
             * Coverage is a route-screen sensitivity, not system reliability. */
        }
    }
    package Mechanics {
        package Mass {
            private import ScalarValues::*;

            calc def MassProperties {
                in d : Real [29] ordered nonunique;
                in p : Real [41] ordered nonunique;
                in m : Real [10] ordered nonunique;
                in geometry : Real [51] ordered nonunique;
                doc /* Four bodies: hull, wing, keel, rudder. Each geometry block is
                 * skin area; skin centroid XYZ; enclosed volume; volume centroid XYZ;
                 * minimum thin-wall inertia/thickness; worst bending modulus/thickness;
                 * root enclosed area; root perimeter. Last three inputs: ballast centroid XYZ. Geometry units are SI.
                 * Foil ribs are unperforated transverse diaphragms. Hull ribs follow
                 * a surface-density allocation. Neither earns FDM bending credit. */
                attribute seamKgM2 : Real = 2*m#(1)/m#(2)*m#(3)*(1+p#(1));
                attribute hullSkinKg : Real = geometry#(1)*(m#(4)*m#(5)+d#(21)*(1+p#(1))+m#(6)+seamKgM2);
                attribute hullRibVolume : Real = geometry#(1)*2*m#(5)*m#(7)/d#(25);
                attribute hullRibKg : Real = m#(4)*hullRibVolume;
                attribute hullMass : Real = hullSkinKg+hullRibKg;
                attribute hullMaterialVolume : Real = geometry#(1)*(m#(5)+d#(21)/m#(8)+d#(21)*p#(1)/m#(9))+hullRibVolume;
                attribute wingSkinKg : Real = geometry#(13)*(m#(4)*m#(10)+d#(22)*(1+p#(1))+m#(6)+seamKgM2);
                attribute wingRibVolume : Real = geometry#(17)*m#(5)/d#(26);
                attribute wingRibKg : Real = m#(4)*wingRibVolume;
                attribute wingMass : Real = wingSkinKg+wingRibKg;
                attribute wingMaterialVolume : Real = geometry#(13)*(m#(10)+d#(22)/m#(8)+d#(22)*p#(1)/m#(9))+wingRibVolume;
                attribute keelSkinKg : Real = geometry#(25)*(m#(4)*m#(10)+d#(23)*(1+p#(1))+m#(6)+seamKgM2);
                attribute keelRibVolume : Real = geometry#(29)*m#(5)/d#(26);
                attribute keelRibKg : Real = m#(4)*keelRibVolume;
                attribute keelMass : Real = keelSkinKg+keelRibKg;
                attribute keelMaterialVolume : Real = geometry#(25)*(m#(10)+d#(23)/m#(8)+d#(23)*p#(1)/m#(9))+keelRibVolume;
                attribute rudderSkinKg : Real = geometry#(37)*(m#(4)*m#(10)+d#(24)*(1+p#(1))+m#(6)+seamKgM2);
                attribute rudderRibVolume : Real = geometry#(41)*m#(5)/d#(26);
                attribute rudderRibKg : Real = m#(4)*rudderRibVolume;
                attribute rudderMass : Real = rudderSkinKg+rudderRibKg;
                attribute rudderMaterialVolume : Real = geometry#(37)*(m#(10)+d#(24)/m#(8)+d#(24)*p#(1)/m#(9))+rudderRibVolume;
                attribute batteryMass : Real = d#(17)/p#(13);
                attribute panelMass : Real = 2*d#(18);
                attribute wingDriveMass : Real = p#(22)+p#(21)*d#(19);
                attribute rudderDriveMass : Real = 0.08+p#(21)*d#(20);
                attribute equipmentMass : Real = p#(23)+p#(24)+p#(39);
                attribute totalMass : Real = hullMass+wingMass+keelMass+rudderMass+d#(16)+batteryMass+panelMass+wingDriveMass+rudderDriveMass+equipmentMass;
                attribute moment0 : Real = hullSkinKg*geometry#(2)+hullRibKg*geometry#(2)+wingSkinKg*geometry#(14)+wingRibKg*geometry#(18)+keelSkinKg*geometry#(26)+keelRibKg*geometry#(30)+rudderSkinKg*geometry#(38)+rudderRibKg*geometry#(42)+batteryMass*d#(27)*d#(1)+wingDriveMass*d#(10)*d#(1)+-rudderDriveMass*d#(15)*d#(1)+d#(16)*geometry#(49)+p#(39)*p#(40)*d#(1);
                attribute moment1 : Real = hullSkinKg*geometry#(3)+hullRibKg*geometry#(3)+wingSkinKg*geometry#(15)+wingRibKg*geometry#(19)+keelSkinKg*geometry#(27)+keelRibKg*geometry#(31)+rudderSkinKg*geometry#(39)+rudderRibKg*geometry#(43)+d#(16)*geometry#(50);
                attribute moment2 : Real = hullSkinKg*geometry#(4)+hullRibKg*geometry#(4)+wingSkinKg*geometry#(16)+wingRibKg*geometry#(20)+keelSkinKg*geometry#(28)+keelRibKg*geometry#(32)+rudderSkinKg*geometry#(40)+rudderRibKg*geometry#(44)+d#(16)*geometry#(51)+batteryMass*(-d#(3)+(d#(3)+d#(4))*d#(28))+panelMass*d#(4)+-(wingDriveMass+rudderDriveMass+equipmentMass-p#(39))*d#(3)/2+p#(39)*(d#(4)+p#(41));
                attribute cgX : Real = moment0/totalMass;
                attribute cgY : Real = moment1/totalMass;
                attribute cgZ : Real = moment2/totalMass;
                attribute hullLaminateThickness : Real = d#(21)/m#(8)+d#(21)*p#(1)/m#(9);
                attribute wingLaminateThickness : Real = d#(22)/m#(8)+d#(22)*p#(1)/m#(9);
                attribute keelLaminateThickness : Real = d#(23)/m#(8)+d#(23)*p#(1)/m#(9);
                attribute rudderLaminateThickness : Real = d#(24)/m#(8)+d#(24)*p#(1)/m#(9);
                return result : Real [*] ordered nonunique;
                (totalMass, hullMass, wingMass, keelMass, rudderMass, batteryMass, panelMass, wingDriveMass, rudderDriveMass, equipmentMass,
                 cgX,cgY,cgZ,hullMaterialVolume,wingMaterialVolume,keelMaterialVolume,rudderMaterialVolume,
                 hullLaminateThickness,wingLaminateThickness,keelLaminateThickness,rudderLaminateThickness)
            }

            calc def InputChecks {
                doc /* Executable preconditions for MassProperties. One denotes a valid
                 * input group, zero an invalid one. These preserve the numerical adapter's
                 * physical domain; they are not vessel acceptance requirements. */
                in d : Real [29] ordered nonunique;
                in p : Real [41] ordered nonunique;
                attribute positiveDimensions : Real = if d#(1) > 0 and d#(2) > 0 and d#(3) > 0 and d#(4) > 0 and d#(5) > 0 and d#(6) > 0 and d#(8) > 0 and d#(11) > 0 and d#(12) > 0 and d#(13) > 0 and d#(14) > 0 and d#(15) > 0 and d#(17) > 0 and d#(18) > 0 and d#(19) > 0 and d#(20) > 0 and d#(21) > 0 and d#(22) > 0 and d#(23) > 0 and d#(24) > 0 and d#(25) > 0 and d#(26) > 0 ? 1.0 else 0.0;
                attribute nonnegativeBallast : Real = if d#(16) >= 0 ? 1.0 else 0.0;
                attribute positiveBatterySpecificEnergy : Real = if p#(13) > 0 ? 1.0 else 0.0;
                attribute nonnegativeResinRatio : Real = if p#(1) >= 0 ? 1.0 else 0.0;
                return result : Real [4] ordered nonunique;
                (positiveDimensions,nonnegativeBallast,positiveBatterySpecificEnergy,nonnegativeResinRatio)
            }
        }

        package Structures {
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
                attribute appendages : Real [5] ordered nonunique = Analysis::Marine::Appendages::GeometryMargins(d,r#(11),r#(12));
                attribute keelAspectMargin : Real = appendages#(1);
                attribute rudderAspectMargin : Real = appendages#(2);
                attribute keelRootMargin : Real = appendages#(3);
                attribute rudderStockMargin : Real = appendages#(4);
                attribute sweptSeparationMargin : Real = appendages#(5);
                return result : Real [*] ordered nonunique;
                (hullStressMargin,wingStressMargin,keelStressMargin,rudderStressMargin,hullDeflectionMargin,wingDeflectionMargin,keelDeflectionMargin,rudderDeflectionMargin,panelStressMargin,panelDeflectionMargin,bodyHandlingMargin,wingHandlingMargin,keelHandlingMargin,batteryHandlingMargin,freeboardMargin,reserveVolumeMargin,launchDepthMargin,panelAreaMargin,hullPackingMargin,wingPackingMargin,keelPackingMargin,rudderPackingMargin,keelAspectMargin,rudderAspectMargin,keelRootMargin,rudderStockMargin,sweptSeparationMargin)
            }
        }
    }
    package Energy {
        package Actuation {
            private import ScalarValues::*;

            calc def MastTorque {
                in densityKgM3 : Real;
                in apparentWindMS : Real;
                in sailAreaM2 : Real;
                in chordM : Real;
                in momentCoefficientAtMast : Real;
                in bearingFrictionNm : Real;
                return torqueNm : Real;
                0.5*densityKgM3*apparentWindMS*apparentWindMS*sailAreaM2*chordM*RealFunctions::abs(momentCoefficientAtMast)+bearingFrictionNm
            }
            calc def DrivePower {
                doc /* Preconditions: efficiencies in (0,1], nonnegative powers and duty
                 * fractions; moving plus holding fraction at most one. The external
                 * sizing adapter must reject inputs outside these domains. */
                in shaftTorqueNm : Real;
                in shaftSpeedRadS : Real;
                in motorEfficiency : Real;
                in gearboxEfficiency : Real;
                in motorNoLoadW : Real;
                in controllerW : Real;
                in motorHoldingW : Real;
                in moveFraction : Real;
                in holdingFraction : Real;
                attribute movingW : Real = controllerW+motorNoLoadW+RealFunctions::abs(shaftTorqueNm*shaftSpeedRadS)/(motorEfficiency*gearboxEfficiency);
                attribute holdingW : Real = controllerW+motorHoldingW;
                return powersW : Real [3] ordered nonunique;
                (moveFraction*movingW+holdingFraction*holdingW+(1-moveFraction-holdingFraction)*controllerW,
                 NumericalFunctions::max(movingW,holdingW),movingW)
            }
            calc def DailyEnergy {
                in averagePowerW : Real;
                in durationHours : Real;
                return energyWh : Real;
                averagePowerW*durationHours
            }
        }
    }
    package Reliability {
        private import ScalarValues::*;
        calc def ConstantHazardSurvival {
            in ratePerHour : Real;
            in hours : Real;
            return survival : Real = OpenSysMLMathFunctions::exp(-ratePerHour * hours);
        }
        calc def EqualSurvivalRate {
            in survival : Real;
            in hours : Real;
            return ratePerHour : Real = -OpenSysMLMathFunctions::ln(survival) / hours;
        }
        doc /* Constant nonnegative mission-critical hazard, no repair, hours > 0,
         * and 0 < target survival <= 1. NIST Engineering Statistics Handbook,
         * https://itl.nist.gov/div898/handbook/apr/section1/apr161.htm.
         * The calculation does not estimate rates or represent impact/cycle damage. */
    }
}
