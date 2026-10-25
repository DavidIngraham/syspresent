package BlueDogOperatingEnvironment {
    private import ScalarValues::*;
    private import SI::*;
    analysis Inputs {
        doc /* Provisional operating and energy allocations. Physical values remain separate from numerical optimizer tolerances. */
        out attribute foil_alpha_limit_deg : Real = 12;
        out attribute rudder_inflow_ratio : Real = 0.8;
        out attribute hinge_fraction : Real = RealFunctions::abs(BlueDogConceptCredibility::policy.rudderStockChordFraction-BlueDogConceptCredibility::policy.rudderLoadChordFraction);
        out attribute friction_Nm : Real = 0.02;
        out attribute max_froude : Real = 0.65;
        out attribute min_wing_Re : Real = 60000;
        out attribute min_foil_Re : Real = 30000;
        out attribute yaw_reserve_Nm : Real = 0.5;
        out attribute control_speed_m_s : Real = 0.5;
        out attribute control_wind_m_s : Real = 5;
        out attribute peak_irradiance_W_m2 : Real = 1000;
        out attribute panel_efficiency : Real = 0.2;
        out attribute harvest_efficiency : Real = 0.85;
        out attribute charge_efficiency : Real = 0.9;
        out attribute discharge_efficiency : Real = 0.9;
        out attribute usable_fraction : Real = 0.8;
        out attribute initial_fraction : Real = 0.9;
        out attribute charge_C_rate : Real = 0.5;
        out attribute discharge_C_rate : Real = 1.5;
        out attribute self_discharge_W : Real = 0.02;
        out attribute dark_hours : Real = 18;
        out attribute solar_hours : Real = 6;
        comment reserveScreen /* Synthetic comparison exposure only; mission feasibility requires the course-dependent reserve provider. */
        out attribute reserve_Wh : Real = BlueDogRequirements::RecoveryReserveDemand(50 [W], 8 [W], 1800 [s], 7200 [s], 1.2) / (3600 [J]);
        out attribute wingMomentScale : Real = BlueDogAerodynamicPolicy::sizing.momentScale;
        out attribute parameterNames : String [*] ordered nonunique = ("foil_alpha_limit_deg", "rudder_inflow_ratio", "hinge_fraction", "friction_Nm", "max_froude", "min_wing_Re", "min_foil_Re", "yaw_reserve_Nm", "control_speed_m_s", "control_wind_m_s", "peak_irradiance_W_m2", "panel_efficiency", "harvest_efficiency", "charge_efficiency", "discharge_efficiency", "usable_fraction", "initial_fraction", "charge_C_rate", "discharge_C_rate", "self_discharge_W", "dark_hours", "solar_hours", "reserve_Wh", "wingMomentScale");
        out attribute parameterValues : Real [*] ordered nonunique = (foil_alpha_limit_deg, rudder_inflow_ratio, hinge_fraction, friction_Nm, max_froude, min_wing_Re, min_foil_Re, yaw_reserve_Nm, control_speed_m_s, control_wind_m_s, peak_irradiance_W_m2, panel_efficiency, harvest_efficiency, charge_efficiency, discharge_efficiency, usable_fraction, initial_fraction, charge_C_rate, discharge_C_rate, self_discharge_W, dark_hours, solar_hours, reserve_Wh, wingMomentScale);
    }
}
