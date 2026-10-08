"use strict";

/* ============================================================
   DATE / TIME
============================================================ */

function updateClock() {

    const now = new Date();

    $("#currentDate").textContent =
        now.toLocaleDateString(
            "en-KE",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    $("#todayName").textContent =
        now.toLocaleDateString(
            "en-KE",
            {
                weekday: "long"
            }
        );

}


function getCurrentDay() {

    return new Date().toLocaleDateString(
        "en-KE",
        {
            weekday: "long"
        }
    );
}


function timeToMinutes(time) {

    const [hours, minutes] =
        time.split(":").map(Number);

    return hours * 60 + minutes;
}


function getTodayClasses() {

    const today = getCurrentDay();

    return state.timetable
        .filter(item => item.day === today)
        .sort(
            (a, b) =>
                timeToMinutes(a.start) -
                timeToMinutes(b.start)
        );
}




/* ============================================================
   NEXT CLASS
============================================================ */

function renderNextClass() {

    const now = new Date();

    const dayIndex = now.getDay();

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    let next = null;
    let smallestDifference = Infinity;

    state.timetable.forEach(item => {

        const targetDay =
            days.indexOf(item.day);

        if (targetDay === -1) {
            return;
        }

        let dayDifference =
            targetDay - dayIndex;

        if (dayDifference < 0) {
            dayDifference += 7;
        }

        const [hours, minutes] =
            item.start.split(":").map(Number);

        const target = new Date(now);

        target.setHours(
            hours,
            minutes,
            0,
            0
        );

        if (dayDifference > 0) {
            target.setDate(
                target.getDate() + dayDifference
            );
        }

        if (
            dayDifference === 0 &&
            target <= now
        ) {
            target.setDate(
                target.getDate() + 7
            );
        }

        const difference =
            target.getTime() - now.getTime();

        if (difference < smallestDifference) {
            smallestDifference = difference;
            next = {
                ...item,
                target
            };
        }

    });


    const container =
        $("#nextClass");

    if (!next) {

        container.innerHTML = `
            <div class="empty-state">
                <p>No upcoming classes.</p>
            </div>
        `;

        return;
    }


    const hoursRemaining =
        Math.floor(
            smallestDifference /
            (1000 * 60 * 60)
        );

    const minutesRemaining =
        Math.floor(
            (smallestDifference %
                (1000 * 60 * 60)) /
            (1000 * 60)
        );

    container.innerHTML = `

        <div style="
            padding:18px;
            background:var(--surface-2);
            border-radius:13px;
        ">

            <div style="
                color:var(--primary);
                font-weight:900;
                font-size:13px;
            ">
                ${escapeHTML(next.day)}
            </div>

            <div style="
                font-size:22px;
                font-weight:900;
                margin-top:5px;
            ">
                ${escapeHTML(next.unit)}
            </div>

            <div style="
                color:var(--muted);
                font-size:13px;
                margin-top:5px;
            ">
                ${escapeHTML(next.time)}
            </div>

            <div style="
                color:var(--muted);
                font-size:13px;
                margin-top:3px;
            ">
                ${escapeHTML(next.venue)}
            </div>

            <div style="
                margin-top:14px;
                color:var(--primary);
                font-size:12px;
                font-weight:800;
            ">
                ${hoursRemaining}h ${minutesRemaining}m until class
            </div>

        </div>
    `;
}




/* ============================================================
   TIMETABLE RENDERING
============================================================ */

function renderTimetable() {

    const order = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    const classes =
        [...state.timetable].sort((a, b) => {

            const dayDifference =
                order.indexOf(a.day) -
                order.indexOf(b.day);

            if (dayDifference !== 0) {
                return dayDifference;
            }

            return timeToMinutes(a.start) -
                timeToMinutes(b.start);
        });


    const body =
        $("#timetableBody");

    if (!classes.length) {

        body.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        No classes have been added.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    body.innerHTML =
        classes.map(item => `

            <tr>

                <td class="day-label">
                    ${escapeHTML(item.day)}
                </td>

                <td>
                    ${escapeHTML(item.time)}
                </td>

                <td>
                    <div class="unit-name">
                        ${escapeHTML(item.unit)}
                    </div>
                </td>

                <td>
                    <div class="venue">
                        ${escapeHTML(item.venue)}
                    </div>
                </td>

                <td>

                    <span class="mode-pill ${
                        item.mode.toLowerCase().includes("online")
                            ? "online"
                            : "inperson"
                    }">
                        ${escapeHTML(item.mode)}
                    </span>

                </td>

                <td>

                    <button
                        class="btn"
                        onclick="editClass('${item.id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="btn btn-danger"
                        onclick="deleteClass('${item.id}')"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `).join("");
}


/* ============================================================
   UNITS
============================================================ */



/* ============================================================
   TIMETABLE CRUD
============================================================ */

function addClass() {

    openModal(
        "Add Class",
        `

        <div class="field">
            <label>Day</label>

            <select id="modalClassDay">
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
            </select>
        </div>

        <div class="field">
            <label>Start Time</label>

            <input
                id="modalClassStart"
                type="time"
                value="09:00"
            >
        </div>

        <div class="field">
            <label>End Time</label>

            <input
                id="modalClassEnd"
                type="time"
                value="11:00"
            >
        </div>

        <div class="field">
            <label>Unit</label>

            <input
                id="modalClassUnit"
                placeholder="e.g. COMP 107"
            >
        </div>

        <div class="field">
            <label>Venue</label>

            <input
                id="modalClassVenue"
                placeholder="e.g. KSU T V3"
            >
        </div>

        <div class="field">
            <label>Mode</label>

            <select id="modalClassMode">
                <option>In-person</option>
                <option>Online / LMS</option>
            </select>
        </div>

        `,
        () => {

            const day =
                $("#modalClassDay").value;

            const start =
                $("#modalClassStart").value;

            const end =
                $("#modalClassEnd").value;

            const unit =
                $("#modalClassUnit").value.trim();

            const venue =
                $("#modalClassVenue").value.trim();

            const mode =
                $("#modalClassMode").value;

            if (!unit || !venue) {

                showToast(
                    "Unit and venue are required.",
                    "error"
                );

                return false;
            }

            if (
                !start ||
                !end ||
                timeToMinutes(end) <= timeToMinutes(start)
            ) {

                showToast(
                    "End time must be later than start time.",
                    "error"
                );

                return false;
            }

            state.timetable.push({

                id: crypto.randomUUID(),
                day,
                start,
                end,
                time: formatTimeRange(start, end),
                unit,
                venue,
                mode

            });

            saveData();

            renderAll();

            showToast(
                "Class added successfully.",
                "success"
            );

            return true;
        }
    );
}


function editClass(id) {

    const item =
        state.timetable.find(
            classItem => classItem.id === id
        );

    if (!item) {
        showToast("Class not found.", "error");
        return;
    }


    openModal(
        "Edit Class",
        `

        <div class="field">
            <label>Day</label>

            <select id="modalClassDay">
                ${[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday"
                ].map(day => `
                    <option
                        ${day === item.day ? "selected" : ""}
                    >
                        ${day}
                    </option>
                `).join("")}
            </select>
        </div>

        <div class="field">
            <label>Start Time</label>

            <input
                id="modalClassStart"
                type="time"
                value="${escapeHTML(item.start)}"
            >
        </div>

        <div class="field">
            <label>End Time</label>

            <input
                id="modalClassEnd"
                type="time"
                value="${escapeHTML(item.end)}"
            >
        </div>

        <div class="field">
            <label>Unit</label>

            <input
                id="modalClassUnit"
                value="${escapeHTML(item.unit)}"
            >
        </div>

        <div class="field">
            <label>Venue</label>

            <input
                id="modalClassVenue"
                value="${escapeHTML(item.venue)}"
            >
        </div>

        <div class="field">
            <label>Mode</label>

            <select id="modalClassMode">
                <option
                    ${item.mode === "In-person" ? "selected" : ""}
                >
                    In-person
                </option>

                <option
                    ${item.mode === "Online / LMS" ? "selected" : ""}
                >
                    Online / LMS
                </option>
            </select>
        </div>

        `,
        () => {

            const start =
                $("#modalClassStart").value;

            const end =
                $("#modalClassEnd").value;

            if (
                !start ||
                !end ||
                timeToMinutes(end) <= timeToMinutes(start)
            ) {

                showToast(
                    "End time must be later than start time.",
                    "error"
                );

                return false;
            }

            item.day =
                $("#modalClassDay").value;

            item.start =
                start;

            item.end =
                end;

            item.time =
                formatTimeRange(start, end);

            item.unit =
                $("#modalClassUnit").value.trim();

            item.venue =
                $("#modalClassVenue").value.trim();

            item.mode =
                $("#modalClassMode").value;

            if (!item.unit || !item.venue) {

                showToast(
                    "Unit and venue are required.",
                    "error"
                );

                return false;
            }

            saveData();

            renderAll();

            showToast(
                "Class updated.",
                "success"
            );

            return true;
        }
    );
}


function deleteClass(id) {

    const item =
        state.timetable.find(
            classItem => classItem.id === id
        );

    if (!item) {
        return;
    }

    if (
        !confirm(
            `Delete ${item.unit} from your timetable?`
        )
    ) {
        return;
    }

    state.timetable =
        state.timetable.filter(
            classItem => classItem.id !== id
        );

    saveData();

    renderAll();

    showToast(
        "Class deleted.",
        "success"
    );
}


