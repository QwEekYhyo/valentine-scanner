import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

import PatientForm from "./components/PatientForm";
import BodyAnalysis from "./components/BodyAnalysis";

function App() {
    const [activeScreen, setActiveScreen] = useState<"form" | "analysis">("form");

    const [bleStatus, setBleStatus] = useState<string>("Initializing...");
    const [notified, setNotified] = useState<boolean>(false);

    const [bleProblem, setBleProblem] = useState<boolean>(false);
    const [bleMocked, setBleMocked] = useState<boolean>(false);

    useEffect(() => {
        // Listen for BLE status updates
        const unlistenStatus = listen<string>("ble-status", (event) => {
            setBleStatus(event.payload);
        });

        // Listen for BLE notifications
        const unlistenNotifications = listen("ble-notification", () => setNotified(true));

        return () => {
            unlistenStatus.then((fn) => fn());
            unlistenNotifications.then((fn) => fn());
        };
    }, []);

    useEffect(() => {
        let statusTimeoutId: NodeJS.Timeout | undefined;
        if (bleStatus === "Initializing...") {
            statusTimeoutId = setTimeout(() => {
                if (bleStatus === "Initializing...") {
                    setBleProblem(true);
                }
            }, 5000);
        } else if (statusTimeoutId) clearTimeout(statusTimeoutId);

        return () => {
            if (statusTimeoutId) clearTimeout(statusTimeoutId);
        };
    }, [bleStatus]);

    return (
        <main>
            <div className="flex flex-col h-screen bg-background">
                <div className="flex flex-col absolute right-4 bottom-4 text-right text-sm text-muted-foreground">
                    {!bleProblem ? null : (
                        <div>
                            <span>BLE seems to have problems, enable mock: </span>
                            <input
                                type="checkbox"
                                className="accent-primary"
                                checked={bleMocked}
                                onChange={() => setBleMocked((prev) => !prev)}
                            />
                        </div>
                    )}
                    <span>{bleStatus}</span>
                </div>
                {activeScreen === "form" ? (
                    <PatientForm onContinue={() => setActiveScreen("analysis")} />
                ) : (
                    <BodyAnalysis
                        onBack={() => setActiveScreen("form")}
                        notified={notified}
                        setNotified={setNotified}
                        bleMocked={bleMocked}
                    />
                )}
            </div>
        </main>
    );
}

export default App;
