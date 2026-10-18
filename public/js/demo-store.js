/**
 * 画面確認専用のデータ置き場。API・認証・DB保存は行わない。
 * Spring Boot接続時はこの層をfetch()で置き換える（docs/ui-demo.md参照）。
 */
export function japanDate(value = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

const relativeDate = (offset) => japanDate(Date.now() + offset * 86400000);
let subjects = [
  { id: 1, name: "JavaScript" },
  { id: 2, name: "Java / Spring Boot" },
  { id: 3, name: "MySQL" },
  { id: 4, name: "HTML / CSS" },
];
let records = [
  {
    id: 1,
    studyDate: relativeDate(0),
    startedAt: null,
    endedAt: null,
    details: [
      {
        subjectId: 2,
        durationMinutes: 60,
        memo: "ControllerとServiceの役割を整理",
      },
      { subjectId: 3, durationMinutes: 30, memo: "テーブルの関連と外部キー" },
    ],
  },
  {
    id: 2,
    studyDate: relativeDate(-1),
    startedAt: null,
    endedAt: null,
    details: [
      { subjectId: 1, durationMinutes: 45, memo: "配列操作とイベント処理" },
      { subjectId: 4, durationMinutes: 30, memo: "GridとFlexboxを復習" },
    ],
  },
  {
    id: 3,
    studyDate: relativeDate(-3),
    startedAt: null,
    endedAt: null,
    details: [
      { subjectId: 2, durationMinutes: 90, memo: "Spring Bootの基本を読む" },
      { subjectId: 2, durationMinutes: 30, memo: "学習内容をノートにまとめる" },
    ],
  },
  {
    id: 4,
    studyDate: relativeDate(-5),
    startedAt: null,
    endedAt: null,
    details: [
      { subjectId: 3, durationMinutes: 60, memo: "SELECTとJOINの練習" },
    ],
  },
];
let nextRecordId = 5;
let nextSubjectId = 5;
const copy = (value) => structuredClone(value);
export const totalMinutes = (record) =>
  record.details.reduce((sum, detail) => sum + detail.durationMinutes, 0);

export const demoStore = {
  listSubjects: () => copy(subjects),
  listRecords: () => copy(records),
  getRecord: (id) => copy(records.find((record) => record.id === id)),
  saveRecord(payload, id = null) {
    if (id !== null && !records.some((record) => record.id === id))
      throw new Error("学習記録が見つかりません。");
    const result = { ...copy(payload), id: id ?? nextRecordId++ };
    if (id === null) records.push(result);
    else
      records = records.map((record) => (record.id === id ? result : record));
    return copy(result);
  },
  deleteRecord(id) {
    records = records.filter((record) => record.id !== id);
  },
  saveSubject(rawName, id = null) {
    const name = rawName.trim();
    if (!name || [...name].length > 100)
      throw new Error("分野名は1〜100文字で入力してください。");
    if (
      subjects.some(
        (subject) =>
          subject.id !== id &&
          subject.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      throw new Error("同じ名前の分野がすでに登録されています。");
    }
    if (id !== null && !subjects.some((subject) => subject.id === id))
      throw new Error("分野が見つかりません。");
    const result = { id: id ?? nextSubjectId++, name };
    if (id === null) subjects.push(result);
    else
      subjects = subjects.map((subject) =>
        subject.id === id ? result : subject,
      );
    return copy(result);
  },
  deleteSubject(id) {
    if (
      records.some((record) =>
        record.details.some((detail) => detail.subjectId === id),
      )
    ) {
      throw new Error("学習記録で使用されているため削除できません。");
    }
    subjects = subjects.filter((subject) => subject.id !== id);
  },
};
