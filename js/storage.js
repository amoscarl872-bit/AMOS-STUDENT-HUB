"use strict";

/* ============================================================
   AMOS STUDENT HUB — STORAGE MODULE
   This file is the only owner of STORAGE_KEY and storage helpers.
============================================================ */

const STORAGE_KEY = "amos_student_hub_v1";

function cloneDefaultData() {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function loadData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return cloneDefaultData();
        }

        const parsed = JSON.parse(stored);

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error("Stored application data has an invalid structure.");
        }

        const defaults = cloneDefaultData();

        return {
            ...defaults,
            ...parsed,
            profile: {
                ...defaults.profile,
                ...(parsed.profile || {})
            },
            timetable: Array.isArray(parsed.timetable)
                ? parsed.timetable
                : defaults.timetable,
            units: Array.isArray(parsed.units)
                ? parsed.units
                : defaults.units,
            notes: Array.isArray(parsed.notes)
                ? parsed.notes
                : [],
            announcements: Array.isArray(parsed.announcements)
                ? parsed.announcements
                : [],
            groups: Array.isArray(parsed.groups)
                ? parsed.groups
                : [],
            resources: Array.isArray(parsed.resources)
                ? parsed.resources
                : defaults.resources,
            transcripts: Array.isArray(parsed.transcripts)
                ? parsed.transcripts
                : []
        };
    } catch (error) {
        console.error("Unable to load stored data:", error);

        if (typeof showToast === "function") {
            showToast(
                "Stored data could not be loaded. Default data has been restored.",
                "error"
            );
        }

        return cloneDefaultData();
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
    } catch (error) {
        console.error("Unable to save data:", error);

        if (typeof showToast === "function") {
            showToast(
                "Could not save data. Browser storage may be unavailable.",
                "error"
            );
        }

        return false;
    }
}
