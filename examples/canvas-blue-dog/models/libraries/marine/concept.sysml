package MarineConcept {
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
