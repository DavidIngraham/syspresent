package MarineSailing {
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
         * canoe-body metrics from MarineResistance::Evaluate. aero moment at midchord.
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
        attribute delft : Real [21] ordered nonunique = MarineResistance::Evaluate((hydro#(4),hydro#(5),hydro#(6),hydro#(7),hydro#(8),hydro#(9),hydro#(10),hydro#(11),hydro#(12)),v,rho_water,g);
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
        attribute wingTorque : Real = if surface#(1)>0.5 ? RealFunctions::abs(surface#(5))+friction_Nm else MarineActuation::MastTorque(rho_air,va,sail_m2,wingChord,mastMomentCoefficient,friction_Nm);
        attribute wingPower : Real [3] ordered nonunique = MarineActuation::DrivePower(wingTorque,p#(19),p#(3),p#(2),p#(4),p#(5),p#(6),p#(7),p#(8));
        attribute rudderPower : Real [3] ordered nonunique = MarineActuation::DrivePower(rudderTorque,p#(20),p#(3),1,1,0.1,p#(9)*rudderTorque,p#(10),1-p#(10));
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
