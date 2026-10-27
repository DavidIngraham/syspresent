package EffectiveFixture {
 requirement def Obligation;
 part def Base { requirement baseReq : Obligation; }
 part def Derived :> Base { requirement localReq : Obligation; }
 part component : Derived;
 part another : Derived;
}
