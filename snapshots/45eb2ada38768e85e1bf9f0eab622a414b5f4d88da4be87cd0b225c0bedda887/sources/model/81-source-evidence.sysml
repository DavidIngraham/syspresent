package BlueDogSourceEvidence {
    private import ScalarValues::*;
    part def SourceNote { attribute urls : String [1..*] ordered; attribute researchDate : String = "2026-10-09"; }
    part sail1 : SourceNote {
        doc /* The tail-controlled wing uses aerodynamic control of the main wing's incidence. The actuator moves a small tail control surface rather than directly driving the entire loaded wing. Saildrone describes that wing/tail/tab arrangement in its [design history](https://www.saildrone.com/eu-en/news/how-saildrone-wing-was-born). That supports investigating low trim energy; it does not supply a Blue Dog actuator power value or prove that a jammed actuator will feather safely. */
        attribute :>> urls = ("https://www.saildrone.com/eu-en/news/how-saildrone-wing-was-born");
    }
    dependency sail1Basis from BlueDogDesignDecisions::sizingBaseline to sail1;
    part sail2 : SourceNote {
        doc /* The [Silva et al. wingsail design paper](https://recipp.ipp.pt/bitstream/10400.22/15346/1/CAPL_LSA_MBM_2019.pdf) describes the corresponding moment balance and highlights the tail/counterweight trade: balancing a free wing can add elevated mass and increase its swept envelope. This motivates retaining the tail-controlled candidate, while bearing friction, tail authority, tab faults, submerged loads and counterweight mass must remain explicit design problems. */
        attribute :>> urls = ("https://recipp.ipp.pt/bitstream/10400.22/15346/1/CAPL_LSA_MBM_2019.pdf");
    }
    dependency sail2Basis from BlueDogDesignDecisions::sizingBaseline to sail2;
    part sail3 : SourceNote {
        doc /* The closest primary precedent found is Miller, Judge, Sewell and Williamson's [*An Alternative Wing Sail Concept for Small Autonomous Sailing Craft*](https://www.researchgate.net/publication/323361410_An_Alternative_Wing_Sail_Concept_for_Small_Autonomous_Sailing_Craft), published in *Robotic Sailing 2017* (2018), DOI 10.1007/978-3-319-72739-4_1. Its abstract reports wind-tunnel and on-water evaluation of a square-sail-derived wing on the 1.2 m MaxiMOOP, with condition-dependent performance and practical advantages over its soft-sail comparator. The [MaxiMOOP platform page](https://www.sailbot.org/maximoop/) associates the asymmetric-wing test platform with the U.S. Naval Academy. This is the closest match located, not a confirmed NPS-authored paper. The accessible abstract supports concept precedent; the full numerical results have not been inspected or imported. */
        attribute :>> urls = ("https://www.researchgate.net/publication/323361410_An_Alternative_Wing_Sail_Concept_for_Small_Autonomous_Sailing_Craft", "https://www.sailbot.org/maximoop/");
    }
    dependency sail3Basis from BlueDogDesignDecisions::sizingBaseline to sail3;
    part sail4 : SourceNote {
        doc /* [Crescent-wing research at Chalmers](https://research.chalmers.se/publication/543872/file/543872_Fulltext.pdf) explains how suitable sections exchange leading and trailing edges between tacks. Fixed camber therefore does not inherently require a reversal mechanism. Whether our CAD has the necessary edge geometry remains a geometry check, not an assumed property. */
        attribute :>> urls = ("https://research.chalmers.se/publication/543872/file/543872_Fulltext.pdf");
    }
    dependency sail4Basis from BlueDogDesignDecisions::sizingBaseline to sail4;
    part sail5 : SourceNote {
        doc /* The [official PC13 entry](https://www.microtransat.org/content.php?p=2026_oshen_cstar) describes a single DynaRig wingsail driven by a motor inside the hull, a 1.299 m hull, 56 kg displacement, 52.5 W solar and a 100 Ah battery. Its auxiliary thruster was unused during the challenge. Neither the airfoil section nor the gearbox's backdrivability is established by that description. PC13 strengthens the case for direct mast actuation; it does not verify our fixed-camber geometry or energy budget. */
        attribute :>> urls = ("https://www.microtransat.org/content.php?p=2026_oshen_cstar");
    }
    dependency sail5Basis from BlueDogDesignDecisions::sizingBaseline to sail5;
    part sail6 : SourceNote {
        doc /* The [organizer announced autonomous east-to-west completion on 13 September 2026](https://microtransat.org/content.php?p=news%2F2026-09-13-oshen), with the result provisional pending jury review in that announcement. This is relevant integrated endurance evidence, not a statistical reliability estimate. The [Oshen/MBARI evaluation of other C-Star configurations](https://oceansynchro.io/wp-content/uploads/2026/05/OshenC-Star_ReportFinal-1.pdf) identified light-wind/current navigation limitations and evaluated auxiliary propulsion. An ocean crossing therefore does not establish sail-only upstream Gorge progress. PC13's compact length also does not establish compliance with our one-person handling allocations. */
        attribute :>> urls = ("https://microtransat.org/content.php?p=news%2F2026-09-13-oshen", "https://oceansynchro.io/wp-content/uploads/2026/05/OshenC-Star_ReportFinal-1.pdf");
    }
    dependency sail6Basis from BlueDogDesignDecisions::sizingBaseline to sail6;
    part sail7 : SourceNote {
        doc /* [SEW's gearbox planning guidance](https://download.sew-eurodrive.com/download/pdf/16934016.pdf) distinguishes starting and running efficiency, and static and dynamic self-locking. We must verify the selected unit's holding behavior across load, lubrication, temperature, wear, vibration and shock rather than infer it from the word "worm". */
        attribute :>> urls = ("https://download.sew-eurodrive.com/download/pdf/16934016.pdf");
    }
    dependency sail7Basis from BlueDogDesignDecisions::sizingBaseline to sail7;
    part sail8 : SourceNote {
        doc /* The concern is maintenance-free exposure. North Sails identifies [flogging, flutter and flex fatigue](https://www.northsails.com/en-us/blogs/north-sails-blog/four-fs-sail-fatigue-flex-fiber-compression-flogging-flutter), and recommends [chafe protection, UV protection and inspection](https://www.northsails.com/en-uk/blogs/north-sails-blog/sail-care-maintenance-tips-diy). For the finite Gorge mission, fabric/line wear and autonomous sail handling are comparison criteria alongside rigid-wing bearing, drive and skin risks. The soft sail remains an equal development contender; persistent ocean service is a separate future exposure. A furling or self-locking winch may address some risks, but introduces its own mechanisms and failure cases. */
        attribute :>> urls = ("https://www.northsails.com/en-us/blogs/north-sails-blog/four-fs-sail-fatigue-flex-fiber-compression-flogging-flutter", "https://www.northsails.com/en-uk/blogs/north-sails-blog/sail-care-maintenance-tips-diy");
    }
    dependency sail8Basis from BlueDogDesignDecisions::sizingBaseline to sail8;
    part sail9 : SourceNote {
        doc /* Rigid construction also has real durability limits. Saildrone reports that tall wings were damaged during Southern Ocean attempts; its lower-aspect replacement improved survival while sacrificing upwind capability. That is directly relevant to a mission requiring upstream windward progress. See [Saildrone's account of the Antarctic circumnavigation](https://www.saildrone.com/eu-en/news/unmanned-vehicle-completes-antarctica-circumnavigation). Avoiding sailcloth does not establish wave-impact survival. */
        attribute :>> urls = ("https://www.saildrone.com/eu-en/news/unmanned-vehicle-completes-antarctica-circumnavigation");
    }
    dependency sail9Basis from BlueDogDesignDecisions::sizingBaseline to sail9;
    part regulation10 : SourceNote {
        doc /* | Source | What it establishes | Limit for Blue Dog |
| --- | --- | --- |
| [Boat Length, March 18, 2023](https://groups.google.com/g/microtransat/c/ZCm62dVztJ4) | Paul Miller attributes the 2.4 m overall race limit to a USCG interpretation treating smaller craft as oceanographic devices. | A participant's report; the thread does not supply the underlying agency determination or its conditions. |
| [Microtransat FAQ](https://www.microtransat.org/faq.php) | Organizers report UK/French coastguard conversations supporting buoy classification, but a differing IMO view. | Evidence of differing interpretations, not a current ruling for this project. |
| [2026 race discussion, April 14](https://groups.google.com/g/microtransat/c/DuZiwjFllE8) | Francis Roussel discusses a 2.5 m threshold. | Country, regulatory purpose and conditions matter; length alone is insufficient. |
| [French regulation discussion, August 24-25, 2026](https://groups.google.com/g/microtransat/c/0_jdHs-k-cY) | Participants discuss French maritime-drone rules and contrast the UK MGN 702 exemption. | Do not import the thread's one-metre or nationality conclusions into a US design requirement. |
| [MCA MGN 702 Amendment 2, January 19, 2026](https://www.gov.uk/government/publications/mgn-702-m-amendment-2-maritime-autonomous-surface-ships-of-less-than-25-metres-in-loa/mgn-702-m-amendment-2-maritime-autonomous-surface-ships-of-less-than-25-metres-in-loa) | An actual conditional exemption from specified certification requirements for eligible MASS below 2.5 m. The guidance explicitly retains other maritime requirements. | It still describes these craft as vessels; this is not a US buoy exemption. | */
        attribute :>> urls = ("https://groups.google.com/g/microtransat/c/ZCm62dVztJ4", "https://www.microtransat.org/faq.php", "https://groups.google.com/g/microtransat/c/DuZiwjFllE8", "https://groups.google.com/g/microtransat/c/0_jdHs-k-cY", "https://www.gov.uk/government/publications/mgn-702-m-amendment-2-maritime-autonomous-surface-ships-of-less-than-25-metres-in-loa/mgn-702-m-amendment-2-maritime-autonomous-surface-ships-of-less-than-25-metres-in-loa");
    }
    dependency regulation10Basis from BlueDogRequirements::regulatoryClassification to regulation10;
    part regulation11 : SourceNote {
        doc /* The August thread links [French Decree 2024-461](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049583905). It is a useful jurisdiction-specific lead, not authority for the Columbia River. The unresolved US question is the underlying USCG oceanographic-device interpretation: its text, date, purpose, scope and continuing applicability to an autonomous sailing research craft, including powered recovery and station keeping. No correspondence has been sent on the user's behalf. */
        attribute :>> urls = ("https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049583905");
    }
    dependency regulation11Basis from BlueDogRequirements::regulatoryClassification to regulation11;
    part regulation12 : SourceNote {
        doc /* For now S-005 retains classification review and S-004 retains mode-dependent conspicuity. The 2.4 m race limit is a relevant candidate design constraint, not yet a proven legal safe harbor or a user-selected hull limit. USCG's public FAQ uses transportation capability to explain vessel status, including transportation of services. [USCG navigation FAQ](https://navcen.uscg.gov/navigation-rules-faqs) */
        attribute :>> urls = ("https://navcen.uscg.gov/navigation-rules-faqs");
    }
    dependency regulation12Basis from BlueDogRequirements::regulatoryClassification to regulation12;
    part regulation13 : SourceNote {
        doc /* If an installation is an aid to maritime navigation, 33 CFR 66.01-1 requires permission to establish it. That provision neither declares every scientific buoy an aid nor supplies a blanket exemption for small research platforms. Whether it applies to a proposed observation installation must be resolved for that installation. [33 CFR 66.01-1](https://www.ecfr.gov/current/title-33/chapter-I/subchapter-C/part-66/subpart-66.01/section-66.01-1) */
        attribute :>> urls = ("https://www.ecfr.gov/current/title-33/chapter-I/subchapter-C/part-66/subpart-66.01/section-66.01-1");
    }
    dependency regulation13Basis from BlueDogRequirements::regulatoryClassification to regulation13;
    part regulation14 : SourceNote {
        doc /* Rule 25 contains lighting provisions for sailing vessels below 7 m. Rule 23 contains alternatives for power-driven vessels below 12 m, and narrower conditions for some vessels below 7 m. These are conditional equipment provisions, not maximum allowable dimensions for an unmanned boat. Powered recovery also requires review of the applicable power-driven mode. Inland and International wording must be applied to the correct waters. [USCG amalgamated navigation rules, Rules 3, 23 and 25](https://navcen.uscg.gov/navigation-rules-amalgamated) */
        attribute :>> urls = ("https://navcen.uscg.gov/navigation-rules-amalgamated");
    }
    dependency regulation14Basis from BlueDogRequirements::regulatoryClassification to regulation14;
    part propulsion15 : SourceNote {
        doc /* For an ideal stationary actuator disk, `P_induced = T^(3/2) / sqrt(2 rho A)`. This follows from momentum theory; it omits profile, swirl, motor/controller and installation losses. NASA's treatment explains the ideal disk model and its limitations. [NASA propeller thrust](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/propeller-thrust/) */
        attribute :>> urls = ("https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/propeller-thrust/");
    }
    dependency propulsion15Basis from RecoveryPropulsionTrade::RecoverySizing to propulsion15;
    part propulsion16 : SourceNote {
        doc /* Use manufacturer data for the actual propeller, intended fluid and RPM range. APC, for example, publishes different RPM limits for different air-propeller families; a generic motor power rating does not establish an acceptable propeller installation. [APC RPM limits](https://www.apcprop.com/technical-information/rpm-limits/) */
        attribute :>> urls = ("https://www.apcprop.com/technical-information/rpm-limits/");
    }
    dependency propulsion16Basis from RecoveryPropulsionTrade::RecoverySizing to propulsion16;
}
