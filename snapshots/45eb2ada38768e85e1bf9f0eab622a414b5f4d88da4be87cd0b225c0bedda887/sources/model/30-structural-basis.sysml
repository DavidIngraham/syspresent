package BlueDogStructuralBasis {
    private import ScalarValues::*;
    doc /* Provisional construction and numerical screening basis. No values here are
     * asserted to follow uniquely from the Gorge challenge. */
    analysis def Inputs {
        doc /* PETG density: Prusament PETG TDS 2021/10, revision 2022-02-16, 1.27 g/cm3.
         * Epoxy density: WEST SYSTEM 105/206 TDS 2014, cured specific gravity 1.18.
         * Glass density 2550 kg/m3 and 1:1 retained mixed-resin/dry-glass mass ratio
         * are project assumptions. 10 GPa and 50 MPa are unverified provisional
         * analysis inputs, not minimum material qualification requirements.
         * 200 g/m2 ply, PETG wall/infill, finishing and seam budgets are process
         * assumptions. Resin waste in cups/tools is excluded from vessel mass. */
        out attribute qualified : Boolean = false;
        doc /* Screening values below remain unchanged to preserve the meaning of existing
         * sizing runs. Deflection fractions, pressure/proof loads, freeboard, reserve,
         * launch depth and tile size are provisional study controls, not challenge minima.
         * Acceptance uses measured material bounds and validated functional/site limits.
         * A passing study does not verify a requirement; re-size when evidence changes. */
        out attribute petgDensity : Real = 1270;
        out attribute glassDensity : Real = 2550;
        out attribute epoxyDensity : Real = 1180;
        out attribute resinGlassRatio : Real = 1;
        out attribute laminateModulus : Real = 10000000000;
        out attribute laminateAllowable : Real = 50000000;
        out attribute hullPrintWall : Real = 0.0008;
        out attribute foilPrintWall : Real = 0.0004;
        out attribute ribHeight : Real = 0.01;
        out attribute foilInfill : Real = 0.08;
        out attribute foilThicknessRatio : Real = 0.12;
        out attribute finishingMass : Real = 0.10;
        out attribute tapeWidth : Real = 0.03;
        out attribute tapeDryMass : Real = 0.20;
        out attribute printTile : Real = 0.23;
        out attribute minimumFreeboard : Real = 0.05;
        out attribute reserveFraction : Real = 1;
        out attribute launchDepth : Real = 1.5;
        out attribute bottomClearance : Real = 0.3;
        out attribute pressure : Real = 10000;
        out attribute tipProofForce : Real = 100;
        out attribute appendageDeflectionFraction : Real = 0.02;
        out attribute hullDeflectionFraction : Real = 0.005;
        out attribute panelDeflectionFraction : Real = 0.01;
    }

    dependency constructionChoice from Inputs to BlueDogStructure::hybridConstruction;
    dependency studyPurpose from Inputs to BlueDogStructure::structuralIntegrity;
}
