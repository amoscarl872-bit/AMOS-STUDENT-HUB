"use strict";

/* ============================================================
   NOTES
============================================================ */

function renderNotes() {

    const body =
        $("#notesBody");

    if (!state.notes.length) {

        body.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <div class="empty-icon">✎</div>
                        <p>No notes saved yet.</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    body.innerHTML =
        state.notes.map(note => `

            <tr>

                <td>
                    <strong>
                        ${escapeHTML(note.title)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(note.unit)}
                </td>

                <td>
                    ${escapeHTML(note.type)}
                </td>

                <td>
                    ${escapeHTML(formatDate(note.date))}
                </td>

                <td>

                    <button
                        class="btn"
                        onclick="viewNote('${note.id}')"
                    >
                        View
                    </button>

                    <button
                        class="btn"
                        onclick="editNote('${note.id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="btn btn-danger"
                        onclick="deleteNote('${note.id}')"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `).join("");
}




function addNote() {

    openModal(
        "Add Note",
        `

        <div class="field">
            <label>Title</label>

            <input
                id="modalNoteTitle"
                placeholder="e.g. Real Numbers Summary"
            >
        </div>

        <div class="field">
            <label>Unit</label>

            <select id="modalNoteUnit">
                ${state.units.map(unit => `
                    <option>
                        ${escapeHTML(unit.code)}
                    </option>
                `).join("")}
            </select>
        </div>

        <div class="field">
            <label>Type</label>

            <select id="modalNoteType">
                <option>Lecture Note</option>
                <option>Revision</option>
                <option>Assignment</option>
                <option>Exam Preparation</option>
                <option>Personal</option>
            </select>
        </div>

        <div class="field">
            <label>Content</label>

            <textarea
                id="modalNoteContent"
                placeholder="Write your note here..."
            ></textarea>
        </div>

        `,
        () => {

            const title =
                $("#modalNoteTitle").value.trim();

            const unit =
                $("#modalNoteUnit").value;

            const type =
                $("#modalNoteType").value;

            const content =
                $("#modalNoteContent").value.trim();

            if (!title || !content) {

                showToast(
                    "Note title and content are required.",
                    "error"
                );

                return false;
            }

            state.notes.push({

                id: crypto.randomUUID(),
                title,
                unit,
                type,
                content,
                date: new Date().toISOString().split("T")[0]

            });

            saveData();

            renderAll();

            showToast(
                "Note saved.",
                "success"
            );

            return true;
        }
    );
}


function viewNote(id) {

    const note =
        state.notes.find(
            item => item.id === id
        );

    if (!note) {
        return;
    }

    openModal(
        note.title,
        `

        <div style="
            color:var(--muted);
            font-size:12px;
            margin-bottom:15px;
        ">
            ${escapeHTML(note.unit)}
            •
            ${escapeHTML(note.type)}
            •
            ${escapeHTML(formatDate(note.date))}
        </div>

        <div style="
            white-space:pre-wrap;
            line-height:1.7;
            font-size:14px;
        ">
            ${escapeHTML(note.content)}
        </div>

        `,
        () => true
    );
}


function editNote(id) {

    const note =
        state.notes.find(
            item => item.id === id
        );

    if (!note) {
        return;
    }


    openModal(
        "Edit Note",
        `

        <div class="field">
            <label>Title</label>

            <input
                id="modalNoteTitle"
                value="${escapeHTML(note.title)}"
            >
        </div>

        <div class="field">
            <label>Unit</label>

            <select id="modalNoteUnit">
                ${state.units.map(unit => `
                    <option
                        ${unit.code === note.unit ? "selected" : ""}
                    >
                        ${escapeHTML(unit.code)}
                    </option>
                `).join("")}
            </select>
        </div>

        <div class="field">
            <label>Type</label>

            <select id="modalNoteType">

                ${[
                    "Lecture Note",
                    "Revision",
                    "Assignment",
                    "Exam Preparation",
                    "Personal"
                ].map(type => `
                    <option
                        ${type === note.type ? "selected" : ""}
                    >
                        ${type}
                    </option>
                `).join("")}

            </select>
        </div>

        <div class="field">
            <label>Content</label>

            <textarea id="modalNoteContent">${escapeHTML(note.content)}</textarea>
        </div>

        `,
        () => {

            note.title =
                $("#modalNoteTitle").value.trim();

            note.unit =
                $("#modalNoteUnit").value;

            note.type =
                $("#modalNoteType").value;

            note.content =
                $("#modalNoteContent").value.trim();

            if (!note.title || !note.content) {

                showToast(
                    "Title and content are required.",
                    "error"
                );

                return false;
            }

            saveData();

            renderAll();

            showToast(
                "Note updated.",
                "success"
            );

            return true;
        }
    );
}


function deleteNote(id) {

    if (!confirm("Delete this note?")) {
        return;
    }

    state.notes =
        state.notes.filter(
            note => note.id !== id
        );

    saveData();

    renderAll();

    showToast(
        "Note deleted.",
        "success"
    );
}


