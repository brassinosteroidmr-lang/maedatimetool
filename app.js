// ========================================
// 日本の祝日データ（2025-2026年）
// ========================================
const holidays = {
    '2025-01-01': '元日',
    '2025-01-13': '成人の日',
    '2025-02-11': '建国記念の日',
    '2025-02-23': '天皇誕生日',
    '2025-02-24': '振替休日',
    '2025-03-20': '春分の日',
    '2025-04-29': '昭和の日',
    '2025-05-03': '憲法記念日',
    '2025-05-04': 'みどりの日',
    '2025-05-05': 'こどもの日',
    '2025-05-06': '振替休日',
    '2025-07-21': '海の日',
    '2025-08-11': '山の日',
    '2025-09-15': '敬老の日',
    '2025-09-23': '秋分の日',
    '2025-10-13': 'スポーツの日',
    '2025-11-03': '文化の日',
    '2025-11-23': '勤労感謝の日',
    '2025-11-24': '振替休日',
    '2026-01-01': '元日',
    '2026-01-12': '成人の日',
    '2026-02-11': '建国記念の日',
    '2026-02-23': '天皇誕生日',
    '2026-03-20': '春分の日',
    '2026-04-29': '昭和の日',
    '2026-05-03': '憲法記念日',
    '2026-05-04': 'みどりの日',
    '2026-05-05': 'こどもの日',
    '2026-05-06': '振替休日',
    '2026-07-20': '海の日',
    '2026-08-11': '山の日',
    '2026-09-21': '敬老の日',
    '2026-09-22': '国民の休日',
    '2026-09-23': '秋分の日',
    '2026-10-12': 'スポーツの日',
    '2026-11-03': '文化の日',
    '2026-11-23': '勤労感謝の日'
};

function isHoliday(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays[dateStr];
}

// ========================================
// 勤務時間管理
// ========================================
let WORK_START_HOUR = 8;
let WORK_START_MINUTE = 30;
let WORK_END_HOUR = 17;
let WORK_END_MINUTE = 30;

// 勤務時間の保存
function saveWorkTimeSettings() {
    const settings = {
        startHour: WORK_START_HOUR,
        startMinute: WORK_START_MINUTE,
        endHour: WORK_END_HOUR,
        endMinute: WORK_END_MINUTE
    };
    localStorage.setItem('work-time-settings', JSON.stringify(settings));
}

// 勤務時間の読み込み
function loadWorkTimeSettings() {
    const saved = localStorage.getItem('work-time-settings');
    if (saved) {
        const settings = JSON.parse(saved);
        WORK_START_HOUR = settings.startHour;
        WORK_START_MINUTE = settings.startMinute;
        WORK_END_HOUR = settings.endHour;
        WORK_END_MINUTE = settings.endMinute;

        // 入力フィールドに反映
        document.getElementById('work-start-time').value =
            `${String(WORK_START_HOUR).padStart(2, '0')}:${String(WORK_START_MINUTE).padStart(2, '0')}`;
        document.getElementById('work-end-time').value =
            `${String(WORK_END_HOUR).padStart(2, '0')}:${String(WORK_END_MINUTE).padStart(2, '0')}`;
    }
}

// 勤務時間設定の更新
function updateWorkTimeSettings() {
    const startTime = document.getElementById('work-start-time').value;
    const endTime = document.getElementById('work-end-time').value;

    if (!startTime || !endTime) {
        alert('開始時刻と終了時刻を入力してください');
        return;
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // 開始時刻が終了時刻より後の場合はエラー
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes >= endMinutes) {
        alert('終了時刻は開始時刻より後に設定してください');
        return;
    }

    WORK_START_HOUR = startHour;
    WORK_START_MINUTE = startMinute;
    WORK_END_HOUR = endHour;
    WORK_END_MINUTE = endMinute;

    saveWorkTimeSettings();
    updateWorkTimeDisplay();

    alert('勤務時間を更新しました');
}

function updateWorkTimeDisplay() {
    const now = new Date();

    // デジタル時刻
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const digitalTime = document.getElementById('digital-time');
    if (digitalTime) {
        digitalTime.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // 日付表示（ヘッダー）
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const day = dayNames[now.getDay()];
    const dateElem = document.getElementById('current-date');
    if (dateElem) {
        dateElem.textContent = `${year}年${month}月${date}日（${day}）`;
    }

    // 日付表示（時計セクション）
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) {
        dateDisplay.textContent = `${year}年${month}月${date}日（${day}）`;
    }

    // 勤務時間の計算（秒単位で計算）
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const workStartSeconds = WORK_START_HOUR * 3600 + WORK_START_MINUTE * 60;
    const workEndSeconds = WORK_END_HOUR * 3600 + WORK_END_MINUTE * 60;
    const totalWorkSeconds = workEndSeconds - workStartSeconds;

    let elapsedSeconds = 0;
    let remainingSeconds = totalWorkSeconds;
    let progressPercent = 0;

    if (currentSeconds < workStartSeconds) {
        // 勤務開始前
        elapsedSeconds = 0;
        remainingSeconds = totalWorkSeconds;
        progressPercent = 0;
    } else if (currentSeconds > workEndSeconds) {
        // 勤務終了後
        elapsedSeconds = totalWorkSeconds;
        remainingSeconds = 0;
        progressPercent = 100;
    } else {
        // 勤務時間中
        elapsedSeconds = currentSeconds - workStartSeconds;
        remainingSeconds = workEndSeconds - currentSeconds;
        progressPercent = (elapsedSeconds / totalWorkSeconds) * 100;
    }

    // プログレスバー更新
    const progressFill = document.getElementById('progress-bar-fill');
    const progressMarker = document.getElementById('progress-current-marker');
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
    if (progressMarker) {
        progressMarker.style.left = `${progressPercent}%`;
    }

    // 経過時間・残り時間表示（秒単位）
    const elapsedHours = Math.floor(elapsedSeconds / 3600);
    const elapsedMins = Math.floor((elapsedSeconds % 3600) / 60);
    const remainingHours = Math.floor(remainingSeconds / 3600);
    const remainingMins = Math.floor((remainingSeconds % 3600) / 60);

    const elapsedElem = document.getElementById('elapsed-time');
    const remainingElem = document.getElementById('remaining-time');
    if (elapsedElem) {
        elapsedElem.textContent = `経過: ${elapsedHours}:${String(elapsedMins).padStart(2, '0')}`;
    }
    if (remainingElem) {
        remainingElem.textContent = `残り: ${remainingHours}:${String(remainingMins).padStart(2, '0')}`;
    }

    // 砂時計アニメーション（勤務時間内のみ）
    const sandTop = document.getElementById('sand-top');
    const sandBottom = document.getElementById('sand-bottom');
    const hourglassContainer = document.getElementById('hourglass-container');

    if (sandTop && sandBottom && hourglassContainer) {
        // 平面として扱い、視覚的な面積ベースで砂を表現
        // - 上の砂の面積 + 下の砂の面積 = 100%（常に一定）
        // - 面積が一定速度で上から下へ移動
        //
        // 円錐の面積は高さの2乗に比例: A ∝ h²
        // したがって、h ∝ √A
        //
        // 上部の砂の面積比 = 1 - progress
        // 下部の砂の面積比 = progress

        const progressRatio = progressPercent / 100;
        const remainingRatio = 1 - progressRatio;

        // 面積比から高さ比を計算（平方根）
        const topHeightRatio = Math.sqrt(remainingRatio);
        const bottomHeightRatio = Math.sqrt(progressRatio);

        sandTop.style.height = `${topHeightRatio * 100}%`;
        sandBottom.style.height = `${bottomHeightRatio * 100}%`;

        // 勤務時間外はアニメーション停止
        if (currentSeconds < workStartSeconds || currentSeconds > workEndSeconds) {
            hourglassContainer.classList.add('paused');
        } else {
            hourglassContainer.classList.remove('paused');
        }
    }
}

function updateClock() {
    updateWorkTimeDisplay();
}

// ========================================
// 半年間カレンダー
// ========================================
let calendarStartOffset = 0; // 表示開始月のオフセット

function renderSixMonthCalendar() {
    const container = document.getElementById('calendar-container');
    const today = new Date();
    let html = '';

    // calendarStartOffsetから6ヶ月分
    for (let i = 0; i < 6; i++) {
        const year = today.getFullYear();
        const month = today.getMonth() + calendarStartOffset + i;
        const adjustedDate = new Date(year, month, 1);
        const adjustedYear = adjustedDate.getFullYear();
        const adjustedMonth = adjustedDate.getMonth();

        html += renderSingleMonth(adjustedYear, adjustedMonth);
    }

    container.innerHTML = html;
}

// 次の6ヶ月へ
function nextMonths() {
    calendarStartOffset += 6;
    renderSixMonthCalendar();
}

// 前の6ヶ月へ
function previousMonths() {
    calendarStartOffset -= 6;
    renderSixMonthCalendar();
}

// 今月にリセット
function resetToCurrentMonth() {
    calendarStartOffset = 0;
    renderSixMonthCalendar();
}

function renderSingleMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const today = new Date();

    let html = `<div class="calendar-month">`;
    html += `<div class="calendar-header"><h3>${year}年${month + 1}月</h3></div>`;
    html += `<div class="calendar-grid">`;

    // 曜日ヘッダー（色分け）
    const dayHeaders = [
        { text: '日', class: 'sun' },
        { text: '月', class: 'weekday' },
        { text: '火', class: 'weekday' },
        { text: '水', class: 'weekday' },
        { text: '木', class: 'weekday' },
        { text: '金', class: 'weekday' },
        { text: '土', class: 'sat' }
    ];
    dayHeaders.forEach(day => {
        html += `<div class="calendar-day-header ${day.class}">${day.text}</div>`;
    });

    // 前月の日付
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevLastDay.getDate() - i;
        html += `<div class="calendar-day other-month">${day}</div>`;
    }

    // 今月の日付
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay();

        const isToday = today.getFullYear() === year &&
                       today.getMonth() === month &&
                       today.getDate() === day;
        const holidayName = isHoliday(year, month, day);

        let className = 'calendar-day';

        // 曜日による色分け
        if (holidayName) {
            className += ' holiday';
        } else if (dayOfWeek === 0) {
            className += ' sunday';
        } else if (dayOfWeek === 6) {
            className += ' saturday';
        } else {
            className += ' weekday';
        }

        if (isToday) className += ' today';

        const title = holidayName ? `title="${holidayName}"` : '';
        html += `<div class="${className}" ${title}>${day}</div>`;
    }

    // 次月の日付（グリッドを埋める）
    const totalCells = firstDayOfWeek + lastDay.getDate();
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }

    html += '</div></div>';
    return html;
}

// ========================================
// 業務記録打刻機能
// ========================================
let currentTask = null;
let taskStartTime = null;
let taskTimerInterval = null;

// デフォルトのクイック業務ボタン
const defaultQuickTasks = [
    '見積業務',
    '発注業務',
    '問い合わせ対応',
    '会議',
    '資料等作成',
    '倉庫業務'
];

function quickStartTask(taskName) {
    if (currentTask === taskName) {
        // 同じタスクをクリック = 終了
        stopTask();
    } else if (currentTask) {
        // 別のタスクが実行中 = 終了してから新規開始
        stopTask();
        setTimeout(() => {
            startTaskWithName(taskName);
        }, 100);
    } else {
        // タスク開始
        startTaskWithName(taskName);
    }
}

function startTaskWithName(taskName) {
    currentTask = taskName;
    taskStartTime = new Date();

    renderCurrentTask();
    renderQuickTaskButtons();

    // タイマー開始
    taskTimerInterval = setInterval(updateTaskTimer, 1000);
}

function stopTask() {
    if (!currentTask) return;

    const endTime = new Date();
    const duration = Math.floor((endTime - taskStartTime) / 1000); // 秒単位

    // 記録を保存
    const records = getTaskRecords();
    records.unshift({
        task: currentTask,
        startTime: taskStartTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: duration
    });
    saveTaskRecords(records);

    // リセット
    currentTask = null;
    taskStartTime = null;
    clearInterval(taskTimerInterval);
    taskTimerInterval = null;

    renderCurrentTask();
    renderTaskRecords();
    renderQuickTaskButtons();
}

// クイックタスクボタンの管理
function getQuickTasks() {
    const saved = localStorage.getItem('quick-tasks');
    return saved ? JSON.parse(saved) : defaultQuickTasks;
}

function saveQuickTasks(tasks) {
    localStorage.setItem('quick-tasks', JSON.stringify(tasks));
}

function addQuickTaskButton() {
    const input = document.getElementById('new-task-button-name');
    const taskName = input.value.trim();

    if (!taskName) {
        alert('業務名を入力してください');
        return;
    }

    const tasks = getQuickTasks();
    if (tasks.includes(taskName)) {
        alert('既に同じ業務名が存在します');
        return;
    }

    tasks.push(taskName);
    saveQuickTasks(tasks);
    input.value = '';
    renderQuickTaskButtons();
}

function deleteQuickTaskButton(taskName, event) {
    event.stopPropagation();

    if (!confirm(`「${taskName}」を削除しますか？`)) {
        return;
    }

    const tasks = getQuickTasks();
    const index = tasks.indexOf(taskName);
    if (index > -1) {
        tasks.splice(index, 1);
        saveQuickTasks(tasks);
        renderQuickTaskButtons();
    }
}

function renderQuickTaskButtons() {
    const container = document.getElementById('quick-task-buttons');
    const tasks = getQuickTasks();

    let html = '';
    tasks.forEach(task => {
        const isActive = currentTask === task ? 'active' : '';
        html += `
            <button class="quick-task-btn ${isActive}" onclick="quickStartTask('${task}')">
                ${task}
                <span class="delete-btn" onclick="deleteQuickTaskButton('${task}', event)">×</span>
            </button>
        `;
    });

    container.innerHTML = html;
}

function updateTaskTimer() {
    if (!taskStartTime) return;

    const now = new Date();
    const elapsed = Math.floor((now - taskStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    const timerElem = document.querySelector('.task-timer');
    if (timerElem) {
        timerElem.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

function renderCurrentTask() {
    const container = document.getElementById('current-task');

    if (currentTask) {
        container.innerHTML = `
            <div class="task-info">
                記録中: ${currentTask}
                <button onclick="editCurrentTask()" class="edit-current-btn" title="編集">✎</button>
            </div>
            <div class="task-timer">00:00:00</div>
            <button onclick="stopTask()">終了</button>
        `;
        updateTaskTimer();
    } else {
        container.innerHTML = '';
    }
}

function renderTaskRecords() {
    const container = document.getElementById('record-list');
    const records = getTaskRecords();

    if (records.length === 0) {
        container.innerHTML = '<div style="color: #606060; padding: 10px;">記録なし</div>';
        return;
    }

    // 今日の合計時間を計算
    const today = new Date().toDateString();
    const todayRecords = records.filter(record => {
        const recordDate = new Date(record.startTime);
        return recordDate.toDateString() === today;
    });

    const todayTotal = todayRecords.reduce((sum, record) => sum + record.duration, 0);
    const todayHours = Math.floor(todayTotal / 3600);
    const todayMinutes = Math.floor((todayTotal % 3600) / 60);

    let html = `
        <div class="record-summary">
            本日の合計: ${todayHours}時間${todayMinutes}分 (${todayRecords.length}件)
        </div>
    `;

    records.slice(0, 20).forEach((record, index) => { // 最新20件
        const start = new Date(record.startTime);
        const end = new Date(record.endTime);
        const duration = formatDuration(record.duration);

        html += `
            <div class="record-item">
                <div class="record-task">${record.task}</div>
                <div class="record-time">${formatTime(start)} - ${formatTime(end)}</div>
                <div class="record-duration">${duration}</div>
                <div class="record-actions">
                    <button onclick="editRecord(${index})" class="record-edit-btn" title="編集">✎</button>
                    <button onclick="deleteRecord(${index})" class="record-delete-btn" title="削除">×</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}時間${minutes}分`;
    } else if (minutes > 0) {
        return `${minutes}分${secs}秒`;
    } else {
        return `${secs}秒`;
    }
}

function getTaskRecords() {
    const data = localStorage.getItem('task-records');
    return data ? JSON.parse(data) : [];
}

function saveTaskRecords(records) {
    localStorage.setItem('task-records', JSON.stringify(records));
}

// 記録の削除
function deleteRecord(index) {
    if (!confirm('この記録を削除しますか？')) {
        return;
    }

    const records = getTaskRecords();
    records.splice(index, 1);
    saveTaskRecords(records);
    renderTaskRecords();
}

// 現在記録中のタスクを編集
function editCurrentTask() {
    const startTime = new Date(taskStartTime);
    const startTimeStr = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;

    // モーダルを作成
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="edit-modal-content">
            <h3>記録中の業務を編集</h3>
            <div class="edit-form">
                <label>業務名:</label>
                <input type="text" id="edit-current-task" value="${currentTask}" class="edit-input">

                <label>開始時刻:</label>
                <input type="time" id="edit-current-start" value="${startTimeStr}" class="edit-input">

                <div class="edit-buttons">
                    <button onclick="saveEditedCurrentTask()" class="save-btn">保存</button>
                    <button onclick="closeEditModal()" class="cancel-btn">キャンセル</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function saveEditedCurrentTask() {
    const newTask = document.getElementById('edit-current-task').value.trim();
    const newStartStr = document.getElementById('edit-current-start').value;

    if (!newTask) {
        alert('業務名を入力してください');
        return;
    }

    // 時刻をパース
    const [startHour, startMin] = newStartStr.split(':').map(Number);

    if (isNaN(startHour) || isNaN(startMin)) {
        alert('無効な時刻形式です');
        return;
    }

    // 新しい開始時刻を作成
    const newStartTime = new Date(taskStartTime);
    newStartTime.setHours(startHour, startMin, 0, 0);

    // 未来の時刻は許可しない
    const now = new Date();
    if (newStartTime > now) {
        alert('開始時刻を未来の時刻に設定することはできません');
        return;
    }

    // 更新
    currentTask = newTask;
    taskStartTime = newStartTime;

    renderCurrentTask();
    closeEditModal();
}

// 記録の編集
function editRecord(index) {
    const records = getTaskRecords();
    const record = records[index];

    const start = new Date(record.startTime);
    const end = new Date(record.endTime);

    // モーダルを作成
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="edit-modal-content">
            <h3>記録の編集</h3>
            <div class="edit-form">
                <label>業務名:</label>
                <input type="text" id="edit-task" value="${record.task}" class="edit-input">

                <label>開始時刻:</label>
                <input type="time" id="edit-start" value="${formatTime(start)}" class="edit-input">

                <label>終了時刻:</label>
                <input type="time" id="edit-end" value="${formatTime(end)}" class="edit-input">

                <div class="edit-buttons">
                    <button onclick="saveEditedRecord(${index})" class="save-btn">保存</button>
                    <button onclick="closeEditModal()" class="cancel-btn">キャンセル</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function saveEditedRecord(index) {
    const records = getTaskRecords();
    const record = records[index];

    const newTask = document.getElementById('edit-task').value.trim();
    const newStartStr = document.getElementById('edit-start').value;
    const newEndStr = document.getElementById('edit-end').value;

    if (!newTask) {
        alert('業務名を入力してください');
        return;
    }

    // 時刻をパース
    const [startHour, startMin] = newStartStr.split(':').map(Number);
    const [endHour, endMin] = newEndStr.split(':').map(Number);

    if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
        alert('無効な時刻形式です');
        return;
    }

    // 新しい日時を作成
    const start = new Date(record.startTime);
    const newStart = new Date(start);
    newStart.setHours(startHour, startMin, 0, 0);

    const end = new Date(record.endTime);
    const newEnd = new Date(end);
    newEnd.setHours(endHour, endMin, 0, 0);

    if (newEnd <= newStart) {
        alert('終了時刻は開始時刻より後にしてください');
        return;
    }

    // 記録を更新
    const duration = Math.floor((newEnd - newStart) / 1000);
    records[index] = {
        task: newTask,
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString(),
        duration: duration
    };

    saveTaskRecords(records);
    renderTaskRecords();
    closeEditModal();
}

function closeEditModal() {
    const modal = document.querySelector('.edit-modal');
    if (modal) {
        modal.remove();
    }
}

// ========================================
// データエクスポート・インポート機能
// ========================================

// 業務項目のみエクスポート
function exportTasksOnly() {
    const data = {
        quickTasks: getQuickTasks(),
        exportDate: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const today = new Date();
    const filename = `業務項目_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}.json`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 業務項目のみインポート
function importTasksOnly() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (data.quickTasks) {
                    saveQuickTasks(data.quickTasks);
                    renderQuickTaskButtons();
                    alert('業務項目を読み込みました');
                } else {
                    alert('有効な業務項目データが見つかりません');
                }
            } catch (error) {
                alert('ファイルの読み込みに失敗しました');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// CSV出力（UTF-8 BOM付き、Excel対応）
function exportRecordsCSV() {
    const records = getTaskRecords();

    if (records.length === 0) {
        alert('記録がありません');
        return;
    }

    // CSVヘッダー
    let csv = '業務内容,開始時刻,終了時刻,所要時間\n';

    // データ行
    records.forEach(record => {
        const start = new Date(record.startTime);
        const end = new Date(record.endTime);
        const startStr = `${start.getFullYear()}/${String(start.getMonth()+1).padStart(2,'0')}/${String(start.getDate()).padStart(2,'0')} ${formatTime(start)}`;
        const endStr = `${end.getFullYear()}/${String(end.getMonth()+1).padStart(2,'0')}/${String(end.getDate()).padStart(2,'0')} ${formatTime(end)}`;
        const duration = formatDuration(record.duration);

        csv += `"${record.task}","${startStr}","${endStr}","${duration}"\n`;
    });

    // UTF-8 BOM付きで出力（Excel対応）
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const today = new Date();
    const filename = `業務記録_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// JSON形式でデータ保存（業務項目+記録）
function exportRecordsJSON() {
    const data = {
        quickTasks: getQuickTasks(),
        records: getTaskRecords(),
        exportDate: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const today = new Date();
    const filename = `業務データ_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}.json`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// JSON形式でデータ読込
function importRecordsJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (data.quickTasks) {
                    saveQuickTasks(data.quickTasks);
                    renderQuickTaskButtons();
                }

                if (data.records) {
                    saveTaskRecords(data.records);
                    renderTaskRecords();
                }

                alert('データを読み込みました');
            } catch (error) {
                alert('ファイルの読み込みに失敗しました');
                console.error(error);
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// 記録のリセット
function clearRecords() {
    if (!confirm('全ての業務記録を削除しますか？\n※この操作は取り消せません')) {
        return;
    }

    // 実行中のタスクを停止
    if (currentTask) {
        stopTask();
    }

    // 記録をクリア
    localStorage.removeItem('task-records');
    renderTaskRecords();

    alert('業務記録をリセットしました');
}

// 記録の検索・フィルタ
function filterRecords(taskName) {
    const records = getTaskRecords();
    return records.filter(record => record.task === taskName);
}

// 日別集計
function getDailySummary(dateStr) {
    const records = getTaskRecords();
    const targetDate = new Date(dateStr);

    const dayRecords = records.filter(record => {
        const recordDate = new Date(record.startTime);
        return recordDate.toDateString() === targetDate.toDateString();
    });

    // 業務ごとに集計
    const summary = {};
    dayRecords.forEach(record => {
        if (!summary[record.task]) {
            summary[record.task] = 0;
        }
        summary[record.task] += record.duration;
    });

    return summary;
}

// 週別集計
function getWeeklySummary() {
    const records = getTaskRecords();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekRecords = records.filter(record => {
        const recordDate = new Date(record.startTime);
        return recordDate >= weekAgo && recordDate <= now;
    });

    const summary = {};
    weekRecords.forEach(record => {
        if (!summary[record.task]) {
            summary[record.task] = 0;
        }
        summary[record.task] += record.duration;
    });

    return summary;
}

// ========================================
// 業界・調達情報取得
// ========================================
let currentGovSource = 'generator';

function loadGovNews(source) {
    currentGovSource = source;
    const container = document.getElementById('gov-news');

    let newsData = [];

    switch(source) {
        case 'generator':
            newsData = [
                {
                    title: '総務省消防庁 - 予防行政',
                    description: '非常用発電設備の点検・整備基準、消防法令の最新情報',
                    link: 'https://www.fdma.go.jp/mission/prevention/index.html',
                    time: '消防庁'
                },
                {
                    title: '非常用発電設備の点検基準',
                    description: '負荷運転・内部観察等の点検実施要領',
                    link: 'https://www.fdma.go.jp/mission/prevention/suisin/items/h30_kaitei.pdf',
                    time: 'PDF資料'
                },
                {
                    title: '日本内燃力発電設備協会',
                    description: '非常用発電設備の技術基準・メンテナンス情報',
                    link: 'https://www.nega.or.jp/',
                    time: '業界団体'
                },
                {
                    title: '電気設備技術基準・解釈',
                    description: '自家用発電設備に関する技術基準',
                    link: 'https://www.meti.go.jp/policy/safety_security/industrial_safety/sangyo/electric/detail/denki_sekkei.html',
                    time: '経産省'
                },
                {
                    title: 'JIS規格検索（発電設備関連）',
                    description: 'ディーゼル発電設備等のJIS規格確認',
                    link: 'https://www.jisc.go.jp/',
                    time: 'JISC'
                }
            ];
            break;
        case 'procurement':
            newsData = [
                {
                    title: '経済産業省 - サプライチェーン強靱化',
                    description: '半導体・部素材のサプライチェーン対策',
                    link: 'https://www.meti.go.jp/policy/external_economy/toshi/supply_chain/index.html',
                    time: '経産省'
                },
                {
                    title: '中小企業基盤整備機構 - 調達情報',
                    description: '官公需・入札情報、調達支援策',
                    link: 'https://www.smrj.go.jp/',
                    time: '中小機構'
                },
                {
                    title: '国土交通省 - 物流施策',
                    description: 'トラック運送業の2024年問題、物流DX',
                    link: 'https://www.mlit.go.jp/seisakutokatsu/freight/index.html',
                    time: '国交省'
                },
                {
                    title: 'ジェトロ - 貿易・投資相談',
                    description: '海外調達、輸出入規制、関税情報',
                    link: 'https://www.jetro.go.jp/services/advice.html',
                    time: 'JETRO'
                },
                {
                    title: '調達価格指数（企業物価指数）',
                    description: '原材料・部品の価格動向（日本銀行）',
                    link: 'https://www.boj.or.jp/statistics/pi/index.htm',
                    time: '日銀'
                }
            ];
            break;
        case 'regulation':
            newsData = [
                {
                    title: '消防法令改正情報',
                    description: '消防用設備等の技術基準改正・通知',
                    link: 'https://www.fdma.go.jp/laws/tutatsu/items/tutatsu_main.html',
                    time: '総務省消防庁'
                },
                {
                    title: '電気事業法関連（自家用電気工作物）',
                    description: '保安規程、定期点検、主任技術者選任',
                    link: 'https://www.meti.go.jp/policy/safety_security/industrial_safety/sangyo/electric/index.html',
                    time: '経産省'
                },
                {
                    title: '建築基準法（非常用の照明装置・予備電源）',
                    description: '建築設備の定期検査制度',
                    link: 'https://www.mlit.go.jp/jutakukentiku/build/jutakukentiku_house_tk_000080.html',
                    time: '国交省'
                },
                {
                    title: '高圧ガス保安法',
                    description: '圧縮天然ガス、LPガス発電設備の保安基準',
                    link: 'https://www.khk.or.jp/',
                    time: '高圧ガス保安協会'
                },
                {
                    title: 'RoHS指令・REACH規則（EU規制）',
                    description: '電気電子機器の有害物質規制情報',
                    link: 'https://www.jetro.go.jp/world/europe/eu/business/regulations.html',
                    time: 'JETRO'
                }
            ];
            break;
    }

    displayNews(container, newsData);
}

function displayNews(container, newsArray) {
    let html = '';
    newsArray.forEach(news => {
        html += `
            <div class="news-item">
                <h3>${news.title}</h3>
                <p>${news.description}</p>
                <a href="${news.link}" target="_blank">続きを読む</a>
                <p class="news-time">${news.time}</p>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ========================================
// 資材課ツール: 在庫メモ
// ========================================
function saveInventoryMemo() {
    const memo = document.getElementById('inventory-memo').value;
    localStorage.setItem('inventory-memo', memo);
    alert('在庫メモを保存しました！');
}

function loadInventoryMemo() {
    const memo = localStorage.getItem('inventory-memo');
    if (memo) {
        document.getElementById('inventory-memo').value = memo;
    }
}

// ========================================
// 資材課ツール: 発注リスト
// ========================================
function addOrderItem() {
    const input = document.getElementById('new-order-item');
    const itemText = input.value.trim();

    if (itemText === '') {
        alert('品目を入力してください');
        return;
    }

    const orderList = getOrderList();
    orderList.push(itemText);
    saveOrderList(orderList);
    input.value = '';
    renderOrderList();
}

function removeOrderItem(index) {
    const orderList = getOrderList();
    orderList.splice(index, 1);
    saveOrderList(orderList);
    renderOrderList();
}

function renderOrderList() {
    const orderList = getOrderList();
    const container = document.getElementById('order-items');

    let html = '';
    orderList.forEach((item, index) => {
        html += `
            <li>
                <span>${item}</span>
                <button onclick="removeOrderItem(${index})">削除</button>
            </li>
        `;
    });

    container.innerHTML = html;
}

function getOrderList() {
    const data = localStorage.getItem('order-list');
    return data ? JSON.parse(data) : [];
}

function saveOrderList(list) {
    localStorage.setItem('order-list', JSON.stringify(list));
}

// ========================================
// 為替レート取得（参考値）
// ========================================
async function loadExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
        const data = await response.json();

        if (data && data.rates) {
            const usdRate = (1 / data.rates.USD).toFixed(2);
            const eurRate = (1 / data.rates.EUR).toFixed(2);
            const cnyRate = (1 / data.rates.CNY).toFixed(2);

            document.getElementById('usd-jpy').textContent = `¥${usdRate}`;
            document.getElementById('eur-jpy').textContent = `¥${eurRate}`;
            document.getElementById('cny-jpy').textContent = `¥${cnyRate}`;
        }
    } catch (error) {
        console.error('為替レート取得エラー:', error);
        document.getElementById('usd-jpy').textContent = '取得失敗';
        document.getElementById('eur-jpy').textContent = '取得失敗';
        document.getElementById('cny-jpy').textContent = '取得失敗';
    }
}

// ========================================
// 納期計算機（カレンダーヘッダー用）
// ========================================
function calculateDelivery() {
    const orderDateStr = document.getElementById('calc-order-date').value;
    const leadTime = parseInt(document.getElementById('calc-lead-time').value);
    const mode = document.getElementById('calc-mode').value;

    if (!orderDateStr) {
        alert('発注日を選択してください');
        return;
    }

    if (!leadTime || leadTime < 1) {
        alert('リードタイムを入力してください');
        return;
    }

    const orderDate = new Date(orderDateStr);
    let currentDate = new Date(orderDate);

    if (mode === 'business') {
        // 営業日計算（土日祝を除外）
        let businessDays = 0;
        while (businessDays < leadTime) {
            currentDate.setDate(currentDate.getDate() + 1);
            const dayOfWeek = currentDate.getDay();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const day = currentDate.getDate();
            const isHol = isHoliday(year, month, day);

            // 土日祝日を除外
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHol) {
                businessDays++;
            }
        }
    } else {
        // 暦日計算（全ての日を含む）
        currentDate.setDate(currentDate.getDate() + leadTime);
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const date = currentDate.getDate();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const day = dayNames[currentDate.getDay()];

    const resultSpan = document.getElementById('calc-result');
    resultSpan.textContent = `→ ${month}/${date}（${day}）`;
}

// ========================================
// タブイベントの設定
// ========================================
function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadGovNews(this.dataset.source);
        });
    });
}

// ========================================
// カウントダウンタイマー機能
// ========================================
let countdownInterval = null;
let countdownTotalSeconds = 0;
let countdownRemainingSeconds = 0;
let countdownStartTime = null;

function startCountdownTimer() {
    const input = document.getElementById('countdown-minutes');
    const minutes = parseInt(input.value);

    if (!minutes || minutes < 1) {
        alert('1分以上を入力してください');
        return;
    }

    // 既存のタイマーを停止
    if (countdownInterval) {
        stopCountdownTimer();
    }

    // タイマー設定
    countdownTotalSeconds = minutes * 60;
    countdownRemainingSeconds = countdownTotalSeconds;
    countdownStartTime = null; // リセット

    const miniHourglass = document.querySelector('.mini-hourglass');
    const miniContainer = document.getElementById('mini-hourglass-container');
    const miniSandTop = document.getElementById('mini-sand-top');
    const miniSandBottom = document.getElementById('mini-sand-bottom');

    // 反時計回りに半回転アニメーション開始
    if (miniHourglass) {
        miniHourglass.classList.add('flipping');
    }

    // 回転完了後（0.8秒後）に砂を入れ替えてからスタート
    setTimeout(() => {
        // 180度回転後、ウィンドウ基準では：
        // - mini-sand-bottomが画面の上に来る（砂が満杯の状態にする）
        // - mini-sand-topが画面の下に来る（砂が空の状態にする）
        if (miniSandTop && miniSandBottom) {
            miniSandTop.style.height = '0%';   // 画面の下（空）
            miniSandBottom.style.height = '100%'; // 画面の上（満杯）
        }

        // アニメーション再開
        if (miniContainer) {
            miniContainer.classList.remove('paused');
        }

        // タイマー開始時刻を記録
        countdownStartTime = Date.now();

        // タイマー開始（滑らかなアニメーションのため100ms間隔）
        countdownInterval = setInterval(updateCountdownTimer, 100);
        updateCountdownTimer();
    }, 800);
}

function stopCountdownTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    // アニメーション停止
    const miniContainer = document.getElementById('mini-hourglass-container');
    if (miniContainer) {
        miniContainer.classList.add('paused');
    }

    // 砂時計を元の位置に戻す（砂が下）
    const miniHourglass = document.querySelector('.mini-hourglass');
    if (miniHourglass) {
        miniHourglass.classList.remove('flipping');
    }

    // 砂をリセット（下部に100%）
    const miniSandTop = document.getElementById('mini-sand-top');
    const miniSandBottom = document.getElementById('mini-sand-bottom');
    if (miniSandTop && miniSandBottom) {
        miniSandTop.style.height = '0%';
        miniSandBottom.style.height = '100%';
    }
}

function updateCountdownTimer() {
    if (!countdownStartTime) return;

    // 経過時間を計算（ミリ秒精度）
    const elapsedMs = Date.now() - countdownStartTime;
    const totalMs = countdownTotalSeconds * 1000;

    // 残り時間を計算
    const remainingMs = totalMs - elapsedMs;

    if (remainingMs <= 0) {
        stopCountdownTimer();

        // タイマー終了時の表示
        const display = document.getElementById('countdown-display');
        if (display) {
            display.textContent = '終了';
            display.style.color = '#d88888';
        }

        // タイマー終了時：180度回転後、ウィンドウ基準で
        // 画面の下（mini-sand-top）に全て溜まる
        const miniSandTop = document.getElementById('mini-sand-top');
        const miniSandBottom = document.getElementById('mini-sand-bottom');
        if (miniSandTop && miniSandBottom) {
            miniSandTop.style.height = '100%'; // 画面の下（満杯）
            miniSandBottom.style.height = '0%'; // 画面の上（空）
        }

        return;
    }

    // 残り時間を表示（秒単位）
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const display = document.getElementById('countdown-display');
    if (display) {
        display.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
        display.style.color = '#d8b8b8';
    }

    // 砂時計の進捗を更新（ミリ秒精度で計算）
    // 180度回転後、ウィンドウ基準では：
    // - mini-sand-bottomが画面の上（砂が減っていく）
    // - mini-sand-topが画面の下（砂が溜まっていく）
    const progressRatio = elapsedMs / totalMs;
    const remainingRatio = 1 - progressRatio;
    const miniSandTop = document.getElementById('mini-sand-top');
    const miniSandBottom = document.getElementById('mini-sand-bottom');

    if (miniSandTop && miniSandBottom) {
        // 平面として扱い、視覚的な面積ベースで砂を表現
        // - 上の砂の面積 + 下の砂の面積 = 100%（常に一定）
        // - 面積が一定速度で上から下へ移動
        //
        // 円錐の面積は高さの2乗に比例: A ∝ h²
        // したがって、h ∝ √A
        //
        // 180度回転後のウィンドウ基準では：
        // - mini-sand-bottomが画面の上（残りの砂）
        // - mini-sand-topが画面の下（落ちた砂）

        // 面積比から高さ比を計算（平方根）
        const topHeightRatio = Math.sqrt(remainingRatio);      // 画面の上（減る）
        const bottomHeightRatio = Math.sqrt(progressRatio);    // 画面の下（増える）

        miniSandBottom.style.height = `${topHeightRatio * 100}%`;      // 画面の上（減る）
        miniSandTop.style.height = `${bottomHeightRatio * 100}%`;      // 画面の下（増える）
    }
}

// ========================================
// 初期化処理
// ========================================
function init() {
    // 勤務時間設定を読み込み
    loadWorkTimeSettings();

    // 時計を開始（1秒ごとに更新）
    updateClock();
    setInterval(updateClock, 1000);

    // カレンダー表示
    renderSixMonthCalendar();

    // 業務記録読み込み
    renderQuickTaskButtons();
    renderTaskRecords();

    // 納期計算機の発注日デフォルト値を今日に設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('calc-order-date').value = today;

    // カウントダウンタイマー初期化（砂が下の状態）
    const miniContainer = document.getElementById('mini-hourglass-container');
    const miniSandTop = document.getElementById('mini-sand-top');
    const miniSandBottom = document.getElementById('mini-sand-bottom');

    if (miniContainer) {
        miniContainer.classList.add('paused');
    }

    // 初期状態：砂が下に100%
    if (miniSandTop && miniSandBottom) {
        miniSandTop.style.height = '0%';
        miniSandBottom.style.height = '100%';
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);
