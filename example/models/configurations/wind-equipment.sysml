package BlueDogWindEquipment {
    private import ScalarValues::*;
    private import OOSEM::hardware;
    #hardware part def Installation {
        attribute product : String;
        attribute dataInterface : String;
        attribute sensorMassKg : Real;
        attribute installationAllowanceKg : Real;
        attribute installedMassKg : Real = sensorMassKg + installationAllowanceKg;
        attribute sensorSupplyW : Real;
        attribute interfaceAllowanceW : Real;
        attribute conversionEfficiency : Real;
        attribute powerMargin : Real;
        attribute busPowerW : Real = (sensorSupplyW + interfaceAllowanceW) * powerMargin / conversionEfficiency;
        attribute internalBatteryRuntimeHours : Real;
        attribute xFraction : Real;
        attribute aboveDeckM : Real;
        attribute evidenceAccepted : Boolean = false;
    }
    part testbed : Installation {
        doc /* Historical installation allowance for the retired separate testbed concept.
         * The owned sensor remains available for component experiments; this is
         * not a planned first boat or a selected IC-01 installation. */
        attribute :>> product = "Calypso Ultrasonic Portable Mini";
        attribute :>> dataInterface = "Bluetooth; internal battery; shore Qi charging";
        attribute :>> sensorMassKg = 0.078;
        attribute :>> installationAllowanceKg = 0.05;
        attribute :>> sensorSupplyW = 0;
        attribute :>> interfaceAllowanceW = 0.05;
        attribute :>> conversionEfficiency = 0.9;
        attribute :>> powerMargin = 1.25;
        attribute :>> internalBatteryRuntimeHours = 150;
        attribute :>> xFraction = 0;
        attribute :>> aboveDeckM = 0.3;
        metadata rationale : ModelingMetadata::Rationale { text = "Owner has the battery/Bluetooth sensor originally considered for the retired testbed concept and available for component experiments. Manufacturer lists 78 g including internal battery, 43 mm diameter, 47 mm height, 1 Hz, Bluetooth 5.1, Qi charging and 150 hours active use: https://www.calypsoinstruments.com/shop/ultrasonic-portable-mini-wind-meter-221 . The 50 g mount and 50 mW receiver are project allowances, not product specifications. Sensor energy comes from its own battery; zero vessel-bus sensor power does not mean zero sensor consumption."; }
        metadata issue : ModelingMetadata::Issue { text = "Confirm owned 25 or 45 m/s variant and firmware. Measure runtime, receiver power, disconnection behavior and charging between tests. Internal battery capacity and energy use are not published here; 150 hours is a supplier runtime claim, not an endurance verification."; }
    }
    part challenge : Installation {
        attribute :>> product = "Calypso ULP Wired Mini, 45 m/s UART variant";
        attribute :>> dataInterface = "UART 38400 baud, 1 Hz, 5 V vessel supply";
        attribute :>> sensorMassKg = 0.078;
        attribute :>> installationAllowanceKg = 0.072;
        attribute :>> sensorSupplyW = 5 * 0.00015;
        attribute :>> interfaceAllowanceW = 0.05;
        attribute :>> conversionEfficiency = 0.9;
        attribute :>> powerMargin = 1.25;
        attribute :>> internalBatteryRuntimeHours = 0;
        attribute :>> xFraction = 0;
        attribute :>> aboveDeckM = 0.3;
        metadata rationale : ModelingMetadata::Rationale { text = "Owner restricts the provisional challenge choice to a wired Calypso. The ULP Wired Mini data sheet lists 78 g, 43 by 47 mm, 3.3–5 V, UART, and 0.15 mA at 5 V/38400 baud/1 Hz: https://www.calypsoinstruments.com/web/content/62187?download=true . Select the 45 m/s variant to cover more than the 25 m/s version. The 72 g cable/mount/interface allocation, 50 mW interface draw, 90 percent conversion and 25 percent power margin are project allowances. The generic 2.5 kg equipment and 4.5 W electronics allocations exclude this separately budgeted installation."; }
        metadata issue : ModelingMetadata::Issue { text = "Confirm currently orderable SKU and peak/startup power; 1 Hz data-sheet consumption is not a measured worst case. Qualify weather exposure, immersion and installed-flow errors. Centerline mounting 0.3 m above deck is a mass-centroid placeholder; finalize unobstructed siting and cable layout. Sensor displaced volume and windage remain outside the current geometry model."; }
    }
    dependency challengeSelection from challenge to BlueDogRequirements::windObservation;
    dependency challengeEndurance from challenge to BlueDogRequirements::windSensingEndurance;
    dependency testbedLearning from testbed to BlueDogRequirements::windObservation;
    dependency logicalAllocation from challenge to BlueDog::Architecture::WindSensing;
    analysis Rollup {
        out attribute testbedInstalledMassKg : Real = testbed.installedMassKg;
        out attribute testbedVesselBusW : Real = testbed.busPowerW;
        out attribute testbedSupplierRuntimeHours : Real = testbed.internalBatteryRuntimeHours;
        out attribute challengeInstalledMassKg : Real = challenge.installedMassKg;
        out attribute challengeVesselBusW : Real = challenge.busPowerW;
        out attribute challengeEnergyPerDayWh : Real = challenge.busPowerW * 24;
        out attribute challengeEvidenceAccepted : Boolean = challenge.evidenceAccepted;
    }
}
