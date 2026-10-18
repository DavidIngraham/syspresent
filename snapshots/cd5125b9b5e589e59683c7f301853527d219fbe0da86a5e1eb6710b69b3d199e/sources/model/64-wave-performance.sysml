package MarineWavePerformance {
    private import ScalarValues::*;
    calc def OrbitalVelocity {
        in x : Real [7] ordered nonunique;
        // amplitude, k, intrinsic omega, depth z<=0, phase, direction, gravity.
        attribute decay : Real = OpenSysMLMathFunctions::exp(x#(2)*NumericalFunctions::min(x#(4),0));
        attribute scale : Real = x#(1)*x#(3)*decay;
        attribute vx : Real = scale*TrigFunctions::cos(x#(5))*TrigFunctions::cos(x#(6));
        attribute vy : Real = scale*TrigFunctions::cos(x#(5))*TrigFunctions::sin(x#(6));
        attribute vz : Real = scale*TrigFunctions::sin(x#(5));
        return result : Real [3] ordered nonunique;
        (vx,vy,vz)
    }
    calc def FoilLoad {
        in x : Real [12] ordered nonunique;
        // rho, area, span, relative speed, incidence rad, heel rad,
        // efficiency, profile Cd, fouling, CL limit, alpha limit rad, wet fraction.
        attribute ar : Real = x#(3)*x#(3)/x#(2);
        attribute cl : Real = 2*TrigFunctions::pi/(1+2/(x#(7)*ar))*x#(5)*TrigFunctions::cos(x#(6));
        attribute pressure : Real = 0.5*x#(1)*x#(4)*x#(4)*x#(2)*x#(12);
        attribute lift : Real = pressure*cl*TrigFunctions::cos(x#(6));
        attribute drag : Real = pressure*(x#(8)*x#(9)+cl*cl/(TrigFunctions::pi*x#(7)*ar));
        attribute liftMargin : Real = 1-RealFunctions::abs(cl)/x#(10);
        attribute angleMargin : Real = 1-RealFunctions::abs(x#(5)*TrigFunctions::cos(x#(6)))/x#(11);
        return result : Real [4] ordered nonunique;
        (lift,drag,liftMargin,angleMargin)
    }
    calc def ImpedanceTerm {
        in x : Real [6] ordered nonunique;
        // encounter omega, rigid mass, added mass, stiffness, radiation damping, extra damping.
        attribute realPart : Real = x#(4)-x#(1)*x#(1)*(x#(2)+x#(3));
        attribute imaginaryPart : Real = -x#(1)*(x#(5)+x#(6));
        return result : Real [2] ordered nonunique;
        (realPart,imaginaryPart)
    }
    calc def BalanceCorrection {
        in x : Real [12] ordered nonunique;
        // baseline four normalized residuals; old/new total appendage drag,
        // old/new total lift; old/new water yaw moment; old/new water roll moment.
        attribute surgeResidual : Real = x#(1)+(x#(5)-x#(6))/10;
        attribute swayResidual : Real = x#(2)+(x#(7)-x#(8))/10;
        attribute yawResidual : Real = x#(3)+(x#(10)-x#(9))/10;
        attribute rollResidual : Real = x#(4)+(x#(11)-x#(12))/20;
        return result : Real [4] ordered nonunique;
        (surgeResidual,swayResidual,yawResidual,rollResidual)
    }
    calc def Actuation {
        in p : Real [41] ordered nonunique;
        in q : Real [*] ordered nonunique;
        in x : Real [3] ordered nonunique;
        // Wing torque, rudder torque, battery Wh; same duty model as Core.
        attribute wing : Real [3] ordered nonunique = MarineActuation::DrivePower(x#(1),p#(19),p#(3),p#(2),p#(4),p#(5),p#(6),p#(7),p#(8));
        attribute rudder : Real [3] ordered nonunique = MarineActuation::DrivePower(x#(2),p#(20),p#(3),1,1,0.1,p#(9)*x#(2),p#(10),1-p#(10));
        attribute peak : Real = p#(11)+wing#(2)+rudder#(2);
        attribute averagePower : Real = p#(11)+wing#(1)+rudder#(1);
        attribute peakMargin : Real = (q#(19)*x#(3)-peak/q#(15)-q#(20))/100;
        return result : Real [3] ordered nonunique;
        (averagePower,peak,peakMargin)
    }
}
