import {
  demoStore as store,
  japanDate,
  totalMinutes,
} from "./js/demo-store.js";

const $ = (selector) => document.querySelector(selector);
// ユーザーが入力した文字列はHTMLとして解釈させない。
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
const duration = (minutes) =>
  `${Math.floor(minutes / 60)}時間${String(minutes % 60).padStart(2, "0")}分`;
const clock = (milliseconds) => {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return [
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
};
const displayDate = (date) =>
  new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(`${date}T12:00:00+09:00`));
const richDuration = (minutes) =>
  `<b>${Math.floor(minutes / 60)}</b>時間 <b>${String(minutes % 60).padStart(2, "0")}</b>分`;
const recordDialog = $("#study-modal");
const dailyDialog = $("#daily-modal");
let startedAt = null;
let calendarYear = Number(japanDate().slice(0, 4));
let calendarMonth = Number(japanDate().slice(5, 7)) - 1;
let selectedDate = japanDate();
let editingSubjectId = null;
let draft = null;
let rowSequence = 0;
let toastTimer;
let activePage = "";

function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").hidden = false;
  toastTimer = setTimeout(() => {
    $("#toast").hidden = true;
  }, 4000);
}

function showPage() {
  const requested = location.hash.slice(1);
  const page = ["timer", "review", "subjects"].includes(requested)
    ? requested
    : "timer";
  if (activePage !== page) {
    window.scrollTo(0, 0);
    activePage = page;
  }
  document.querySelectorAll(".page").forEach((section) => {
    section.hidden = section.id !== `page-${page}`;
  });
  document.querySelectorAll("[data-page]").forEach((link) => {
    if (link.dataset.page === page) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  $("#running-banner").hidden = !startedAt || page === "timer";
  document.title = `${{ timer: "計測する", review: "振り返る", subjects: "分野を管理" }[page]} — 学習記録`;
}

function renderOverview() {
  const records = store.listRecords();
  const subjects = store.listSubjects();
  const names = new Map(subjects.map((subject) => [subject.id, subject.name]));
  const todayRecords = records.filter(
    (record) => record.studyDate === japanDate(),
  );
  $("#today-total").innerHTML = richDuration(
    todayRecords.reduce((sum, record) => sum + totalMinutes(record), 0),
  );
  $("#today-count").textContent =
    `${todayRecords.length}件の学習記録を残しました。`;
  $("#all-total").innerHTML = richDuration(
    records.reduce((sum, record) => sum + totalMinutes(record), 0),
  );
  const grouped = new Map();
  records
    .flatMap((record) => record.details)
    .forEach((detail) =>
      grouped.set(
        detail.subjectId,
        (grouped.get(detail.subjectId) ?? 0) + detail.durationMinutes,
      ),
    );
  $("#subject-totals").innerHTML =
    [...grouped]
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
      .map(
        ([id, minutes]) =>
          `<div class="summary-row"><span><i class="subject-dot" aria-hidden="true"></i>${escapeHtml(names.get(id))}</span><strong>${duration(minutes)}</strong></div>`,
      )
      .join("") ||
    '<p class="empty-state">まだ記録がありません。最初の学びを残しましょう。</p>';
  $("#recent-records").innerHTML =
    records
      .sort((a, b) => b.studyDate.localeCompare(a.studyDate) || b.id - a.id)
      .slice(0, 3)
      .map(
        (record) =>
          `<button type="button" class="recent-row" data-date="${record.studyDate}"><span class="recent-date">${escapeHtml(displayDate(record.studyDate))}</span><span class="recent-info"><strong>${escapeHtml([...new Set(record.details.map((detail) => names.get(detail.subjectId)))].join(" / "))}</strong><small>${escapeHtml(
            record.details
              .map((detail) => detail.memo)
              .filter(Boolean)
              .join(" ・ ") || "学習の記録",
          )}</small></span><span class="recent-duration">${duration(totalMinutes(record))}</span><span class="recent-arrow" aria-hidden="true">↗</span></button>`,
      )
      .join("") || '<p class="empty-state">学習記録はまだありません。</p>';
}

function renderCalendar() {
  $("#calendar-month").textContent = `${calendarYear}年${calendarMonth + 1}月`;
  const firstDay = new Date(
    Date.UTC(calendarYear, calendarMonth, 1),
  ).getUTCDay();
  const dayCount = new Date(
    Date.UTC(calendarYear, calendarMonth + 1, 0),
  ).getUTCDate();
  const totals = new Map();
  store
    .listRecords()
    .forEach((record) =>
      totals.set(
        record.studyDate,
        (totals.get(record.studyDate) ?? 0) + totalMinutes(record),
      ),
    );
  const cells = Array(firstDay).fill(
    '<span class="calendar-blank" aria-hidden="true"></span>',
  );
  for (let day = 1; day <= dayCount; day++) {
    const date = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const minutes = totals.get(date) ?? 0;
    cells.push(
      `<button type="button" class="calendar-day ${date === japanDate() ? "is-today" : ""} ${minutes ? "has-record" : ""}" data-date="${date}" ${date === japanDate() ? 'aria-current="date"' : ""} aria-label="${date} ${minutes ? duration(minutes) : "記録なし"}"><span>${day}</span>${minutes ? `<span class="day-time">${duration(minutes)}</span>` : ""}</button>`,
    );
  }
  while (cells.length % 7)
    cells.push('<span class="calendar-blank" aria-hidden="true"></span>');
  $("#calendar-grid").innerHTML = cells.join("");
}

function renderSubjects() {
  const subjects = store.listSubjects();
  $("#subject-count").textContent = `${subjects.length}分野`;
  $("#subject-list").innerHTML =
    subjects
      .map((subject) => {
        if (subject.id === editingSubjectId)
          return `<form class="subject-row" data-subject-id="${subject.id}"><label class="muted" for="rename-${subject.id}">分野名</label><input id="rename-${subject.id}" name="name" value="${escapeHtml(subject.name)}" maxlength="100" aria-describedby="subject-list-error" /><button type="submit" class="button button-primary button-small">更新</button><button type="button" class="button button-small" data-cancel-subject>取り消す</button></form>`;
        return `<div class="subject-row"><span class="subject-label"><i class="subject-dot" aria-hidden="true"></i>${escapeHtml(subject.name)}</span><button type="button" class="button button-small" data-rename-subject="${subject.id}" aria-label="${escapeHtml(subject.name)}の名前変更">名前変更</button><button type="button" class="button button-small danger-text" data-delete-subject="${subject.id}" aria-label="${escapeHtml(subject.name)}を削除">削除</button></div>`;
      })
      .join("") ||
    '<p class="empty-state">分野を追加して、学びを分類しましょう。</p>';
}

function renderDaily() {
  const subjects = new Map(
    store.listSubjects().map((subject) => [subject.id, subject.name]),
  );
  const records = store
    .listRecords()
    .filter((record) => record.studyDate === selectedDate)
    .sort((a, b) => a.id - b.id);
  $("#daily-title").textContent = `${displayDate(selectedDate)}の記録`;
  $("#daily-total").textContent = duration(
    records.reduce((sum, record) => sum + totalMinutes(record), 0),
  );
  $("#daily-records").innerHTML =
    records
      .map(
        (record, index) =>
          `<article class="daily-record"><div class="section-heading"><h3>記録 ${index + 1} <span class="muted">／ ${duration(totalMinutes(record))}</span></h3><div class="record-tools"><button type="button" class="button button-small" data-edit-record="${record.id}">編集</button><button type="button" class="button button-small danger-text" data-delete-record="${record.id}">削除</button></div></div>${record.details.map((detail) => `<div class="daily-detail"><div class="daily-detail-heading"><strong>${escapeHtml(subjects.get(detail.subjectId))}</strong><span>${duration(detail.durationMinutes)}</span></div>${detail.memo ? `<p>${escapeHtml(detail.memo)}</p>` : ""}</div>`).join("")}</article>`,
      )
      .join("") ||
    '<p class="empty-state">この日の学習記録はありません。<br />記録を追加して、学びを残しましょう。</p>';
  $("#daily-add").disabled = Boolean(startedAt);
}
function openDaily(date) {
  selectedDate = date;
  renderDaily();
  dailyDialog.showModal();
}
function renderAll() {
  renderOverview();
  renderCalendar();
  renderSubjects();
  if (dailyDialog.open) renderDaily();
}

function addRow(detail = {}) {
  const key = ++rowSequence;
  const row = document.createElement("div");
  row.className = "record-row";
  row.innerHTML = `<div class="record-row-grid"><div><label for="row-subject-${key}">分野 <span class="required">必須</span></label><select id="row-subject-${key}" name="subjectId" aria-describedby="row-error-${key}"><option value="">分野を選択</option>${store
    .listSubjects()
    .map(
      (subject) =>
        `<option value="${subject.id}" ${subject.id === detail.subjectId ? "selected" : ""}>${escapeHtml(subject.name)}</option>`,
    )
    .join(
      "",
    )}</select></div><div><label for="row-hours-${key}">学習時間 <span class="required">必須</span></label><div class="time-inputs"><input id="row-hours-${key}" name="hours" type="number" min="0" max="24" step="1" value="${Math.floor((detail.durationMinutes ?? 0) / 60)}" aria-label="学習時間の時間" aria-describedby="row-error-${key}" /><span>時間</span><input name="minutes" type="number" min="0" max="59" step="1" value="${(detail.durationMinutes ?? 0) % 60}" aria-label="学習時間の分" aria-describedby="row-error-${key}" /><span>分</span></div></div><div class="memo-field"><label for="row-memo-${key}">メモ</label><textarea id="row-memo-${key}" name="memo" rows="1" maxlength="1000" placeholder="学んだことをひと言" aria-describedby="row-error-${key}">${escapeHtml(detail.memo)}</textarea></div><button class="row-remove" type="button" aria-label="この入力行を削除">×</button></div><p class="field-error row-error" id="row-error-${key}"></p>`;
  $("#record-rows").append(row);
  updateDraftTotal();
  return row;
}
function readRows() {
  return [...document.querySelectorAll(".record-row")].map((row) => {
    const hours = row.querySelector('[name="hours"]').value;
    const minutes = row.querySelector('[name="minutes"]').value;
    return {
      row,
      hours,
      minutes,
      subjectId: Number(row.querySelector("select").value),
      durationMinutes: Number(hours) * 60 + Number(minutes),
      memo: row.querySelector("textarea").value || null,
    };
  });
}
function updateDraftTotal() {
  const rows = readRows();
  const total = rows.reduce(
    (sum, row) =>
      sum + (Number.isFinite(row.durationMinutes) ? row.durationMinutes : 0),
    0,
  );
  $("#record-total").textContent = duration(Math.max(0, Math.floor(total)));
  const measured = draft?.startedAt
    ? Math.floor((new Date(draft.endedAt) - new Date(draft.startedAt)) / 60000)
    : null;
  const validTimes =
    rows.length > 0 &&
    rows.every(
      (row) =>
        row.hours !== "" &&
        row.minutes !== "" &&
        Number.isInteger(Number(row.hours)) &&
        Number(row.hours) >= 0 &&
        Number.isInteger(Number(row.minutes)) &&
        Number(row.minutes) >= 0 &&
        Number(row.minutes) <= 59 &&
        row.durationMinutes >= 1,
    ) &&
    total <= 1440;
  $("#time-warning").hidden =
    !validTimes || measured === null || measured === total;
  $("#time-warning").textContent =
    `計測時間は${measured}分、入力合計は${total}分です。このまま保存できます。`;
}
function openRecord({
  id = null,
  measuredStart = null,
  measuredEnd = null,
  fromDaily = false,
} = {}) {
  if (dailyDialog.open) dailyDialog.close();
  const existing = id === null ? null : store.getRecord(id);
  draft = {
    id,
    fromDaily,
    startedAt: existing?.startedAt ?? measuredStart,
    endedAt: existing?.endedAt ?? measuredEnd,
  };
  $("#record-title").textContent =
    id === null ? "学習記録を入力" : "学習記録を編集";
  $("#save-record").textContent = id === null ? "記録する →" : "更新する →";
  $("#discard-record").textContent =
    id === null ? "破棄する" : "変更を破棄する";
  $("#study-date").value =
    existing?.studyDate ??
    (measuredStart ? japanDate(measuredStart) : japanDate());
  $("#study-date").max = japanDate();
  $("#study-date").removeAttribute("aria-invalid");
  $("#date-error").textContent = "";
  $("#record-error").textContent = "";
  $("#record-rows").replaceChildren();
  $("#measured-box").hidden = !draft.startedAt;
  if (draft.startedAt)
    $("#measured-time").textContent = duration(
      Math.floor((new Date(draft.endedAt) - new Date(draft.startedAt)) / 60000),
    );
  (existing?.details ?? [{}]).forEach(addRow);
  recordDialog.showModal();
}
function closeRecord(savedDate = null) {
  const returnToDaily = draft.fromDaily;
  recordDialog.close();
  draft = null;
  renderAll();
  if (returnToDaily) openDaily(savedDate ?? selectedDate);
}
function validateRecord() {
  let valid = true;
  const date = $("#study-date").value;
  const dateError =
    !date || date > japanDate()
      ? "今日以前の有効な学習日を入力してください。"
      : "";
  $("#date-error").textContent = dateError;
  $("#study-date").setAttribute("aria-invalid", String(Boolean(dateError)));
  valid = !dateError;
  const rows = readRows();
  const subjects = store.listSubjects();
  for (const item of rows) {
    let error = "";
    if (!subjects.some((subject) => subject.id === item.subjectId))
      error = "分野を選択してください。";
    else if (
      item.hours === "" ||
      item.minutes === "" ||
      !Number.isInteger(Number(item.hours)) ||
      !Number.isInteger(Number(item.minutes)) ||
      Number(item.hours) < 0 ||
      Number(item.minutes) < 0 ||
      Number(item.minutes) > 59 ||
      item.durationMinutes < 1 ||
      item.durationMinutes > 1440
    )
      error =
        "時間は0以上、分は0〜59の整数で、1分以上・24時間以内にしてください。";
    else if ([...(item.memo ?? "")].length > 1000)
      error = "メモは1000文字以内で入力してください。";
    item.row.querySelector(".row-error").textContent = error;
    item.row
      .querySelectorAll("input, select, textarea")
      .forEach((field) =>
        field.setAttribute("aria-invalid", String(Boolean(error))),
      );
    if (error) valid = false;
  }
  const total = rows.reduce((sum, item) => sum + item.durationMinutes, 0);
  const overallError =
    rows.length === 0
      ? "入力行を1行以上追加してください。"
      : total > 1440
        ? "合計学習時間は24時間以内にしてください。"
        : "";
  $("#record-error").textContent = overallError;
  if (overallError) valid = false;
  if (!valid) recordDialog.querySelector('[aria-invalid="true"]')?.focus();
  return valid
    ? {
        studyDate: date,
        startedAt: draft.startedAt,
        endedAt: draft.endedAt,
        details: rows.map(({ subjectId, durationMinutes, memo }) => ({
          subjectId,
          durationMinutes,
          memo,
        })),
      }
    : null;
}

function tick() {
  const text = startedAt ? clock(Date.now() - new Date(startedAt)) : "00:00:00";
  $("#timer").textContent = text;
  $("#running-time").textContent = text;
}
function renderTimerState() {
  $("#timer-action").textContent = startedAt ? "■ 計測を終了" : "▶ 計測を開始";
  $("#timer-status").textContent = startedAt ? "計測中" : "開始前";
  $("#timer-status").classList.toggle("active", Boolean(startedAt));
  $("#manual-add").disabled = Boolean(startedAt);
  $("#timer-hint").textContent = startedAt
    ? "そのまま集中して大丈夫。画面を移動しても計測は続きます。"
    : "終わったら、学んだことを記録しましょう。";
  tick();
  showPage();
}
$("#timer-action").addEventListener("click", () => {
  if (!startedAt) startedAt = new Date().toISOString();
  else {
    const measuredStart = startedAt;
    const measuredEnd = new Date().toISOString();
    startedAt = null;
    openRecord({ measuredStart, measuredEnd });
  }
  renderTimerState();
});
$("#manual-add").addEventListener("click", () => openRecord());
$("#add-row").addEventListener("click", () =>
  addRow().querySelector("select").focus(),
);
$("#record-rows").addEventListener("input", (event) => {
  const row = event.target.closest(".record-row");
  if (row) {
    row.querySelector(".row-error").textContent = "";
    row
      .querySelectorAll("[aria-invalid]")
      .forEach((field) => field.removeAttribute("aria-invalid"));
  }
  $("#record-error").textContent = "";
  updateDraftTotal();
});
$("#study-date").addEventListener("input", () => {
  $("#date-error").textContent = "";
  $("#study-date").removeAttribute("aria-invalid");
});
$("#record-rows").addEventListener("click", (event) => {
  const button = event.target.closest(".row-remove");
  if (button) {
    button.closest(".record-row").remove();
    updateDraftTotal();
  }
});
recordDialog.addEventListener("cancel", (event) => event.preventDefault());
$("#record-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = validateRecord();
  if (!payload) return;
  $("#save-record").disabled = true;
  try {
    const edited = draft.id !== null;
    store.saveRecord(payload, draft.id);
    closeRecord(payload.studyDate);
    toast(
      edited
        ? "デモの学習記録を更新しました。"
        : "デモに学習記録を追加しました。",
    );
  } catch (error) {
    $("#record-error").textContent = error.message;
  } finally {
    $("#save-record").disabled = false;
  }
});
$("#discard-record").addEventListener("click", () => {
  if (
    window.confirm(
      draft.id === null
        ? "入力した学習記録を破棄しますか？"
        : "変更を破棄しますか？元の記録は残ります。",
    )
  )
    closeRecord();
});
$("#recent-records").addEventListener("click", (event) => {
  const row = event.target.closest("[data-date]");
  if (row) openDaily(row.dataset.date);
});
$("#calendar-grid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (button) openDaily(button.dataset.date);
});
function moveMonth(offset) {
  const date = new Date(Date.UTC(calendarYear, calendarMonth + offset, 1));
  calendarYear = date.getUTCFullYear();
  calendarMonth = date.getUTCMonth();
  renderCalendar();
}
$("#previous-month").addEventListener("click", () => moveMonth(-1));
$("#next-month").addEventListener("click", () => moveMonth(1));
$("#this-month").addEventListener("click", () => {
  calendarYear = Number(japanDate().slice(0, 4));
  calendarMonth = Number(japanDate().slice(5, 7)) - 1;
  renderCalendar();
});
$("#close-daily").addEventListener("click", () => dailyDialog.close());
$("#daily-close-bottom").addEventListener("click", () => dailyDialog.close());
$("#daily-add").addEventListener("click", () =>
  openRecord({ fromDaily: true }),
);
$("#daily-records").addEventListener("click", (event) => {
  const edit = event.target.closest("[data-edit-record]");
  const remove = event.target.closest("[data-delete-record]");
  if (edit)
    openRecord({ id: Number(edit.dataset.editRecord), fromDaily: true });
  if (
    remove &&
    window.confirm("この学習記録と、すべての明細を削除しますか？")
  ) {
    store.deleteRecord(Number(remove.dataset.deleteRecord));
    renderAll();
    toast("デモの学習記録を削除しました。");
  }
});
$("#subject-form").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    store.saveSubject($("#subject-name").value);
    $("#subject-name").value = "";
    $("#subject-error").textContent = "";
    renderAll();
    toast("分野を追加しました。");
  } catch (error) {
    $("#subject-error").textContent = error.message;
  }
});
$("#subject-list").addEventListener("click", (event) => {
  const rename = event.target.closest("[data-rename-subject]");
  const cancel = event.target.closest("[data-cancel-subject]");
  const remove = event.target.closest("[data-delete-subject]");
  $("#subject-list-error").textContent = "";
  if (rename) {
    editingSubjectId = Number(rename.dataset.renameSubject);
    renderSubjects();
    $("#subject-list input")?.focus();
  }
  if (cancel) {
    editingSubjectId = null;
    renderSubjects();
  }
  if (remove && window.confirm("この分野を削除しますか？")) {
    try {
      store.deleteSubject(Number(remove.dataset.deleteSubject));
      renderAll();
      toast("分野を削除しました。");
    } catch (error) {
      $("#subject-list-error").textContent = error.message;
    }
  }
});
$("#subject-list").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    store.saveSubject(
      new FormData(event.target).get("name"),
      Number(event.target.dataset.subjectId),
    );
    editingSubjectId = null;
    $("#subject-list-error").textContent = "";
    renderAll();
    toast("分野名を変更しました。");
  } catch (error) {
    $("#subject-list-error").textContent = error.message;
  }
});
// デモではログアウトの代わりにログイン見本へ移動する。
$(".account a").addEventListener("click", (event) => {
  if (
    startedAt &&
    !window.confirm(
      "この画面を離れるとデモの計測は破棄されます。移動しますか？",
    )
  )
    event.preventDefault();
});
window.addEventListener("hashchange", showPage);
$("#today-label").textContent = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
}).format(new Date());
renderAll();
renderTimerState();
setInterval(tick, 250);
