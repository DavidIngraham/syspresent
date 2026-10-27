package AttributeInterpolation {
    private import ScalarValues::*;
    private import ISQ::*;
    private import SI::*;
    enum def Evidence { unknown; accepted; }
    attribute maximumLength : LengthValue = 1.2 [m];
    part def Defaults {
        attribute count : Integer = 0;
        attribute enabled : Boolean = false;
        attribute defaultLabel : String = "inherited default";
    }
    part source {
        attribute identifier : String = "IC-fixture";
        attribute distance : LengthValue = 1.2 [m];
        attribute batteryWhKg : Real = 140;
        attribute huge : Integer = 18446744073709551616;
    }
    part linked : Defaults {
        attribute identifier : String = source.identifier;
        attribute distance : LengthValue = source.distance;
        attribute batteryWhKg : Real = source.batteryWhKg;
        attribute doubled : Real = source.batteryWhKg * 2;
        attribute 'state' : Evidence = Evidence::unknown;
        attribute huge : Integer = source.huge;
        attribute unsetInput : Real;
        attribute dependent : Real = unsetInput + 1;
        attribute emptyOptional : String[0..1];
        attribute sequenceValues : Integer[3] = (1, 2, 3);
    }
}
