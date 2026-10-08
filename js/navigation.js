"use strict";

/* ============================================================
   NAVIGATION
============================================================ */

const sectionTitles = {
    dashboard: "Dashboard",
    timetable: "Timetable",
    units: "My Units",
    notes: "My Notes",
    resources: "Resources",
    transcripts: "Transcripts",
    announcements: "Announcements",
    groups: "Groups",
    profile: "My Profile",
    settings: "Settings"
};

function navigateTo(sectionId) {
    const section = document.getElementById(sectionId);

    if (!section) {
        showToast("The requested section does not exist.", "error");
        return;
    }

    document.querySelectorAll(".page-section").forEach(sectionElement => {
        sectionElement.classList.remove("active");
    });

    section.classList.add("active");

    document.querySelectorAll(".nav-link[data-section]").forEach(button => {
        button.classList.toggle("active", button.dataset.section === sectionId);
    });

    $("#pageTitle").textContent = sectionTitles[sectionId] || "AMOS STUDENT HUB";
    $("#sidebar").classList.remove("open");

    window.scrollTo({ top: 0, behavior: "smooth" });
}
