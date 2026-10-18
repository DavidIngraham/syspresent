package BlueDogHydrostatics {
    private import ScalarValues::*;
    public import MarineHydrostatics::*;
    analysis analyticExample {
        out attribute partial : Real [4] ordered nonunique = WetMoment((0.0,0.0,0.0,1.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,1.0),0.5);
        out attribute full : Real [4] ordered nonunique = WetMoment((0.0,0.0,0.0,1.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,1.0),1.0);
    }
    dependency recoveryGeometry from MeshMoments to BlueDogRequirements::selfRighting;
}
