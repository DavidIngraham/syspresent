package BlueDogRecoverySiteReview {
    private import ScalarValues::*;
    doc /* Desktop shortlist for shore-recovery assessment. Public land access does
     * not establish a navigable approach, suitable casualty landing or permission
     * for unattended operations. No coordinates are admitted to the route planner. */
    part def Candidate {
        attribute site : String;
        attribute source : String;
        attribute evidence : String;
        attribute outstanding : String;
        attribute desktopDisposition : String default = "Conditional field-survey candidate; not operationally released";
        attribute acceptedForRouting : Boolean = false;
    }
    part bingen : Candidate {
        attribute :>> site = "Bingen boat ramp and harbor";
        attribute :>> source = "https://www.portofklickitat.com/boat-launch-parks";
        attribute :>> evidence = "Port-operated ramp and harbor connect to the Columbia; same facility as the unscored launch/retrieval base.";
        attribute :>> outstanding = "Survey entrance and final capture; assess weeds, depth and current. Port rules prohibit overnight parking, so overnight retrieval logistics need a separate plan.";
    }
    part stevenson : Candidate {
        attribute :>> site = "Stevenson Cascade Avenue boat launch";
        attribute :>> source = "https://www.portofskamania.org/boat-launch-and-docks";
        attribute :>> evidence = "Port identifies a public launch at the east end of Cascade Avenue, near the western end of the course.";
        attribute :>> outstanding = "Assess approach, exposure, ramps versus rock shoreline, competing launch traffic and casualty capture.";
    }
    part springCreek : Candidate {
        attribute :>> site = "Spring Creek Hatchery State Park";
        attribute :>> source = "https://parks.wa.gov/find-parks/state-parks/spring-creek-hatchery-state-park";
        attribute :>> evidence = "State park on the Columbia provides a candidate north-bank access location for field assessment.";
        attribute :>> outstanding = "Confirm access hours, appropriate retrieval frontage, rocks, current, park conditions and wind-sport conflicts; not a sheltered-harbor assumption.";
    }
    part viento : Candidate {
        attribute :>> site = "Viento State Park";
        attribute :>> source = "https://stateparks.oregon.gov/index.cfm?do=park.profile&parkId=123";
        attribute :>> evidence = "Official park map identifies river access, making it a candidate south-bank retrieval location.";
        attribute :>> outstanding = "Assess accessible carry path, rocky landing and exposure. Cross-river traffic and current may make it inferior to a farther same-bank location.";
    }
    part homeValley : Candidate {
        attribute :>> site = "Home Valley shoreline / Wind River launch sector";
        attribute :>> source = "https://www.skamaniacounty.gov/departments-offices/public-works/parks-and-campgrounds";
        attribute :>> evidence = "County-managed Home Valley park provides an intermediate north-bank access sector. County code 12.04.290 separately identifies Wind River launch and permit requirements.";
        attribute :>> outstanding = "Survey river frontage and separate swim/recreation areas from recovery approaches; establish day/night pickup access and water-level limits. Do not equate beach access with a safe motor approach.";
    }
    part drano : Candidate {
        attribute :>> site = "Drano Lake";
        attribute :>> source = "https://wdfw.wa.gov/places-to-go/life-outdoors/southwest";
        attribute :>> evidence = "WDFW identifies heavy fishing use and launch congestion. The lake entrance also adds road/rail bridge passage to casualty recovery.";
        attribute :>> outstanding = "Excluded from the initial autonomous destination set. Reconsider only with entrance clearance, traffic and capture evidence.";
        attribute :>> desktopDisposition = "Reject as default autonomous recovery destination";
    }
    part selection {
        attribute primarySites : String = "Bingen harbor at the east end; Stevenson launch at the west end. Carry equipment for ramp or bank capture: Stevenson seasonal docks are not assumed in winter.";
        attribute intermediateSites : String = "Prioritize a north-bank Home Valley retrieval survey; retain Spring Creek and south-bank Viento as alternatives. Do not route a casualty across the commercial corridor merely because a south-bank site is closer.";
        attribute coverageDecision : String = "Endpoint-only recovery is not an accepted architecture: between endpoints it can require tens of kilometres of transit, and adverse-current authority is not demonstrated. Recovery feasibility requires a route/casualty coverage map for each forecast scenario using surveyed approaches. Any uncovered position or loss of recovery authority prevents launch or requires an earlier abort. No arbitrary point on the shoreline counts as retrieval.";
        attribute fieldProtocol : String = "At each site record WGS84 approach polygon, chart and actual depth at stated pool level, submerged/overhead obstacles, weeds/nets, drift and landing exposure, casualty retention method, legal walking/vehicle access, access hours, and one-person pickup time. Photograph and run a supervised drifting/capsized capture. Owner conducts access/physical observations; analysis agent integrates measured records and repeats route reserve checks.";
    }
    metadata rationale : ModelingMetadata::Rationale { text = "Assess more than the two endpoints so recovery distance can vary with position and remaining authority. These source-backed candidates narrow the field survey; none is yet a safe harbor or an approved numerical destination. Source review date: 2026-10-12."; }
    dependency reserveAssessment from bingen to GorgeChallenge::courseRecoveryReserve;
    dependency westernRecovery from stevenson to GorgeChallenge::autonomousShoreRecovery;
    dependency intermediateRecovery from springCreek to GorgeChallenge::autonomousShoreRecovery;
    dependency oppositeBankRecovery from viento to GorgeChallenge::autonomousShoreRecovery;
}
