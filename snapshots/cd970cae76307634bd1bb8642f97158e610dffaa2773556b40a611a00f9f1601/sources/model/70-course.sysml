package TransGorgeCourse {
    private import ScalarValues::*;

    part def MarkerGate {
        attribute markerName : String;
        attribute lightListNumber : Integer;
        attribute longitudeDeg : Real;
        attribute latitudeDeg : Real;
        attribute bearingFromMarkerDeg : Real;
        attribute nearOffsetM : Real;
        attribute farOffsetM : Real;
        attribute sourceCell : String;
        attribute sourceEditionUpdate : String;
    }

    part west : MarkerGate {
        attribute :>> markerName = "Bonneville Pool Lighted Buoy 16";
        attribute :>> lightListNumber = 11835;
        attribute :>> longitudeDeg = -121.8676486;
        attribute :>> latitudeDeg = 45.6918586;
        attribute :>> bearingFromMarkerDeg = 0;
        attribute :>> nearOffsetM = 80;
        attribute :>> farOffsetM = 220;
        attribute :>> sourceCell = "US5WA3DK";
        attribute :>> sourceEditionUpdate = "2.0";
        metadata rationale : ModelingMetadata::Rationale { text = "Western rounding mark near Stevenson: NOAA ENC US5WA3DK and USCG LLNR 11835 identify red Lighted Buoy 16. Round to port through north, west and south offset checkpoints in that order. Use the nominal charted position, never contact or attach to the aid. The 80 m exclusion and 220 m checkpoint extent are project allocations, not statutory stand-offs."; }
    }

    part east : MarkerGate {
        attribute :>> markerName = "Bonneville Pool Lighted Buoy 39";
        attribute :>> lightListNumber = 11985;
        attribute :>> longitudeDeg = -121.461773;
        attribute :>> latitudeDeg = 45.7035806;
        attribute :>> bearingFromMarkerDeg = 180;
        attribute :>> nearOffsetM = 80;
        attribute :>> farOffsetM = 220;
        attribute :>> sourceCell = "US5WA3DP";
        attribute :>> sourceEditionUpdate = "2.0";
        metadata rationale : ModelingMetadata::Rationale { text = "Bingen start/finish reference downstream of Bingen Point boat ramp: green Lighted Buoy 39, NOAA ENC US5WA3DP and USCG LLNR 11985. The virtual gate extends south from the nominal charted buoy position. Launch and retrieval at Bingen Point are outside the scored circuit. Confirm the actual buoy and current notices before launch."; }
    }

    part temporaryWorks {
        attribute longitudeDeg : Real = -121.5225;
        attribute latitudeDeg : Real = 45.7283333333;
        attribute screeningRadiusM : Real = 250;
        metadata rationale : ModelingMetadata::Rationale { text = "2026-10-07 Northwest LNM week 40 page 2 locates railroad bridge work at White Salmon confluence, RM 168.2, through 2026-12-31. The derrick barge stays on station outside work hours. Source: https://www.navcen.uscg.gov/sites/default/files/pdf/lnms/lnm13402026.pdf . Exclude a 250 m analysis buffer around the published point for this snapshot."; }
        metadata issue : ModelingMetadata::Issue { text = "The radius is a conservative scenario allocation, not a surveyed work footprint or statutory stand-off. Replace with confirmed work extent and current notices before release; do not silently expire this exclusion using the computer clock."; }
    }
    part bridgePassage {
        attribute spanIdentifier : String = "0226241BDFAB1596";
        attribute closedClearanceM : Real = 20.4;
        attribute horizontalClearanceM : Real = 74.9;
        attribute pierAllowanceM : Real = 10;
        attribute verticalAllowanceM : Real = 2;
        attribute referenceApproachM : Real = 150;
        attribute source : String = "https://www.portofhoodriver.com/bridge-lift-request";
        metadata rationale : ModelingMetadata::Rationale { text = "Select the charted Hood River lifting span, closed, for both legs. ENC US5WA3DP LNAM 0226241BDFAB1596 supplies the polygon and conservative 20.4 m closed clearance; the Port reports 20.42 m at its stated average river height. Adjacent spans without clearance evidence are excluded. No bridge opening is part of the mission. Vertical acceptance subtracts measured pool rise, vessel air draft including motion, and a 2 m project uncertainty allowance from chart clearance. PDR must verify the local stage datum; launch must check current works and pool stage. The 10 m pier allowance is a planning allocation, not a legal stand-off."; }
    }
    part policy {
        attribute coordinateDatum : String = "WGS84 longitude/latitude degrees; bearings clockwise from true north; offsets in meters";
        attribute chartEvidence : String = "evidence/course/2026-10-11/chart-features.geojson";
        attribute sourceCatalog : String = "https://www.charts.noaa.gov/ENCs/ENCProdCat_19115.xml";
        attribute sourceLightList : String = "https://www.navcen.uscg.gov/sites/default/files/pdf/lightLists/weeklyUpdates/v6WeeklyChanges.pdf";
        attribute chartCatalogDate : String = "2026-10-10";
        attribute lightListDate : String = "2026-10-07";
        attribute gatesAcceptedForLaunch : Boolean = false;
        attribute damTransitPermitted : Boolean = false;
        attribute lockApproachTransitPermitted : Boolean = false;
        attribute hasCompletionDeadline : Boolean = false;
        attribute minimumChartDepthM : Real = 2;
        attribute shoreClearanceM : Real = 30;
        attribute restrictionClearanceM : Real = 50;
        attribute obstacleClearanceM : Real = 30;
        attribute routingGridM : Real = 40;
        attribute referenceLegLengthM : Real = 32994.546297358545;
        metadata referenceLengthBasis : ModelingMetadata::Rationale { text = "Half the complete chart-domain reference circuit including the buoy rounding generated from this gate and clearance configuration by tools.boat_analysis.environment.routing. This equivalent leg length preserves full circuit distance in the symmetric sizing calculation; the mission simulation uses the distinct legs. This is a nominal sizing-analysis distance, not a prescribed sailing track; tacks and avoidance increase traveled distance. Regeneration checks this value against the chart-derived route."; }
        metadata routingRationale : ModelingMetadata::Rationale { text = "Initial routing allocations for the small-vessel analysis: chart depth at least 2 m, 30 m from charted land/obstructions and 50 m from excluded charted areas. These are project planning margins, not legal stand-off distances. Actual draft, pool stage, maneuvering, uncertainty and bridge clearances require separate assessment. Grid resolution is a numerical setting, not a vessel requirement."; }
        attribute gateNames : String [5] ordered nonunique = ("eastGate", "westGate", "turnGate", "returnGate", "eastGate");
        attribute gateDirections : Integer [5] ordered nonunique = (-1,1,1,1,1);
        attribute crossingSequence : String = "Cross Bingen gate downstream; pass north, west and south of buoy 16 in order, keeping the buoy to port; cross Bingen gate upstream to finish. Maintain the modeled marker exclusion throughout. Launch and retrieval are outside the scored course.";
        metadata rationale : ModelingMetadata::Rationale { text = "The route stays in Bonneville Pool. Gate segments are defined relative to existing aids, with 80 m minimum nominal marker offset. Chart-derived polygons, water depth and local notices constrain route planning; neither the marker-to-marker chord nor the commercial fairway is the whole permitted sailing corridor. Completion has no elapsed-time deadline. A computational horizon reports censoring rather than failure."; }
        metadata issue : ModelingMetadata::Issue { text = "Gate proposal for mission analysis, not a launch release. Verify complete segment clearance and maneuvering/drift margins, current MSI notices, current pool stage, bridge passage and autonomous traffic avoidance. A route through charted water does not establish safe operation. No universal vessel stand-off distance is inferred from navigation rules."; }
    }
    dependency courseBasis from policy to GorgeChallenge::courseCompletion;

    analysis GateGeometry {
        out attribute bridgeSpanIdentifier : String = bridgePassage.spanIdentifier;
        out attribute bridgePierAllowanceM : Real = bridgePassage.pierAllowanceM;
        out attribute bridgeApproachM : Real = bridgePassage.referenceApproachM;
        out attribute referenceLegLengthM : Real = policy.referenceLegLengthM;
        out attribute temporaryWorks : Real [3] ordered nonunique = (TransGorgeCourse::temporaryWorks.longitudeDeg, TransGorgeCourse::temporaryWorks.latitudeDeg, TransGorgeCourse::temporaryWorks.screeningRadiusM);
        out attribute westGate : Real [5] ordered nonunique = (west.longitudeDeg, west.latitudeDeg, west.bearingFromMarkerDeg, west.nearOffsetM, west.farOffsetM);
        out attribute turnGate : Real [5] ordered nonunique = (west.longitudeDeg, west.latitudeDeg, 270, west.nearOffsetM, west.farOffsetM);
        out attribute returnGate : Real [5] ordered nonunique = (west.longitudeDeg, west.latitudeDeg, 180, west.nearOffsetM, west.farOffsetM);
        out attribute eastGate : Real [5] ordered nonunique = (east.longitudeDeg, east.latitudeDeg, east.bearingFromMarkerDeg, east.nearOffsetM, east.farOffsetM);
        out attribute routing : Real [5] ordered nonunique = (policy.minimumChartDepthM, policy.shoreClearanceM, policy.restrictionClearanceM, policy.obstacleClearanceM, policy.routingGridM);
    }
}
