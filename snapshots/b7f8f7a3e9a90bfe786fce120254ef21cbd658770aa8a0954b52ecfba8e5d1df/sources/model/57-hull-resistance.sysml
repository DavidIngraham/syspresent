package MarineResistance {
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
