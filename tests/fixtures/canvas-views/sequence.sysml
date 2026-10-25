package DeskFan {
    private import ScalarValues::*;
    private import RequirementDerivation::*;
    doc /* Original notation fixture. Models possible behavior, not a recorded run or a safety-qualified fan. */
    requirement controlled { doc /* The user shall be able to start and stop the fan. */ }
    requirement guardedStart { doc /* Starting shall require an enabled guard input. */ }
    #derivation connection startDerivation {
        end #original source ::> controlled;
        end #derive target ::> guardedStart;
    }
    part controller;
    part motor;
    part fan {
        satisfy controlled;
        satisfy guardedStart;
    }
    action def StartCycle {
        in guardEnabled : Boolean;
        first start;
        decide permission;
        succession first start then permission;
        succession first permission if guardEnabled then prepare;
        succession first permission if not guardEnabled then refused;
        fork prepare;
        action energize;
        action recordRequest;
        join prepared;
        action running;
        action refused;
        succession first prepare then energize;
        succession first prepare then recordRequest;
        succession first energize then prepared;
        succession first recordRequest then prepared;
        succession first prepared then running;
        succession first running then done;
        succession first refused then done;
    }
    action startCycle : StartCycle;
    allocation controlResponsibility allocate startCycle to controller;
    verification def GuardCheck {
        objective { verify guardedStart; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification guardCheck : GuardCheck;
    state operating {
        entry; then idle;
        state idle;
        state active {
            entry; then accelerating;
            state accelerating;
            state steady;
            transition first accelerating then steady;
        }
        transition first idle then active;
        transition first active then idle;
    }
    item def StartRequest;
    item def Diagnostic;
    item def Ready;
    occurrence def StartupExchange {
        part panel { event occurrence sent; event occurrence received; }
        part control {
            event occurrence accepted;
            event occurrence checkSent;
            event occurrence checkReceived;
            event occurrence replied;
        }
        // Declaration order intentionally differs from causal ordering.
        message ready of Ready from control.replied to panel.received;
        message selfCheck of Diagnostic from control.checkSent to control.checkReceived;
        message request of StartRequest from panel.sent to control.accepted;
        succession first control.accepted then control.checkSent;
        succession first control.checkReceived then control.replied;
    }
}
