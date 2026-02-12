// ========================================
// 砂時計物理演算エンジン
// ========================================

/**
 * 砂時計の物理的に正確な砂の挙動をシミュレートするクラス
 *
 * 実装する物理法則:
 * 1. 質量保存則: 上部と下部の砂の総体積は常に一定（100%）
 * 2. 一定流量: 砂は一定速度で上部から下部へ移動
 * 3. 安息角22度: 下部の砂は底から水平に溜まり、中心部がわずかに盛り上がる
 * 4. 電球型ガラスの容積分布: ガラスの形状を考慮した非線形の高さ変換
 */
class SandPhysicsEngine {
    constructor() {
        // 物理定数
        this.REPOSE_ANGLE_DEG = 22; // 細かい砂の安息角（度）
        this.REPOSE_ANGLE_RAD = this.REPOSE_ANGLE_DEG * Math.PI / 180;
        this.MAX_PILE_HEIGHT = 0.03; // 中心部の最大盛り上がり（3%）

        // 電球型ガラスの容積分布パラメータ
        // 底部ほど容積が大きいため、非線形変換が必要
        this.VOLUME_CURVE_EXPONENT = 0.7; // 容積→高さ変換の指数

        // 数値誤差の許容範囲
        this.EPSILON = 1e-10;
    }

    /**
     * 進捗率から上部・下部の砂の高さを計算
     * @param {number} progress - 進捗率（0.0～1.0）
     * @returns {object} { upperHeight, lowerHeight, upperVolume, lowerVolume }
     */
    calculateSandHeights(progress) {
        // 質量保存則: 上部と下部の体積の合計は常に1.0
        const lowerVolume = Math.max(0, Math.min(1, progress));
        const upperVolume = 1.0 - lowerVolume;

        // 容積から高さへの変換（電球型ガラスの形状を考慮）
        const upperHeight = this.volumeToHeight(upperVolume, 'upper');
        const lowerHeight = this.volumeToHeight(lowerVolume, 'lower');

        // 数値誤差の自動補正
        const totalVolume = upperVolume + lowerVolume;
        if (Math.abs(totalVolume - 1.0) > this.EPSILON) {
            console.warn(`質量保存則の誤差を検出: ${totalVolume}, 補正します`);
        }

        return {
            upperHeight,
            lowerHeight,
            upperVolume,
            lowerVolume
        };
    }

    /**
     * 容積から高さへの変換（ガラス形状を考慮）
     * @param {number} volume - 容積比（0.0～1.0）
     * @param {string} type - 'upper' or 'lower'
     * @returns {number} 高さ比（0.0～1.0）
     */
    volumeToHeight(volume, type) {
        if (volume <= 0) return 0;
        if (volume >= 1) return 1;

        // 電球型ガラスは底部ほど容積が大きい
        // 容積と高さの関係を非線形変換で表現
        if (type === 'lower') {
            // 下部ガラス: 底部から徐々に溜まる
            // 初期は高さが急速に増加し、後半は緩やかになる
            return Math.pow(volume, this.VOLUME_CURVE_EXPONENT);
        } else {
            // 上部ガラス: 上から徐々に減る
            // 減り方も同様に非線形
            return Math.pow(volume, this.VOLUME_CURVE_EXPONENT);
        }
    }

    /**
     * 安息角を考慮した砂の堆積形状を計算
     * @param {number} xPercent - X座標（0～100）
     * @param {number} averageHeight - 平均高さ
     * @param {number} maxHeight - 最大高さ
     * @param {number} glassWidth - ガラス幅
     * @returns {number} その位置での砂の高さ
     */
    getSandHeightAtPosition(xPercent, averageHeight, maxHeight, glassWidth) {
        const centerX = 50;
        const distanceFromCenter = Math.abs(xPercent - centerX);

        // 安息角22度に基づく高さ計算
        // 中心からの距離に応じて高さが減少
        const slopeHeight = averageHeight +
            (this.MAX_PILE_HEIGHT * (1 - distanceFromCenter / centerX));

        // ガラスの形状制限を適用
        const glassHeightAtPosition = this.getGlassHeightAtPosition(xPercent);

        return Math.min(slopeHeight, glassHeightAtPosition, maxHeight);
    }

    /**
     * 電球型ガラスの各X座標での高さを取得
     * @param {number} xPercent - X座標（0～100）
     * @returns {number} その位置でのガラスの高さ
     */
    getGlassHeightAtPosition(xPercent) {
        const centerX = 50;
        const distanceFromCenter = Math.abs(xPercent - centerX);

        // 電球型の形状を近似
        // 中心付近は高く、端に行くほど低い
        const normalizedDistance = distanceFromCenter / centerX;
        return 1.0 - Math.pow(normalizedDistance, 1.5);
    }
}

// ========================================
// 日本の祝日データ（2025-2028年）
// ========================================
const HOLIDAY_DATA_MIN_YEAR = 2025;
const HOLIDAY_DATA_MAX_YEAR = 2028;

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
    '2026-11-23': '勤労感謝の日',
    '2027-01-01': '元日',
    '2027-01-11': '成人の日',
    '2027-02-11': '建国記念の日',
    '2027-02-23': '天皇誕生日',
    '2027-03-21': '春分の日',
    '2027-03-22': '振替休日',
    '2027-04-29': '昭和の日',
    '2027-05-03': '憲法記念日',
    '2027-05-04': 'みどりの日',
    '2027-05-05': 'こどもの日',
    '2027-07-19': '海の日',
    '2027-08-11': '山の日',
    '2027-09-20': '敬老の日',
    '2027-09-23': '秋分の日',
    '2027-10-11': 'スポーツの日',
    '2027-11-03': '文化の日',
    '2027-11-23': '勤労感謝の日',
    '2028-01-01': '元日',
    '2028-01-10': '成人の日',
    '2028-02-11': '建国記念の日',
    '2028-02-23': '天皇誕生日',
    '2028-03-20': '春分の日',
    '2028-04-29': '昭和の日',
    '2028-05-03': '憲法記念日',
    '2028-05-04': 'みどりの日',
    '2028-05-05': 'こどもの日',
    '2028-07-17': '海の日',
    '2028-08-11': '山の日',
    '2028-09-18': '敬老の日',
    '2028-09-22': '秋分の日',
    '2028-10-09': 'スポーツの日',
    '2028-11-03': '文化の日',
    '2028-11-23': '勤労感謝の日'
};

let holidayWarningShown = false;

function isHoliday(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays[dateStr];
}

function checkHolidayDataRange() {
    const currentYear = new Date().getFullYear();
    if (currentYear > HOLIDAY_DATA_MAX_YEAR && !holidayWarningShown) {
        holidayWarningShown = true;
        console.warn(`祝日データは${HOLIDAY_DATA_MAX_YEAR}年までです。納品日計算やカレンダーの祝日表示が正確でない可能性があります。`);
        const calcResult = document.getElementById('calc-results');
        if (calcResult) {
            const warning = document.createElement('div');
            warning.style.cssText = 'color: #d88888; font-size: 11px; margin-top: 4px;';
            warning.textContent = `⚠ 祝日データは${HOLIDAY_DATA_MAX_YEAR}年まで対応`;
            calcResult.parentElement.appendChild(warning);
        }
    }
}

// ========================================
// HTMLエスケープ
// ========================================
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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
        let settings;
        try {
            settings = JSON.parse(saved);
        } catch (e) {
            console.error('勤務時間設定の読み込みに失敗:', e);
            localStorage.removeItem('work-time-settings');
            return;
        }
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
        // 物理的に正確な砂時計のシミュレーション
        const progressRatio = progressPercent / 100;

        // SandPhysicsEngineを使用して物理的に正確な砂の高さを計算
        if (typeof SandPhysicsEngine !== 'undefined') {
            const physics = new SandPhysicsEngine();
            const result = physics.calculateSandHeights(progressRatio);

            sandTop.style.height = `${result.upperHeight * 100}%`;
            sandBottom.style.height = `${result.lowerHeight * 100}%`;

            // 落下パーティクルの表示制御（上部に砂がある時のみ）
            const fallingParticles = hourglassContainer.querySelector('.falling-particles');
            if (fallingParticles) {
                if (result.upperHeight > 0.01) {
                    fallingParticles.style.opacity = '1';
                } else {
                    fallingParticles.style.opacity = '0';
                }
            }

            // デバッグ情報の表示（開発時のみ）
            if (window.DEBUG_SAND_PHYSICS) {
                console.log('砂時計物理演算:', {
                    progress: `${(progressRatio * 100).toFixed(2)}%`,
                    upperVolume: `${(result.upperVolume * 100).toFixed(2)}%`,
                    lowerVolume: `${(result.lowerVolume * 100).toFixed(2)}%`,
                    totalVolume: `${((result.upperVolume + result.lowerVolume) * 100).toFixed(4)}%`,
                    error: `${((result.upperVolume + result.lowerVolume - 1) * 100).toFixed(6)}%`
                });
            }
        } else {
            // フォールバック: 従来の簡易実装
            const remainingRatio = 1 - progressRatio;
            const topHeightRatio = Math.sqrt(remainingRatio);
            const bottomHeightRatio = Math.sqrt(progressRatio);
            sandTop.style.height = `${topHeightRatio * 100}%`;
            sandBottom.style.height = `${bottomHeightRatio * 100}%`;
        }

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
let calendarMode = 'work'; // カレンダー表示モード: 'work', 'shipment', 'arrival'

// カレンダーモード切り替え
function switchCalendarMode(mode) {
    calendarMode = mode;

    // ボタンのアクティブ状態を更新
    document.querySelectorAll('.calendar-mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`mode-${mode}-btn`).classList.add('active');

    // カレンダーを再描画
    renderSixMonthCalendar();
}

// 指定日に業務記録があるかチェック
function checkDateHasWork(year, month, day) {
    const data = localStorage.getItem('task-records');
    if (!data) return false;

    const records = JSON.parse(data);
    const targetDate = new Date(year, month, day);
    const targetDateStr = targetDate.toDateString();

    return records.some(record => {
        const recordDate = new Date(record.startTime);
        return recordDate.toDateString() === targetDateStr;
    });
}

// 指定日の出荷データ数量を取得（選択中の倉庫のみ）
function getShipmentQuantityForDate(year, month, day) {
    if (!shipmentData) return 0;

    const targetDate = `${year}/${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    let totalQuantity = 0;

    shipmentData.forEach(row => {
        const dateStr = row['出荷希望日'] || '';
        const warehouse = row['倉庫名'] || '';

        // 選択中の倉庫がある場合はそのデータのみ、なければ全倉庫を集計
        if (dateStr === targetDate) {
            if (!currentWarehouse || warehouse === currentWarehouse) {
                totalQuantity += 1; // 行数をカウント
            }
        }
    });

    return totalQuantity;
}

// 指定日の入荷待ちデータ数量を取得（選択中の倉庫のみ）
function getArrivalQuantityForDate(year, month, day) {
    if (!arrivalData) return 0;

    const targetDateStr = `${year}/${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    let totalQuantity = 0;

    arrivalData.forEach(row => {
        const dateStr = row['最終入荷予定日'] || '';
        const address = row['発注納入先住所'] || '';
        const warehouse = detectWarehouseFromAddress(address);

        // 日付フォーマットを正規化（YYYY/MM/DD形式に統一）
        const normalizedDateStr = normalizeDateString(dateStr);

        // 選択中の倉庫がある場合はそのデータのみ、なければ全倉庫を集計
        if (normalizedDateStr === targetDateStr) {
            if (!currentArrivalWarehouse || warehouse === currentArrivalWarehouse) {
                const quantity = parseInt(row['数量'] || '0');
                totalQuantity += quantity;
            }
        }
    });

    return totalQuantity;
}

// 日付文字列を正規化（様々な形式をYYYY/MM/DD形式に統一）
function normalizeDateString(dateStr) {
    if (!dateStr) return '';

    // YYYY/MM/DD形式の場合
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateStr)) {
        const parts = dateStr.split('/');
        return `${parts[0]}/${String(parts[1]).padStart(2, '0')}/${String(parts[2]).padStart(2, '0')}`;
    }

    // YYYY-MM-DD形式の場合
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
        const parts = dateStr.split('-');
        return `${parts[0]}/${String(parts[1]).padStart(2, '0')}/${String(parts[2]).padStart(2, '0')}`;
    }

    return dateStr;
}

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

        // 統合データ表示：業務記録・出荷・入荷を全て表示
        const hasWork = checkDateHasWork(year, month, day);
        const shipmentQty = getShipmentQuantityForDate(year, month, day);
        const arrivalQty = getArrivalQuantityForDate(year, month, day);

        // データがある場合のクラス
        if (hasWork || shipmentQty > 0 || arrivalQty > 0) {
            className += ' has-data';
        }

        // データインジケーターを作成
        let dataIndicators = '';

        // 業務記録インジケーター
        if (hasWork) {
            dataIndicators += `<div class="calendar-work-indicator" title="業務記録あり"></div>`;
        }

        // 出荷・入荷データのバーグラフ
        let dataBars = '';
        const maxValue = Math.max(shipmentQty, arrivalQty, 1); // 最大値でスケーリング

        if (shipmentQty > 0) {
            const barWidth = (shipmentQty / maxValue) * 100;

            // キャパシティチェック
            const capacity = currentWarehouse && currentWarehouse in warehouseCapacities
                ? warehouseCapacities[currentWarehouse]
                : null;
            const isOverCapacity = capacity !== null && shipmentQty > capacity;
            const capacityClass = isOverCapacity ? ' over-capacity' : '';
            const capacityInfo = capacity !== null ? ` / キャパ: ${capacity}` : '';
            const warningIcon = isOverCapacity ? '<span class="capacity-warning-icon" title="キャパシティ超過">⚠️</span>' : '';

            dataBars += `<div class="calendar-data-bar shipment-bar${capacityClass}" style="width: ${barWidth}%" title="出荷: ${shipmentQty}行${capacityInfo}">
                <span class="bar-label">📦${shipmentQty}${warningIcon}</span>
            </div>`;
        }

        if (arrivalQty > 0) {
            const barWidth = (arrivalQty / arrivalQty) * 100; // 入荷は独立して表示

            // キャパシティチェック（入荷）
            const arrivalCapacity = currentArrivalWarehouse && currentArrivalWarehouse in arrivalWarehouseCapacities
                ? arrivalWarehouseCapacities[currentArrivalWarehouse]
                : null;
            const isArrivalOverCapacity = arrivalCapacity !== null && arrivalQty > arrivalCapacity;
            const arrivalCapacityClass = isArrivalOverCapacity ? ' over-capacity' : '';
            const arrivalCapacityInfo = arrivalCapacity !== null ? ` / キャパ: ${arrivalCapacity}` : '';
            const arrivalWarningIcon = isArrivalOverCapacity ? '<span class="capacity-warning-icon" title="キャパシティ超過">⚠️</span>' : '';

            dataBars += `<div class="calendar-data-bar arrival-bar${arrivalCapacityClass}" style="width: ${barWidth}%" title="入荷: ${arrivalQty}個${arrivalCapacityInfo}">
                <span class="bar-label">📥${arrivalQty}${arrivalWarningIcon}</span>
            </div>`;
        }

        const title = holidayName ? `title="${holidayName}"` : '';
        const onclick = hasWork ? `onclick="openWorkDetailModal(${year}, ${month}, ${day})"` : '';
        const cursor = hasWork ? 'cursor: pointer;' : '';

        html += `<div class="${className}" ${title} ${onclick} style="${cursor}">
            <div class="calendar-day-number">${day}</div>
            ${dataIndicators}
            <div class="calendar-data-bars">
                ${dataBars}
            </div>
        </div>`;
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
    } else {
        // 別のタスクが実行中なら終了してから新規開始
        if (currentTask) {
            stopTask();
        }
        startTaskWithName(taskName);
    }
}

function startTaskWithName(taskName) {
    // 安全のため既存タイマーをクリア
    if (taskTimerInterval) {
        clearInterval(taskTimerInterval);
        taskTimerInterval = null;
    }

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
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('クイックタスクの読み込みに失敗:', e);
            localStorage.removeItem('quick-tasks');
        }
    }
    return defaultQuickTasks;
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
            <button class="quick-task-btn ${isActive}" onclick="quickStartTask('${escapeHtml(task)}')">
                ${escapeHtml(task)}
                <span class="delete-btn" onclick="deleteQuickTaskButton('${escapeHtml(task)}', event)">×</span>
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

    const timerElem = document.querySelector('.current-task-timer');
    if (timerElem) {
        timerElem.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

function renderCurrentTask() {
    const container = document.getElementById('current-task');

    if (currentTask) {
        container.innerHTML = `
            <div class="current-task-compact">
                <span class="current-task-label">記録中:</span>
                <span class="current-task-name">${escapeHtml(currentTask)}</span>
                <span class="current-task-timer">00:00:00</span>
                <button onclick="editCurrentTask()" class="edit-current-btn" title="編集">✎</button>
                <button onclick="stopTask()" class="stop-task-btn">終了</button>
            </div>
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
        const dateStr = formatDate(start);

        html += `
            <div class="record-item-compact">
                <span class="record-task-name">${escapeHtml(record.task)}</span>
                <span class="record-date">${dateStr}</span>
                <span class="record-time-range">${formatTime(start)}-${formatTime(end)}</span>
                <span class="record-duration-text">${duration}</span>
                <button onclick="editRecord(${index})" class="record-edit-btn" title="編集">✎</button>
                <button onclick="deleteRecord(${index})" class="record-delete-btn" title="削除">×</button>
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

function formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
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
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('業務記録の読み込みに失敗:', e);
            localStorage.removeItem('task-records');
        }
    }
    return [];
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
    closeEditModal();
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
                <input type="text" id="edit-current-task" value="${escapeHtml(currentTask)}" class="edit-input">

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
    closeEditModal();
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
                <input type="text" id="edit-task" value="${escapeHtml(record.task)}" class="edit-input">

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
    document.querySelectorAll('.edit-modal').forEach(modal => modal.remove());
}

// ========================================
// データエクスポート・インポート機能
// ========================================

// 業務項目のみエクスポート（定型文設定も含む）
function exportTasksOnly() {
    const data = {
        quickTasks: getQuickTasks(),
        templateSettings: getTemplateSettings(),
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

// 業務項目のみインポート（定型文設定も含む）
function importTasksOnly() {
    if (!confirm('業務項目と定型文設定をインポートすると既存の設定が上書きされます。\n続行しますか？')) return;

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

                let loaded = false;

                if (data.quickTasks) {
                    saveQuickTasks(data.quickTasks);
                    renderQuickTaskButtons();
                    loaded = true;
                }

                if (data.templateSettings) {
                    saveTemplateSettings(data.templateSettings);
                    renderTemplateList();
                    loaded = true;
                }

                if (loaded) {
                    alert('業務項目と定型文設定を読み込みました');
                } else {
                    alert('有効なデータが見つかりません');
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

// JSON形式でデータ保存（業務項目+記録+定型文設定）
function exportRecordsJSON() {
    const data = {
        quickTasks: getQuickTasks(),
        records: getTaskRecords(),
        templateSettings: getTemplateSettings(),
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

// JSON形式でデータ読込（定型文設定も含む）
function importRecordsJSON() {
    const existingRecords = getTaskRecords();
    const warning = existingRecords.length > 0
        ? `現在${existingRecords.length}件の業務記録があります。インポートすると既存データが上書きされます。\n続行しますか？`
        : 'データをインポートしますか？';

    if (!confirm(warning)) return;

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

                // 記録中のタスクがあれば停止
                if (currentTask) {
                    stopTask();
                }

                if (data.quickTasks) {
                    saveQuickTasks(data.quickTasks);
                    renderQuickTaskButtons();
                }

                if (data.records) {
                    saveTaskRecords(data.records);
                    renderTaskRecords();
                }

                if (data.templateSettings) {
                    saveTemplateSettings(data.templateSettings);
                    renderTemplateList();
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
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('発注リストの読み込みに失敗:', e);
            localStorage.removeItem('order-list');
        }
    }
    return [];
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

    if (!orderDateStr) {
        alert('発注日を選択してください');
        return;
    }

    if (!leadTime || leadTime < 1) {
        alert('リードタイムを入力してください');
        return;
    }

    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    // YYYY-MM-DD をローカル日付として解釈（new Date('YYYY-MM-DD')はUTC解釈されるため）
    const [y, m, d] = orderDateStr.split('-').map(Number);
    const orderDate = new Date(y, m - 1, d);

    // 営業日計算（土日祝を除外）
    let businessDate = new Date(orderDate);
    let businessDays = 0;
    while (businessDays < leadTime) {
        businessDate.setDate(businessDate.getDate() + 1);
        const dayOfWeek = businessDate.getDay();
        const isHol = isHoliday(businessDate.getFullYear(), businessDate.getMonth(), businessDate.getDate());
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHol) {
            businessDays++;
        }
    }

    // 祝日考慮計算（土日は含むが祝日のみ除外）
    let holidayAwareDate = new Date(orderDate);
    let holidayAwareDays = 0;
    while (holidayAwareDays < leadTime) {
        holidayAwareDate.setDate(holidayAwareDate.getDate() + 1);
        const isHol = isHoliday(holidayAwareDate.getFullYear(), holidayAwareDate.getMonth(), holidayAwareDate.getDate());
        if (!isHol) {
            holidayAwareDays++;
        }
    }

    // 暦日計算（全ての日を含む）
    let calendarDate = new Date(orderDate);
    calendarDate.setDate(calendarDate.getDate() + leadTime);

    const formatResult = (d) => `${d.getMonth() + 1}/${d.getDate()}（${dayNames[d.getDay()]}）`;

    document.getElementById('calc-result-business').textContent = formatResult(businessDate);
    document.getElementById('calc-result-holiday-aware').textContent = formatResult(holidayAwareDate);
    document.getElementById('calc-result-calendar').textContent = formatResult(calendarDate);
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

        // 控えめな通知音を鳴らす
        playNotificationSound();

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
        // 物理的に正確な砂時計のシミュレーション（ミニ砂時計用）
        if (typeof SandPhysicsEngine !== 'undefined') {
            const physics = new SandPhysicsEngine();
            const result = physics.calculateSandHeights(progressRatio);

            // 180度回転後のウィンドウ基準では：
            // - mini-sand-bottomが画面の上（残りの砂）= upperHeight
            // - mini-sand-topが画面の下（落ちた砂）= lowerHeight
            miniSandBottom.style.height = `${result.upperHeight * 100}%`;      // 画面の上（減る）
            miniSandTop.style.height = `${result.lowerHeight * 100}%`;      // 画面の下（増える）

            // 落下パーティクルの表示制御（上部に砂がある時のみ）
            const miniContainer = document.getElementById('mini-hourglass-container');
            const miniFallingParticles = miniContainer?.querySelector('.mini-falling-particles');
            if (miniFallingParticles) {
                if (result.upperHeight > 0.01) {
                    miniFallingParticles.style.opacity = '1';
                } else {
                    miniFallingParticles.style.opacity = '0';
                }
            }
        } else {
            // フォールバック: 従来の簡易実装
            const topHeightRatio = Math.sqrt(remainingRatio);
            const bottomHeightRatio = Math.sqrt(progressRatio);
            miniSandBottom.style.height = `${topHeightRatio * 100}%`;
            miniSandTop.style.height = `${bottomHeightRatio * 100}%`;
        }
    }
}

// ========================================
// 初期化処理
// ========================================
function init() {
    // デバッグモード（開発時のみ）
    // コンソールで物理演算の詳細を確認したい場合は、以下のコメントを解除してください
    // window.DEBUG_SAND_PHYSICS = true;

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

    // 定型文リスト表示
    renderTemplateList();

    // 納期計算機の発注日デフォルト値を今日に設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('calc-order-date').value = today;

    // 祝日データの範囲チェック
    checkHolidayDataRange();

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

// ========================================
// 定型文コピペ機能
// ========================================

// デフォルトの定型文
const defaultTemplates = [
    '現時点では上記希望納期対応可能です',
    '現時点では在庫にて上記希望納期対応可能です',
    'PN登録中',
    '納期確認中',
    'メーカー確認中',
    '手配完了'
];

// 定型文設定の取得
function getTemplateSettings() {
    const saved = localStorage.getItem('template-settings');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('定型文設定の読み込みに失敗:', e);
            localStorage.removeItem('template-settings');
        }
    }
    return {
        name: '前田',
        templates: defaultTemplates
    };
}

// 定型文設定の保存
function saveTemplateSettings(settings) {
    localStorage.setItem('template-settings', JSON.stringify(settings));
}

// 今日の日付を取得（YYYY/MM/DD形式）
function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// 定型文リストの表示
function renderTemplateList() {
    const container = document.getElementById('template-list');
    const settings = getTemplateSettings();
    const today = getTodayDate();

    let html = '';
    settings.templates.forEach((template, index) => {
        const formattedText = `${today}（${settings.name}）${template}`;
        html += `
            <div class="template-item">
                <div class="template-text" onclick="copyTemplate(${index})" title="クリックでコピー">
                    ${escapeHtml(template)}
                </div>
                <button class="template-copy-btn" onclick="copyTemplate(${index})" title="コピー">📋</button>
            </div>
        `;
    });

    container.innerHTML = html;
}

// 定型文をクリップボードにコピー
function copyTemplate(index) {
    const settings = getTemplateSettings();
    const template = settings.templates[index];
    const today = getTodayDate();
    const formattedText = `${today}（${settings.name}）${template}`;

    // クリップボードにコピー
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(formattedText).then(() => {
            showCopyFeedback(index);
        }).catch(err => {
            console.error('コピー失敗:', err);
            fallbackCopy(formattedText, index);
        });
    } else {
        fallbackCopy(formattedText, index);
    }
}

function fallbackCopy(text, index) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showCopyFeedback(index);
    } catch (err) {
        alert('クリップボードへのコピーに失敗しました');
    }
    document.body.removeChild(textarea);
}

// コピー成功のフィードバック表示
function showCopyFeedback(index) {
    const items = document.querySelectorAll('.template-item');
    if (items[index]) {
        items[index].classList.add('copied');
        setTimeout(() => {
            items[index].classList.remove('copied');
        }, 1000);
    }
}

// 定型文設定モーダルを開く
function openTemplateSettings() {
    closeEditModal();
    const settings = getTemplateSettings();

    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="edit-modal-content">
            <h3>定型文設定</h3>
            <div class="edit-form">
                <label>名前:</label>
                <input type="text" id="template-name" value="${escapeHtml(settings.name)}" class="edit-input" placeholder="前田">

                <label>定型文 1:</label>
                <input type="text" id="template-1" value="${escapeHtml(settings.templates[0] || '')}" class="edit-input" placeholder="現時点では上記希望納期対応可能です">

                <label>定型文 2:</label>
                <input type="text" id="template-2" value="${escapeHtml(settings.templates[1] || '')}" class="edit-input" placeholder="現時点では在庫にて上記希望納期対応可能です">

                <label>定型文 3:</label>
                <input type="text" id="template-3" value="${escapeHtml(settings.templates[2] || '')}" class="edit-input" placeholder="PN登録中">

                <label>定型文 4:</label>
                <input type="text" id="template-4" value="${escapeHtml(settings.templates[3] || '')}" class="edit-input" placeholder="納期確認中">

                <label>定型文 5:</label>
                <input type="text" id="template-5" value="${settings.templates[4] || ''}" class="edit-input" placeholder="メーカー確認中">

                <label>定型文 6:</label>
                <input type="text" id="template-6" value="${settings.templates[5] || ''}" class="edit-input" placeholder="手配完了">

                <div class="template-preview">
                    <label>プレビュー:</label>
                    <div id="template-preview-text" class="template-preview-text"></div>
                </div>

                <div class="edit-buttons">
                    <button onclick="saveTemplateSettingsFromModal()" class="save-btn">保存</button>
                    <button onclick="closeEditModal()" class="cancel-btn">キャンセル</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // プレビューを更新
    updateTemplatePreview();

    // 入力時にプレビューを更新
    ['template-name', 'template-1', 'template-2', 'template-3', 'template-4', 'template-5', 'template-6'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener('input', updateTemplatePreview);
        }
    });
}

// プレビュー更新
function updateTemplatePreview() {
    const name = document.getElementById('template-name')?.value || '前田';
    const template1 = document.getElementById('template-1')?.value || '';
    const today = getTodayDate();

    const preview = document.getElementById('template-preview-text');
    if (preview && template1) {
        preview.textContent = `${today}（${name}）${template1}`;
    } else if (preview) {
        preview.textContent = '定型文を入力してください';
    }
}

// 定型文設定を保存（モーダルから）
function saveTemplateSettingsFromModal() {
    const name = document.getElementById('template-name').value.trim();
    const template1 = document.getElementById('template-1').value.trim();
    const template2 = document.getElementById('template-2').value.trim();
    const template3 = document.getElementById('template-3').value.trim();
    const template4 = document.getElementById('template-4').value.trim();
    const template5 = document.getElementById('template-5').value.trim();
    const template6 = document.getElementById('template-6').value.trim();

    if (!name) {
        alert('名前を入力してください');
        return;
    }

    const templates = [template1, template2, template3, template4, template5, template6].filter(t => t !== '');

    if (templates.length === 0) {
        alert('少なくとも1つの定型文を入力してください');
        return;
    }

    const settings = {
        name: name,
        templates: templates
    };

    saveTemplateSettings(settings);
    renderTemplateList();
    closeEditModal();
}

// グローバルスコープに関数を公開
window.saveTemplateSettingsFromModal = saveTemplateSettingsFromModal;

// ========================================
// Excel ファイル処理（File System Access API使用）
// ========================================

let workFolderHandle = null;
let sourceFileHandle = null;
let destFileHandle = null;

// 作業フォルダを選択
async function selectWorkFolder() {
    const statusDiv = document.getElementById('excel-status');
    const folderPathDisplay = document.getElementById('folder-path-display');
    const processBtn = document.getElementById('process-btn');

    try {
        // フォルダ選択ダイアログを表示
        workFolderHandle = await window.showDirectoryPicker({
            mode: 'readwrite'
        });

        folderPathDisplay.textContent = workFolderHandle.name;
        folderPathDisplay.className = 'folder-path-display selected';

        statusDiv.textContent = 'ファイルを検索中...';
        statusDiv.className = 'excel-status processing';

        // ファイルを検索
        await searchFilesInFolder();

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('フォルダ選択エラー:', error);
            statusDiv.textContent = `エラー: ${error.message}`;
            statusDiv.className = 'excel-status error';
        }
    }
}

// フォルダ内のファイルを検索
async function searchFilesInFolder() {
    const statusDiv = document.getElementById('excel-status');
    const sourceFileNameDisplay = document.getElementById('source-file-name');
    const destFileNameDisplay = document.getElementById('dest-file-name');
    const processBtn = document.getElementById('process-btn');

    sourceFileHandle = null;
    destFileHandle = null;

    try {
        // フォルダ内のファイルを走査
        for await (const entry of workFolderHandle.values()) {
            if (entry.kind === 'file') {
                // コピー元ファイルを検索（手配部品一覧_Y*.xls または *.xlsx）
                if (entry.name.startsWith('手配部品一覧_Y') &&
                    (entry.name.endsWith('.xls') || entry.name.endsWith('.xlsx'))) {
                    sourceFileHandle = entry;
                    sourceFileNameDisplay.textContent = entry.name;
                    sourceFileNameDisplay.className = 'file-name-display found';
                }

                // 貼り付け先ファイルを検索（手配一覧_マスタ照合用データ_*.xlsx）
                if (entry.name.startsWith('手配一覧_マスタ照合用データ_') &&
                    entry.name.endsWith('.xlsx')) {
                    destFileHandle = entry;
                    destFileNameDisplay.textContent = entry.name;
                    destFileNameDisplay.className = 'file-name-display found';
                }
            }
        }

        // ファイルが見つからなかった場合の表示
        if (!sourceFileHandle) {
            sourceFileNameDisplay.textContent = '未検出（手配部品一覧_Y*.xls または *.xlsx）';
            sourceFileNameDisplay.className = 'file-name-display not-found';
        }

        if (!destFileHandle) {
            destFileNameDisplay.textContent = '未検出（手配一覧_マスタ照合用データ_*.xlsx）';
            destFileNameDisplay.className = 'file-name-display not-found';
        }

        // 両方のファイルが見つかった場合のみ処理ボタンを有効化
        if (sourceFileHandle && destFileHandle) {
            processBtn.disabled = false;
            statusDiv.textContent = '準備完了：処理を実行できます';
            statusDiv.className = 'excel-status success';
        } else {
            processBtn.disabled = true;
            statusDiv.textContent = '必要なファイルが見つかりません';
            statusDiv.className = 'excel-status error';
        }

    } catch (error) {
        console.error('ファイル検索エラー:', error);
        statusDiv.textContent = `エラー: ${error.message}`;
        statusDiv.className = 'excel-status error';
        processBtn.disabled = true;
    }
}

// PowerShellスクリプトを生成してダウンロード
function downloadVBAScript() {
    const folderPath = workFolderHandle ? workFolderHandle.name : 'Downloads';

    // PowerShellスクリプトの内容
    const psScript = `# Excel VBA自動実行スクリプト
# 手配部品一覧のデータをマスタ照合用データにコピーするVBAマクロを実行

# フォルダパスを設定（必要に応じて変更してください）
$folderPath = "$env:USERPROFILE\\Downloads\\"

# Excelアプリケーションを起動
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    # コピー元ファイルを検索
    $sourceFile = Get-ChildItem -Path $folderPath -Filter "手配部品一覧_Y*.xls" | Select-Object -First 1
    if (-not $sourceFile) {
        Write-Host "エラー: コピー元ファイル（手配部品一覧_Y*.xls）が見つかりませんでした。" -ForegroundColor Red
        exit 1
    }

    # 貼り付け先ファイルを検索
    $destFile = Get-ChildItem -Path $folderPath -Filter "手配一覧_マスタ照合用データ_*.xlsx" | Select-Object -First 1
    if (-not $destFile) {
        Write-Host "エラー: 貼り付け先ファイル（手配一覧_マスタ照合用データ_*.xlsx）が見つかりませんでした。" -ForegroundColor Red
        exit 1
    }

    Write-Host "コピー元: $($sourceFile.Name)" -ForegroundColor Green
    Write-Host "貼り付け先: $($destFile.Name)" -ForegroundColor Green

    # コピー元ブックを開く
    $sourceWb = $excel.Workbooks.Open($sourceFile.FullName)
    $sourceWs = $sourceWb.Sheets.Item(1)

    # 「明細」セルを検索
    $startCell = $sourceWs.Columns.Item("B").Find("明細")
    if (-not $startCell) {
        Write-Host "エラー: 「明細」というセルがB列に見つかりませんでした。" -ForegroundColor Red
        $sourceWb.Close($false)
        exit 1
    }

    $startRow = $startCell.Row + 3
    $lastRowSource = $sourceWs.Cells.Item($sourceWs.Rows.Count, "T").End(-4162).Row  # xlUp = -4162
    $copyRange = $sourceWs.Range("B$startRow:T$lastRowSource")
    $numRows = $copyRange.Rows.Count
    $numCols = $copyRange.Columns.Count

    Write-Host "コピー範囲: B$startRow:T$lastRowSource ($numRows 行)" -ForegroundColor Cyan

    # 貼り付け先ブックを開く
    $destWb = $excel.Workbooks.Open($destFile.FullName)
    $destWs = $destWb.Sheets.Item("手配一覧添付")

    # 貼り付け先のT列の最終行を取得
    $lastRowDest = $destWs.Cells.Item($destWs.Rows.Count, "T").End(-4162).Row

    # 既存データのクリアと結合解除
    if ($lastRowDest -ge 3) {
        $clearRange = $destWs.Range("B3:T$lastRowDest")
        $clearRange.UnMerge()
        $clearRange.ClearContents()
        Write-Host "既存データをクリアしました（B3:T$lastRowDest）" -ForegroundColor Yellow
    }

    # 貼り付け範囲を定義
    $pasteRange = $destWs.Range("B3").Resize($numRows, $numCols)
    $pasteRange.UnMerge()
    $pasteRange.Value2 = $copyRange.Value2

    Write-Host "データをコピーしました" -ForegroundColor Green

    # 指定列の結合処理
    for ($i = 3; $i -le (2 + $numRows); $i++) {
        $destWs.Range("C$i:D$i").Merge()
        $destWs.Range("E$i:H$i").Merge()
        $destWs.Range("I$i:N$i").Merge()
        $destWs.Range("Q$i:S$i").Merge()
        $destWs.Range("T$i:V$i").Merge()
    }

    Write-Host "セル結合を完了しました" -ForegroundColor Green

    # 貼り付け先ブックを保存して閉じる
    $destWb.Save()
    $destWb.Close($false)

    Write-Host "貼り付け先ファイルを保存しました" -ForegroundColor Green

    # コピー元ブックを閉じる（保存せず）
    $sourceWb.Close($false)

    # コピー元ファイルを削除
    Remove-Item -Path $sourceFile.FullName -Force
    Write-Host "コピー元ファイルを削除しました: $($sourceFile.Name)" -ForegroundColor Green

    Write-Host ""
    Write-Host "処理が正常に完了しました！" -ForegroundColor Green -BackgroundColor DarkGreen

} catch {
    Write-Host "エラーが発生しました: $_" -ForegroundColor Red
    exit 1
} finally {
    # Excelを終了
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}

Write-Host ""
Write-Host "5秒後にウィンドウを閉じます..."
Start-Sleep -Seconds 5
`;

    // Blobとしてダウンロード
    const blob = new Blob([psScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Excel処理スクリプト.ps1';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // 実行方法を表示
    const statusDiv = document.getElementById('excel-status');
    statusDiv.innerHTML = `
        <strong>PowerShellスクリプトをダウンロードしました</strong><br>
        <div style="margin-top: 10px; padding: 10px; background: #f0f0f0; border-radius: 4px; text-align: left; font-size: 12px;">
            <strong>実行方法:</strong><br>
            1. ダウンロードした「Excel処理スクリプト.ps1」を右クリック<br>
            2. 「PowerShellで実行」を選択<br>
            　（または、右クリック→「編集」でメモ帳を開き、フォルダパスを確認・変更してから実行）<br>
            <br>
            <strong>※セキュリティ警告が出た場合:</strong><br>
            PowerShellを管理者として開き、以下のコマンドを実行してください:<br>
            <code style="background: white; padding: 2px 6px; border-radius: 3px;">Set-ExecutionPolicy RemoteSigned -Scope CurrentUser</code>
        </div>
    `;
    statusDiv.className = 'excel-status success';
}

// Excelファイル処理（自動検索版）
async function processExcelFilesAuto() {
    const statusDiv = document.getElementById('excel-status');
    const processBtn = document.getElementById('process-btn');

    if (!sourceFileHandle || !destFileHandle) {
        statusDiv.textContent = 'エラー: 必要なファイルが見つかりません';
        statusDiv.className = 'excel-status error';
        return;
    }

    try {
        processBtn.disabled = true;
        statusDiv.textContent = '処理中...';
        statusDiv.className = 'excel-status processing';

        // ファイルを読み込み
        const sourceFile = await sourceFileHandle.getFile();
        const destFile = await destFileHandle.getFile();

        // SheetJSでファイルを読み込み（.xlsと.xlsxの両方に対応）
        const XLSX = window.XLSX;

        // コピー元ファイルの読み込み
        const sourceArrayBuffer = await sourceFile.arrayBuffer();
        const sourceWorkbook = XLSX.read(sourceArrayBuffer, { type: 'array' });
        const sourceSheetName = sourceWorkbook.SheetNames[0];
        const sourceWorksheet = sourceWorkbook.Sheets[sourceSheetName];

        // 貼り付け先ファイルの読み込み
        const destArrayBuffer = await destFile.arrayBuffer();
        const destWorkbook = XLSX.read(destArrayBuffer, { type: 'array' });

        // 「手配一覧添付」シートを取得
        const destSheetName = '手配一覧添付';
        if (!destWorkbook.SheetNames.includes(destSheetName)) {
            throw new Error('貼り付け先ファイルに「手配一覧添付」シートが見つかりません');
        }
        const destWorksheet = destWorkbook.Sheets[destSheetName];

        // 「明細」セルを検索（B列 = インデックス1）
        let startRow = null;
        const sourceRange = XLSX.utils.decode_range(sourceWorksheet['!ref']);

        for (let row = 0; row <= sourceRange.e.r; row++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: 1 }); // B列
            const cell = sourceWorksheet[cellAddress];
            if (cell && cell.v === '明細') {
                startRow = row + 3; // 「明細」の3行後から開始
                break;
            }
        }

        if (startRow === null) {
            throw new Error('コピー元ファイルのB列に「明細」が見つかりませんでした');
        }

        // コピー元の最終行を取得（T列 = インデックス19）
        let lastRowSource = startRow;
        for (let row = startRow; row <= sourceRange.e.r; row++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: 19 }); // T列
            const cell = sourceWorksheet[cellAddress];
            if (cell && cell.v !== null && cell.v !== undefined && cell.v !== '') {
                lastRowSource = row;
            }
        }

        // コピーする行数
        const numRows = lastRowSource - startRow + 1;

        // 貼り付け先の既存データをクリア（B3:T列の最終行まで）
        // VBAの処理: destWs.Range("B3:T" & lastRowDest).UnMerge .ClearContents

        // まず、貼り付け先のT列の最終行を取得
        const destRange = XLSX.utils.decode_range(destWorksheet['!ref']);
        let lastRowDest = 2; // 最低でも3行目（0-indexed で 2）

        for (let row = 2; row <= destRange.e.r; row++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: 19 }); // T列
            const cell = destWorksheet[cellAddress];
            if (cell && cell.v !== null && cell.v !== undefined && cell.v !== '') {
                lastRowDest = row;
            }
        }

        // B3:T列（最終行まで）のセル内容のみをクリア（値のみクリア、書式は保持）
        for (let row = 2; row <= lastRowDest; row++) { // 3行目から（0-indexed: 2）
            for (let col = 1; col <= 19; col++) { // B列からT列まで（0-indexed: 1-19）
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (destWorksheet[cellAddress]) {
                    // セルの値のみをクリア（書式・型は保持）
                    destWorksheet[cellAddress].v = '';
                    if (destWorksheet[cellAddress].w) {
                        destWorksheet[cellAddress].w = '';
                    }
                }
            }
        }

        // 既存の結合を解除（B3:T列の範囲）
        if (destWorksheet['!merges']) {
            destWorksheet['!merges'] = destWorksheet['!merges'].filter(merge => {
                // 3行目以降、B列からT列の範囲にある結合を除外
                return !(merge.s.r >= 2 && merge.s.c >= 1 && merge.e.c <= 19);
            });
        } else {
            destWorksheet['!merges'] = [];
        }

        // データをコピー（B列からT列まで、3行目から）
        // VBAの pasteRange.Value = copyRange.Value と同じ動作（値のみコピー）
        for (let i = 0; i < numRows; i++) {
            const sourceRowIdx = startRow + i;
            const destRowIdx = 2 + i; // 3行目から（0-indexed: 2）

            // B列からT列（インデックス1～19）をコピー
            for (let col = 1; col <= 19; col++) {
                const sourceCellAddress = XLSX.utils.encode_cell({ r: sourceRowIdx, c: col });
                const destCellAddress = XLSX.utils.encode_cell({ r: destRowIdx, c: col });
                const sourceCell = sourceWorksheet[sourceCellAddress];

                // 貼り付け先のセルを取得または作成
                if (!destWorksheet[destCellAddress]) {
                    destWorksheet[destCellAddress] = {};
                }

                // 値のみをコピー（VBAのValueプロパティと同じ）
                if (sourceCell && sourceCell.v !== undefined && sourceCell.v !== null) {
                    destWorksheet[destCellAddress].v = sourceCell.v;
                    destWorksheet[destCellAddress].t = sourceCell.t || 's';
                    // 表示文字列もコピー
                    if (sourceCell.w) {
                        destWorksheet[destCellAddress].w = sourceCell.w;
                    }
                    // 数値フォーマット情報もコピー
                    if (sourceCell.z) {
                        destWorksheet[destCellAddress].z = sourceCell.z;
                    }
                } else {
                    // 空セルの場合
                    destWorksheet[destCellAddress].v = '';
                    destWorksheet[destCellAddress].t = 's';
                    if (destWorksheet[destCellAddress].w) {
                        destWorksheet[destCellAddress].w = '';
                    }
                }
            }
        }

        // セル結合を追加（VBAと同じ: C:D, E:H, I:N, Q:S, T:V）
        for (let i = 0; i < numRows; i++) {
            const row = 2 + i; // 3行目から（0-indexed）
            destWorksheet['!merges'].push({ s: { r: row, c: 2 }, e: { r: row, c: 3 } }); // C:D
            destWorksheet['!merges'].push({ s: { r: row, c: 4 }, e: { r: row, c: 7 } }); // E:H
            destWorksheet['!merges'].push({ s: { r: row, c: 8 }, e: { r: row, c: 13 } }); // I:N
            destWorksheet['!merges'].push({ s: { r: row, c: 16 }, e: { r: row, c: 18 } }); // Q:S
            destWorksheet['!merges'].push({ s: { r: row, c: 19 }, e: { r: row, c: 21 } }); // T:V
        }

        // シートの範囲を更新（データが追加された分を反映）
        const newEndRow = Math.max(destRange.e.r, 2 + numRows - 1);
        const newEndCol = Math.max(destRange.e.c, 21); // V列まで（0-indexed: 21）
        destWorksheet['!ref'] = XLSX.utils.encode_range({
            s: { r: destRange.s.r, c: destRange.s.c },
            e: { r: newEndRow, c: newEndCol }
        });

        // 元のファイルに直接上書き保存
        // cellStylesオプションでセルスタイルを保持
        const buffer = XLSX.write(destWorkbook, {
            type: 'array',
            bookType: 'xlsx',
            cellStyles: true,
            bookVBA: true  // VBAマクロがある場合に保持
        });
        const writable = await destFileHandle.createWritable();
        await writable.write(buffer);
        await writable.close();

        // コピー元ファイルを削除
        try {
            await workFolderHandle.removeEntry(sourceFileHandle.name);
        } catch (deleteError) {
            console.warn('コピー元ファイルの削除に失敗:', deleteError);
        }

        // 完了メッセージ
        statusDiv.textContent = `処理完了: ${numRows}行のデータを処理しました。貼り付け先ファイルを更新し、コピー元ファイルを削除しました。`;
        statusDiv.className = 'excel-status success';

        // ファイルリストを再検索
        await searchFilesInFolder();

    } catch (error) {
        console.error('Excel処理エラー:', error);
        statusDiv.textContent = `エラー: ${error.message}`;
        statusDiv.className = 'excel-status error';
    } finally {
        processBtn.disabled = false;
    }
}

// ========================================
// カレンダー - 業務詳細ポップアップ
// ========================================

// 業務詳細ポップアップを開く
function openWorkDetailModal(year, month, day) {
    const modal = document.getElementById('work-detail-modal');
    const dateHeader = document.getElementById('work-detail-date');
    const totalWorkTime = document.getElementById('total-work-time');
    const workCount = document.getElementById('work-count');
    const workDetailList = document.getElementById('work-detail-list');

    // 日付を表示
    const dateStr = `${year}年${month + 1}月${day}日`;
    dateHeader.textContent = dateStr;

    // 業務記録を取得
    const records = JSON.parse(localStorage.getItem('task-records') || '[]');
    const targetDate = new Date(year, month, day);
    const targetDateStr = targetDate.toDateString();

    // その日の業務を抽出
    const dayRecords = records.filter(record => {
        const recordDate = new Date(record.startTime);
        return recordDate.toDateString() === targetDateStr;
    });

    if (dayRecords.length === 0) {
        // 業務がない場合
        totalWorkTime.textContent = '0時間0分';
        workCount.textContent = '0件';
        workDetailList.innerHTML = '<p class="no-data">この日の業務記録はありません</p>';
    } else {
        // 総作業時間を計算
        let totalMinutes = 0;
        dayRecords.forEach(record => {
            const start = new Date(record.startTime);
            const end = new Date(record.endTime);
            const duration = (end - start) / 1000 / 60; // 分単位
            totalMinutes += duration;
        });

        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        totalWorkTime.textContent = `${hours}時間${minutes}分`;
        workCount.textContent = `${dayRecords.length}件`;

        // 業務リストを表示
        let html = '';
        dayRecords.forEach(record => {
            const start = new Date(record.startTime);
            const end = new Date(record.endTime);
            const duration = (end - start) / 1000 / 60;
            const durationHours = Math.floor(duration / 60);
            const durationMinutes = Math.floor(duration % 60);

            const startTimeStr = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
            const endTimeStr = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

            html += `
                <div class="work-detail-item">
                    <div class="work-item-header">
                        <span class="work-item-name">${record.task}</span>
                        <span class="work-item-duration">${durationHours}:${String(durationMinutes).padStart(2, '0')}</span>
                    </div>
                    <div class="work-item-time">${startTimeStr} - ${endTimeStr}</div>
                </div>
            `;
        });
        workDetailList.innerHTML = html;
    }

    // モーダルを表示
    modal.style.display = 'flex';
}

// 業務詳細ポップアップを閉じる
function closeWorkDetailModal() {
    const modal = document.getElementById('work-detail-modal');
    modal.style.display = 'none';
}

// モーダル外クリックで閉じる
document.addEventListener('click', function(e) {
    const modal = document.getElementById('work-detail-modal');
    if (e.target === modal) {
        closeWorkDetailModal();
    }
});

// ========================================
// 全設定の統合保存・読み込み機能
// ========================================

// 全設定をエクスポート
function exportAllSettings() {
    const allData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        settings: {
            workTimeSettings: JSON.parse(localStorage.getItem('work-time-settings') || 'null'),
            quickTasks: JSON.parse(localStorage.getItem('quick-tasks') || '[]'),
            taskRecords: JSON.parse(localStorage.getItem('task-records') || '[]'),
            templateSettings: JSON.parse(localStorage.getItem('template-settings') || 'null'),
            inventoryMemo: localStorage.getItem('inventory-memo') || '',
            orderList: JSON.parse(localStorage.getItem('order-list') || '[]'),
            warehouseCapacities: JSON.parse(localStorage.getItem('warehouse-capacities') || '{}'),
            warehouseMappings: JSON.parse(localStorage.getItem('warehouseMappings') || '{}'),
            arrivalWarehouseCapacities: JSON.parse(localStorage.getItem('arrivalWarehouseCapacities') || '{}')
        }
    };

    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const today = new Date();
    const filename = `maedatimetool_全設定_${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}_${String(today.getHours()).padStart(2,'0')}${String(today.getMinutes()).padStart(2,'0')}.json`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('全設定を保存しました');
}

// 全設定をインポート
function importAllSettings() {
    if (!confirm('全設定を読み込みますか？\n現在の設定は上書きされます。')) {
        return;
    }

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

                if (!data.settings) {
                    alert('無効なファイル形式です');
                    return;
                }

                // 各設定を復元
                const settings = data.settings;

                if (settings.workTimeSettings) {
                    localStorage.setItem('work-time-settings', JSON.stringify(settings.workTimeSettings));
                    loadWorkTimeSettings();
                }

                if (settings.quickTasks) {
                    localStorage.setItem('quick-tasks', JSON.stringify(settings.quickTasks));
                    renderQuickTaskButtons();
                }

                if (settings.taskRecords) {
                    localStorage.setItem('task-records', JSON.stringify(settings.taskRecords));
                    renderTaskRecords();
                }

                if (settings.templateSettings) {
                    localStorage.setItem('template-settings', JSON.stringify(settings.templateSettings));
                    renderTemplateList();
                }

                if (settings.inventoryMemo !== undefined) {
                    localStorage.setItem('inventory-memo', settings.inventoryMemo);
                }

                if (settings.orderList) {
                    localStorage.setItem('order-list', JSON.stringify(settings.orderList));
                }

                if (settings.warehouseCapacities) {
                    localStorage.setItem('warehouse-capacities', JSON.stringify(settings.warehouseCapacities));
                    // グローバル変数も更新
                    warehouseCapacities = settings.warehouseCapacities;
                    // グラフが表示されている場合は再描画
                    if (currentWarehouse) {
                        renderChart(currentWarehouse);
                    }
                }

                if (settings.warehouseMappings) {
                    localStorage.setItem('warehouseMappings', JSON.stringify(settings.warehouseMappings));
                    // グローバル変数も更新
                    warehouseMappings = settings.warehouseMappings;
                }

                if (settings.arrivalWarehouseCapacities) {
                    localStorage.setItem('arrivalWarehouseCapacities', JSON.stringify(settings.arrivalWarehouseCapacities));
                    // グローバル変数も更新
                    arrivalWarehouseCapacities = settings.arrivalWarehouseCapacities;
                    // グラフが表示されている場合は再描画
                    if (currentArrivalWarehouse) {
                        updateArrivalChart();
                    }
                }

                // カレンダーを再描画（業務記録の反映）
                renderSixMonthCalendar();

                alert('全設定を読み込みました');
            } catch (error) {
                alert('ファイルの読み込みに失敗しました');
                console.error(error);
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// ========================================
// 出荷データ可視化機能
// ========================================

// Chart.js プラグインの登録
if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

// グローバル変数
let shipmentData = null; // 読み込んだCSVデータ
let shipmentChart = null; // Chart.jsインスタンス
let currentWarehouse = null; // 現在表示中の倉庫
let warehouseCapacities = {}; // 倉庫別キャパシティ設定
let currentPeriodOffset = 0; // 表示期間のオフセット（0=今月から3ヶ月、1=3ヶ月後から、-1=3ヶ月前から）
let allWarehouses = []; // 全倉庫リスト

// CSVファイル選択ハンドラ
function handleCSVFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const pathInput = document.getElementById('csv-path-input');
        pathInput.value = file.name;

        // ファイルを読み込む
        const reader = new FileReader();
        reader.onload = function(e) {
            parseCSVData(e.target.result);
        };
        reader.readAsText(file, 'Shift_JIS'); // 日本語CSVはShift_JISが多い
    }
}

// データ読込ボタンのハンドラ
function loadShipmentData() {
    const fileInput = document.getElementById('csv-file-input');
    if (fileInput.files.length === 0) {
        showShipmentStatus('ファイルを選択してください', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        parseCSVData(e.target.result);
    };
    reader.readAsText(file, 'Shift_JIS');
}

// CSV データを解析
function parseCSVData(csvText) {
    try {
        showShipmentStatus('データを解析中...', 'info');

        // PapaParseでCSVを解析
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            quoteChar: '"',
            escapeChar: '"',
            delimiter: ',',
            // newlineは自動検出に任せる（データ内改行対応のため）
            dynamicTyping: false,
            complete: function(results) {
                console.log('=== 出荷データPapaParse解析結果 ===');
                console.log('エラー:', results.errors);
                console.log('メタ情報:', results.meta);
                console.log('データ行数:', results.data.length);

                if (results.errors && results.errors.length > 0) {
                    console.warn('パース時の警告（最初の10件）:', results.errors.slice(0, 10));
                }

                if (results.data.length > 0) {
                    const firstRow = results.data[0];
                    if (firstRow.__parsed_extra) {
                        console.warn('警告: 列数の不一致が検出されました。余分なデータ:', firstRow.__parsed_extra);
                    }
                    console.log('1行目の列数:', Object.keys(firstRow).length);
                }

                shipmentData = results.data;
                processShipmentData();
            },
            error: function(error) {
                showShipmentStatus(`CSVの解析に失敗しました: ${error.message}`, 'error');
            }
        });
    } catch (error) {
        showShipmentStatus(`エラー: ${error.message}`, 'error');
    }
}

// データを集計・成形
function processShipmentData() {
    try {
        if (!shipmentData || shipmentData.length === 0) {
            showShipmentStatus('データが空です', 'error');
            return;
        }

        // デバッグ: ヘッダー情報を出力
        if (shipmentData.length > 0) {
            console.log('=== 出荷データCSVヘッダー情報 ===');
            console.log('利用可能な列名:', Object.keys(shipmentData[0]));
            console.log('サンプルデータ（1行目）:', shipmentData[0]);
        }

        showShipmentStatus('データを集計中...', 'info');

        // 倉庫名のリストを取得
        allWarehouses = [...new Set(shipmentData.map(row => row['倉庫名']).filter(w => w))];

        if (allWarehouses.length === 0) {
            showShipmentStatus('倉庫名が見つかりません', 'error');
            return;
        }

        // キャパシティ設定をロード
        loadCapacitySettings(allWarehouses);

        // キャパシティ設定ボタンを表示
        document.getElementById('capacity-settings-btn').style.display = 'inline-block';

        // タブを生成
        renderWarehouseTabs(allWarehouses);

        // コントロールを表示
        document.getElementById('chart-controls').style.display = 'flex';
        document.getElementById('chart-and-table').style.display = 'block';

        // 最初の倉庫を表示
        currentWarehouse = allWarehouses[0];
        currentPeriodOffset = 0;
        renderChart(currentWarehouse);

        showShipmentStatus(`データ読込完了 (${shipmentData.length}行)`, 'success');

        // カレンダーを更新（統合表示のため常に更新）
        renderSixMonthCalendar();

    } catch (error) {
        showShipmentStatus(`エラー: ${error.message}`, 'error');
        console.error('データ処理エラー:', error);
    }
}

// 倉庫別にデータを集計
function aggregateDataByWarehouse(warehouse) {
    // 指定倉庫のデータをフィルター
    const warehouseData = shipmentData.filter(row => row['倉庫名'] === warehouse);

    // 出荷希望日でグループ化して集計
    const grouped = {};

    warehouseData.forEach(row => {
        const date = row['出荷希望日'];
        if (!date) return;

        if (!grouped[date]) {
            grouped[date] = {
                date: date,
                rowCount: 0,
                rows: []
            };
        }

        grouped[date].rowCount++;
        grouped[date].rows.push(row);
    });

    // 日付順にソート
    const sorted = Object.values(grouped).sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    return sorted;
}

// キャパシティ設定モーダルを開く
function openCapacitySettings() {
    const modal = document.getElementById('capacity-modal');
    const inputsDiv = document.getElementById('capacity-inputs-modal');

    inputsDiv.innerHTML = '';

    allWarehouses.forEach(warehouse => {
        const capacity = warehouseCapacities[warehouse];

        const wrapper = document.createElement('div');
        wrapper.className = 'capacity-input-wrapper';

        const label = document.createElement('label');
        label.textContent = `${warehouse}:`;
        label.className = 'capacity-input-label';

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `capacity-${warehouse}`;
        input.value = capacity !== null && capacity !== undefined ? capacity : '';
        input.placeholder = 'キャパなし (空欄)';
        input.className = 'capacity-input';

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        inputsDiv.appendChild(wrapper);
    });

    modal.style.display = 'flex';
}

// キャパシティ設定モーダルを閉じる
function closeCapacityModal() {
    document.getElementById('capacity-modal').style.display = 'none';
}

// キャパシティ設定を保存
function saveCapacitySettings() {
    const inputs = document.querySelectorAll('.capacity-input');
    inputs.forEach(input => {
        const warehouse = input.id.replace('capacity-', '');
        const value = input.value.trim();

        if (value === '') {
            // 空欄の場合はnull (キャパなし)
            warehouseCapacities[warehouse] = null;
        } else {
            const numValue = parseInt(value);
            warehouseCapacities[warehouse] = isNaN(numValue) ? null : numValue;
        }
    });

    // localStorageに保存
    localStorage.setItem('warehouse-capacities', JSON.stringify(warehouseCapacities));

    // モーダルを閉じる
    closeCapacityModal();

    // グラフを再描画
    if (currentWarehouse) {
        renderChart(currentWarehouse);
    }

    showShipmentStatus('キャパシティ設定を保存しました', 'success');
}

// キャパシティ設定をロード
function loadCapacitySettings(warehouses) {
    const saved = localStorage.getItem('warehouse-capacities');
    if (saved) {
        warehouseCapacities = JSON.parse(saved);
    }

    // 新しい倉庫があればデフォルト値60を設定
    warehouses.forEach(warehouse => {
        if (!(warehouse in warehouseCapacities)) {
            warehouseCapacities[warehouse] = 60;
        }
    });
}

// 倉庫タブを表示
function renderWarehouseTabs(warehouses) {
    const tabsDiv = document.getElementById('warehouse-tabs');
    tabsDiv.innerHTML = '';

    warehouses.forEach(warehouse => {
        const tab = document.createElement('button');
        tab.className = 'warehouse-tab';
        tab.textContent = warehouse;
        tab.onclick = () => switchWarehouse(warehouse);

        if (warehouse === currentWarehouse) {
            tab.classList.add('active');
        }

        tabsDiv.appendChild(tab);
    });

    tabsDiv.style.display = 'flex';
}

// 倉庫を切り替え
function switchWarehouse(warehouse) {
    currentWarehouse = warehouse;

    // タブのアクティブ状態を更新
    const tabs = document.querySelectorAll('.warehouse-tab');
    tabs.forEach(tab => {
        if (tab.textContent === warehouse) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // グラフを再描画
    renderChart(warehouse);

    // カレンダーを更新（選択倉庫のデータを反映）
    renderSixMonthCalendar();
}

// 期間ナビゲーション: 前へ
function previousPeriod() {
    currentPeriodOffset--;
    renderChart(currentWarehouse);
}

// 期間ナビゲーション: 次へ
function nextPeriod() {
    currentPeriodOffset++;
    renderChart(currentWarehouse);
}

// グラフを描画（3ヶ月表示）
function renderChart(warehouse) {
    const aggregated = aggregateDataByWarehouse(warehouse);
    const capacity = warehouse in warehouseCapacities ? warehouseCapacities[warehouse] : 60;

    // 表示期間を計算（今日から3ヶ月分 + オフセット）
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() + (currentPeriodOffset * 3), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);

    // 期間ラベルを更新
    const periodLabel = document.getElementById('current-period');
    const startStr = `${startDate.getFullYear()}/${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    const endStr = `${endDate.getFullYear()}/${String(endDate.getMonth() + 1).padStart(2, '0')}`;
    periodLabel.textContent = `${startStr} 〜 ${endStr}`;

    // 期間内のデータのみフィルター
    const filtered = aggregated.filter(item => {
        const date = new Date(item.date);
        return date >= startDate && date <= endDate;
    });

    // 日付ラベルと数行数データを準備
    const labels = filtered.map(item => item.date);
    const rowCounts = filtered.map(item => item.rowCount);

    // Chart.jsでグラフを描画
    const ctx = document.getElementById('shipment-chart');

    // 既存のグラフがあれば破棄
    if (shipmentChart) {
        shipmentChart.destroy();
    }

    // データセットを構築
    const datasets = [
        {
            label: '数行数',
            data: rowCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#d0d0d0',
                font: {
                    size: 10
                }
            }
        }
    ];

    // capacityがnullでない場合のみキャパシティラインを追加
    if (capacity !== null && capacity !== undefined) {
        datasets.push({
            label: 'キャパシティ',
            data: Array(labels.length).fill(capacity),
            type: 'line',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            datalabels: {
                display: false
            }
        });
    }

    shipmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${warehouse} - 出荷データ`,
                    font: {
                        size: 16
                    },
                    color: '#d0d0d0'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#d0d0d0'
                    }
                },
                datalabels: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '数量',
                        color: '#c0c0c0'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    },
                    grid: {
                        color: '#3a3a3a'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '出荷希望日',
                        color: '#c0c0c0'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    },
                    grid: {
                        color: '#3a3a3a'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// ステータスメッセージを表示
function showShipmentStatus(message, type) {
    const statusDiv = document.getElementById('shipment-status');
    statusDiv.textContent = message;
    statusDiv.className = `shipment-status ${type}`;
}

// ========================================
// ブラウザ終了警告
// ========================================

// ブラウザを閉じる前に警告を表示
window.addEventListener('beforeunload', function(e) {
    // 標準的な警告メッセージ
    e.preventDefault();
    e.returnValue = ''; // Chrome では空文字列を設定する必要がある
    return ''; // 一部のブラウザ向け
});

// ========================================
// 通知音機能
// ========================================

// 控えめな通知音を再生
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // ベル音（2音階を3回繰り返し）
        const frequencies = [659.25, 783.99]; // E5, G5（ミソ）
        let startTime = audioContext.currentTime;

        // 3回繰り返し
        for (let repeat = 0; repeat < 3; repeat++) {
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.type = 'sine'; // 柔らかい音
                oscillator.frequency.value = freq;

                // 音量エンベロープ（気づきやすい音量）
                const noteStart = startTime + (repeat * 0.6) + (index * 0.15);
                gainNode.gain.setValueAtTime(0, noteStart);
                gainNode.gain.linearRampToValueAtTime(0.3, noteStart + 0.02); // 音量アップ
                gainNode.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.25);

                oscillator.start(noteStart);
                oscillator.stop(noteStart + 0.25);
            });
        }
    } catch (error) {
        console.log('通知音の再生に失敗しました:', error);
    }
}

// ========================================
// カレンダー表示切り替え機能
// ========================================
function toggleCalendarDisplay() {
    const showWorkRecords = document.getElementById('toggle-work-records').checked;
    const showShipment = document.getElementById('toggle-shipment').checked;
    const showArrival = document.getElementById('toggle-arrival').checked;

    const container = document.getElementById('calendar-container');

    // クラスを削除
    container.classList.remove('hide-work-records', 'hide-shipment', 'hide-arrival');

    // チェックが外れている項目に対応するクラスを追加
    if (!showWorkRecords) {
        container.classList.add('hide-work-records');
    }
    if (!showShipment) {
        container.classList.add('hide-shipment');
    }
    if (!showArrival) {
        container.classList.add('hide-arrival');
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);

// ====================================
// 入荷待ちデータ可視化機能
// ====================================

// グローバル変数
let arrivalData = null; // 読み込んだCSVデータ
let arrivalChart = null; // Chart.jsインスタンス
let currentArrivalWarehouse = null; // 現在表示中の倉庫
let currentArrivalPeriodOffset = 0; // 表示期間のオフセット
let allArrivalWarehouses = []; // 全倉庫リスト
let warehouseMappings = {}; // 倉庫マッピング設定
let arrivalWarehouseCapacities = {}; // 入荷待ち倉庫別キャパシティ設定

// 倉庫マッピング設定を読み込む
function loadWarehouseMappings() {
    const saved = localStorage.getItem('warehouseMappings');
    if (saved) {
        warehouseMappings = JSON.parse(saved);
    } else {
        // デフォルト設定
        warehouseMappings = {
            'MCUD神戸西倉庫': '兵庫県神戸市須磨区弥栄台',
            '横浜倉庫': '神奈川県横浜市',
            '大阪倉庫': '大阪府',
            '名古屋倉庫': '愛知県名古屋市',
            '福岡倉庫': '福岡県'
        };
    }

    // 入荷キャパシティ設定を読み込む
    const savedCapacities = localStorage.getItem('arrivalWarehouseCapacities');
    if (savedCapacities) {
        arrivalWarehouseCapacities = JSON.parse(savedCapacities);
    }
}

// 倉庫マッピング設定を保存
function saveWarehouseMappings() {
    localStorage.setItem('warehouseMappings', JSON.stringify(warehouseMappings));
    localStorage.setItem('arrivalWarehouseCapacities', JSON.stringify(arrivalWarehouseCapacities));
}

// 住所から倉庫を判定
function detectWarehouseFromAddress(address) {
    if (!address) return '未分類';

    for (const [warehouseName, keyword] of Object.entries(warehouseMappings)) {
        if (keyword && address.includes(keyword)) {
            return warehouseName;
        }
    }
    return '未分類';
}

// CSVファイル選択ハンドラ
function handleArrivalCSVFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const pathInput = document.getElementById('arrival-csv-path-input');
        pathInput.value = file.name;

        // ファイルを読み込む
        const reader = new FileReader();
        reader.onload = function(e) {
            parseArrivalCSVData(e.target.result);
        };
        reader.readAsText(file, 'Shift_JIS');
    }
}

// データ読込ボタンのハンドラ
function loadArrivalData() {
    const fileInput = document.getElementById('arrival-csv-file-input');
    if (fileInput.files.length === 0) {
        showArrivalStatus('ファイルを選択してください', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        parseArrivalCSVData(e.target.result);
    };
    reader.readAsText(file, 'Shift_JIS');
}

// CSVデータを解析（ヘッダーなしモード）
function parseArrivalCSVData(csvText) {
    try {
        showArrivalStatus('データを解析中...', 'info');

        Papa.parse(csvText, {
            header: false, // ヘッダーを使わずに配列として解析
            skipEmptyLines: true,
            quoteChar: '"',
            escapeChar: '"',
            delimiter: ',',
            dynamicTyping: false,
            complete: function(results) {
                console.log('=== 入荷待ちCSV解析結果（配列モード） ===');
                console.log('総行数:', results.data.length);
                console.log('エラー数:', results.errors.length);

                if (results.data.length < 2) {
                    showArrivalStatus('データが不足しています', 'error');
                    return;
                }

                // ヘッダー行を取得
                const headerRow = results.data[0];
                console.log('ヘッダー列数:', headerRow.length);
                console.log('ヘッダー（最初の10列）:', headerRow.slice(0, 10));

                // 必要な列のインデックスを探す
                const dateColIndex = headerRow.indexOf('最終入荷予定日');
                const addressColIndex = headerRow.indexOf('発注納入先住所');
                const quantityColIndex = headerRow.indexOf('数量');

                console.log('列インデックス:');
                console.log('  最終入荷予定日:', dateColIndex);
                console.log('  発注納入先住所:', addressColIndex);
                console.log('  数量:', quantityColIndex);

                if (dateColIndex === -1 || addressColIndex === -1 || quantityColIndex === -1) {
                    showArrivalStatus('必要な列が見つかりません', 'error');
                    console.error('列が見つかりません。ヘッダー全体:', headerRow);
                    return;
                }

                // データ行をオブジェクトに変換
                arrivalData = [];
                for (let i = 1; i < results.data.length; i++) {
                    const row = results.data[i];
                    if (row.length > Math.max(dateColIndex, addressColIndex, quantityColIndex)) {
                        arrivalData.push({
                            '最終入荷予定日': row[dateColIndex] || '',
                            '発注納入先住所': row[addressColIndex] || '',
                            '数量': row[quantityColIndex] || '0'
                        });
                    }
                }

                console.log('変換後のデータ行数:', arrivalData.length);
                console.log('サンプル（最初の3行）:');
                arrivalData.slice(0, 3).forEach((row, i) => {
                    console.log(`  ${i + 1}:`, row);
                });

                processArrivalData();
            },
            error: function(error) {
                showArrivalStatus('CSVの解析に失敗しました: ' + error.message, 'error');
            }
        });
    } catch (error) {
        showArrivalStatus('エラー: ' + error.message, 'error');
    }
}

// データを処理
function processArrivalData() {
    if (!arrivalData || arrivalData.length === 0) {
        showArrivalStatus('データが空です', 'error');
        return;
    }

    console.log('=== データ処理開始 ===');
    console.log('処理対象データ数:', arrivalData.length);

    loadWarehouseMappings();

    // 倉庫ごとにデータを集計
    const warehouseData = {};
    let processedCount = 0;
    let skippedCount = 0;
    const skippedReasons = {};

    arrivalData.forEach((row, index) => {
        const address = row['発注納入先住所'] || '';
        const dateStr = row['最終入荷予定日'] || '';
        const quantityStr = row['数量'] || '0';

        // デバッグ: 最初の5件の詳細情報を出力
        if (index < 5) {
            console.log(`データ${index + 1}件目:`, {
                住所: address,
                最終入荷予定日: dateStr,
                数量: quantityStr
            });
        }

        if (!dateStr) {
            skippedCount++;
            skippedReasons['日付なし'] = (skippedReasons['日付なし'] || 0) + 1;
            return;
        }

        const warehouse = detectWarehouseFromAddress(address);
        const quantity = parseInt(quantityStr) || 0;

        // デバッグ: 最初の5件の倉庫判定結果を出力
        if (index < 5) {
            console.log(`  → 倉庫判定: ${warehouse}`);
        }

        if (!warehouseData[warehouse]) {
            warehouseData[warehouse] = {};
        }

        if (!warehouseData[warehouse][dateStr]) {
            warehouseData[warehouse][dateStr] = 0;
        }

        warehouseData[warehouse][dateStr] += quantity;
        processedCount++;
    });

    console.log(`処理結果: 処理済み ${processedCount}件、スキップ ${skippedCount}件`);
    if (Object.keys(skippedReasons).length > 0) {
        console.log('スキップ理由:', skippedReasons);
    }
    console.log('倉庫別データ件数:', Object.keys(warehouseData).map(w => `${w}: ${Object.keys(warehouseData[w]).length}日分`));

    allArrivalWarehouses = Object.keys(warehouseData).sort();

    if (allArrivalWarehouses.length === 0) {
        showArrivalStatus('有効なデータが見つかりませんでした', 'error');
        return;
    }

    // UIを表示
    document.getElementById('arrival-chart-controls').style.display = 'flex';
    document.getElementById('arrival-chart-and-table').style.display = 'block';

    // 倉庫タブを作成
    createArrivalWarehouseTabs();

    // 最初の倉庫を表示
    currentArrivalWarehouse = allArrivalWarehouses[0];
    currentArrivalPeriodOffset = 0;
    updateArrivalChart();

    showArrivalStatus(`データ読込完了: ${arrivalData.length}行、${allArrivalWarehouses.length}倉庫`, 'success');

    // カレンダーを更新（統合表示のため常に更新）
    renderSixMonthCalendar();
}

// 倉庫タブを作成
function createArrivalWarehouseTabs() {
    const tabsContainer = document.getElementById('arrival-warehouse-tabs');
    tabsContainer.innerHTML = '';

    allArrivalWarehouses.forEach(warehouse => {
        const tab = document.createElement('button');
        tab.className = 'warehouse-tab';
        tab.textContent = warehouse;
        tab.onclick = () => switchArrivalWarehouse(warehouse);
        tabsContainer.appendChild(tab);
    });
}

// 倉庫を切り替え
function switchArrivalWarehouse(warehouse) {
    currentArrivalWarehouse = warehouse;
    currentArrivalPeriodOffset = 0;
    updateArrivalChart();

    // カレンダーを更新（統合表示のため常に更新）
    renderSixMonthCalendar();
}

// グラフを更新
function updateArrivalChart() {
    if (!arrivalData || !currentArrivalWarehouse) return;

    // タブのアクティブ状態を更新
    document.querySelectorAll('#arrival-warehouse-tabs .warehouse-tab').forEach(tab => {
        if (tab.textContent === currentArrivalWarehouse) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // データを集計
    const warehouseRows = [];
    arrivalData.forEach(row => {
        const address = row['発注納入先住所'] || '';
        const warehouse = detectWarehouseFromAddress(address);
        if (warehouse === currentArrivalWarehouse) {
            warehouseRows.push(row);
        }
    });

    // 日付ごとに集計
    const dateQuantities = {};
    warehouseRows.forEach(row => {
        const dateStr = row['最終入荷予定日'] || '';
        const quantityStr = row['数量'] || '0';
        if (!dateStr) return;

        const quantity = parseInt(quantityStr) || 0;
        if (!dateQuantities[dateStr]) {
            dateQuantities[dateStr] = 0;
        }
        dateQuantities[dateStr] += quantity;
    });

    // 日付でソート
    const sortedDates = Object.keys(dateQuantities).sort();

    // 期間を計算（3ヶ月分を表示）
    const today = new Date();
    const startMonth = new Date(today.getFullYear(), today.getMonth() + currentArrivalPeriodOffset * 3, 1);
    const endMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + 3, 0);

    // 期間内のデータをフィルタ
    const filteredDates = sortedDates.filter(dateStr => {
        const date = new Date(dateStr);
        return date >= startMonth && date <= endMonth;
    });

    const chartData = filteredDates.map(date => dateQuantities[date]);

    // 期間ラベルを更新
    const periodLabel = `${startMonth.getFullYear()}年${startMonth.getMonth() + 1}月 - ${endMonth.getFullYear()}年${endMonth.getMonth() + 1}月`;
    document.getElementById('arrival-current-period').textContent = periodLabel;

    // グラフを描画
    drawArrivalChart(filteredDates, chartData);
}

// グラフを描画
function drawArrivalChart(dates, quantities) {
    const canvas = document.getElementById('arrival-chart');
    const ctx = canvas.getContext('2d');

    // 既存のチャートを破棄
    if (arrivalChart) {
        arrivalChart.destroy();
    }

    // データセットを構築
    const datasets = [{
        label: '入荷待ち数量',
        data: quantities,
        backgroundColor: 'rgba(90, 159, 212, 0.7)',
        borderColor: 'rgba(90, 159, 212, 1)',
        borderWidth: 1,
        datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#e8e8e8',
            font: {
                weight: 'bold',
                size: 11
            },
            formatter: function(value) {
                return value > 0 ? value : '';
            }
        }
    }];

    // キャパシティラインを追加（倉庫が選択されている場合）
    if (currentArrivalWarehouse && currentArrivalWarehouse in arrivalWarehouseCapacities) {
        const capacity = arrivalWarehouseCapacities[currentArrivalWarehouse];
        if (capacity !== null) {
            datasets.push({
                label: 'キャパシティ',
                data: Array(dates.length).fill(capacity),
                type: 'line',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0,
                datalabels: {
                    display: false
                }
            });
        }
    }

    arrivalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#e8e8e8'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#e8e8e8',
                    bodyColor: '#e8e8e8'
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#e8e8e8',
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    formatter: function(value) {
                        return value > 0 ? value : '';
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#e8e8e8',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#e8e8e8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// 前の期間へ
function previousArrivalPeriod() {
    currentArrivalPeriodOffset--;
    updateArrivalChart();
}

// 次の期間へ
function nextArrivalPeriod() {
    currentArrivalPeriodOffset++;
    updateArrivalChart();
}

// ステータスを表示
function showArrivalStatus(message, type) {
    const statusDiv = document.getElementById('arrival-status');
    statusDiv.textContent = message;
    statusDiv.className = 'shipment-status ' + type;
    statusDiv.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }
}

// 倉庫マッピング設定モーダルを開く
function openWarehouseMappingSettings() {
    loadWarehouseMappings();

    // 既存の設定を入力欄に反映
    let index = 1;
    for (const [name, keyword] of Object.entries(warehouseMappings)) {
        const nameInput = document.getElementById(`warehouse-${index}-name`);
        const keywordInput = document.getElementById(`warehouse-${index}-keyword`);
        const capacityInput = document.getElementById(`warehouse-${index}-arrival-capacity`);
        if (nameInput && keywordInput) {
            nameInput.value = name;
            keywordInput.value = keyword;
            if (capacityInput && name in arrivalWarehouseCapacities) {
                capacityInput.value = arrivalWarehouseCapacities[name];
            }
        }
        index++;
        if (index > 5) break;
    }

    document.getElementById('warehouse-mapping-modal').style.display = 'flex';
}

// 倉庫マッピング設定モーダルを閉じる
function closeWarehouseMappingModal() {
    document.getElementById('warehouse-mapping-modal').style.display = 'none';
}

// 倉庫マッピング設定を保存
function saveWarehouseMappingSettings() {
    warehouseMappings = {};
    arrivalWarehouseCapacities = {};

    for (let i = 1; i <= 5; i++) {
        const nameInput = document.getElementById(`warehouse-${i}-name`);
        const keywordInput = document.getElementById(`warehouse-${i}-keyword`);
        const capacityInput = document.getElementById(`warehouse-${i}-arrival-capacity`);

        if (nameInput && keywordInput && nameInput.value && keywordInput.value) {
            warehouseMappings[nameInput.value] = keywordInput.value;

            // キャパシティ設定を保存（空欄の場合はnull）
            if (capacityInput && capacityInput.value) {
                const capacityValue = parseInt(capacityInput.value);
                arrivalWarehouseCapacities[nameInput.value] = isNaN(capacityValue) ? null : capacityValue;
            } else {
                arrivalWarehouseCapacities[nameInput.value] = null;
            }
        }
    }

    saveWarehouseMappings();
    closeWarehouseMappingModal();

    // データが読み込まれていれば再処理
    if (arrivalData) {
        processArrivalData();
    }

    alert('倉庫マッピング設定を保存しました');
}

// 初期化時に倉庫マッピングを読み込む
loadWarehouseMappings();
