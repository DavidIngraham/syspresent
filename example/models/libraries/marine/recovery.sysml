package MarineRecovery {
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
