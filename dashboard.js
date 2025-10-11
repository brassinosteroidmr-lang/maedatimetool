// ========================================
// データ取得
// ========================================
function getTaskRecords() {
    const data = localStorage.getItem('task-records');
    return data ? JSON.parse(data) : [];
}

// ========================================
// 日付フィルタリング
// ========================================
let currentPeriod = 'today';

function filterRecordsByPeriod(records, period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch(period) {
        case 'today':
            return records.filter(record => {
                const recordDate = new Date(record.startTime);
                return recordDate >= today;
            });

        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return records.filter(record => {
                const recordDate = new Date(record.startTime);
                return recordDate >= weekAgo;
            });

        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return records.filter(record => {
                const recordDate = new Date(record.startTime);
                return recordDate >= monthStart;
            });

        case 'all':
            return records;

        default:
            return records;
    }
}

// ========================================
// 業務別集計
// ========================================
function aggregateByTask(records) {
    const taskMap = {};

    records.forEach(record => {
        if (!taskMap[record.task]) {
            taskMap[record.task] = {
                task: record.task,
                count: 0,
                totalSeconds: 0
            };
        }
        taskMap[record.task].count++;
        taskMap[record.task].totalSeconds += record.duration;
    });

    // 配列に変換してソート（合計時間の降順）
    const taskArray = Object.values(taskMap);
    taskArray.sort((a, b) => b.totalSeconds - a.totalSeconds);

    return taskArray;
}

// ========================================
// 日別集計（過去7日間）
// ========================================
function aggregateByDay() {
    const records = getTaskRecords();
    const dailyMap = {};
    const today = new Date();

    // 過去7日間の日付を初期化
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        dailyMap[dateStr] = 0;
    }

    // 記録を集計
    records.forEach(record => {
        const recordDate = new Date(record.startTime);
        const dateStr = `${recordDate.getMonth() + 1}/${recordDate.getDate()}`;

        if (dailyMap.hasOwnProperty(dateStr)) {
            dailyMap[dateStr] += record.duration;
        }
    });

    return dailyMap;
}

// ========================================
// 時間フォーマット
// ========================================
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}時間${minutes}分`;
    } else {
        return `${minutes}分`;
    }
}

function formatDurationForChart(seconds) {
    return (seconds / 3600).toFixed(1);
}

// ========================================
// サマリーカード更新
// ========================================
function updateSummaryCards() {
    const allRecords = getTaskRecords();

    // 今日の合計
    const todayRecords = filterRecordsByPeriod(allRecords, 'today');
    const todayTotal = todayRecords.reduce((sum, r) => sum + r.duration, 0);
    document.getElementById('today-total').textContent = formatDuration(todayTotal);

    // 今週の合計
    const weekRecords = filterRecordsByPeriod(allRecords, 'week');
    const weekTotal = weekRecords.reduce((sum, r) => sum + r.duration, 0);
    document.getElementById('week-total').textContent = formatDuration(weekTotal);

    // 最も時間を使った業務（全期間）
    const taskAgg = aggregateByTask(allRecords);
    const topTask = taskAgg.length > 0 ? taskAgg[0].task : '-';
    document.getElementById('top-task').textContent = topTask;

    // 総記録数
    document.getElementById('total-records').textContent = `${allRecords.length}件`;
}

// ========================================
// テーブル更新
// ========================================
function updateTaskTable() {
    const records = getTaskRecords();
    const filteredRecords = filterRecordsByPeriod(records, currentPeriod);
    const taskAgg = aggregateByTask(filteredRecords);

    const tbody = document.getElementById('task-table-body');

    if (taskAgg.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #606060; padding: 20px;">
                    データがありません
                </td>
            </tr>
        `;
        return;
    }

    const totalSeconds = taskAgg.reduce((sum, t) => sum + t.totalSeconds, 0);

    let html = '';
    taskAgg.forEach(task => {
        const avgSeconds = Math.floor(task.totalSeconds / task.count);
        const percentage = ((task.totalSeconds / totalSeconds) * 100).toFixed(1);

        html += `
            <tr>
                <td class="task-name">${task.task}</td>
                <td class="count">${task.count}回</td>
                <td>${formatDuration(task.totalSeconds)}</td>
                <td>${formatDuration(avgSeconds)}</td>
                <td class="percentage">${percentage}%</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ========================================
// グラフ描画（シンプルなCanvas実装）
// ========================================
let taskChart = null;
let dailyChart = null;

function drawTaskChart() {
    const records = getTaskRecords();
    const filteredRecords = filterRecordsByPeriod(records, currentPeriod);
    const taskAgg = aggregateByTask(filteredRecords);

    const canvas = document.getElementById('task-chart');
    const noDataMsg = document.getElementById('no-data-message');

    if (taskAgg.length === 0) {
        canvas.style.display = 'none';
        noDataMsg.style.display = 'flex';
        return;
    }

    canvas.style.display = 'block';
    noDataMsg.style.display = 'none';

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // 上位8件まで表示（コンパクト化）
    const topTasks = taskAgg.slice(0, 8);
    const maxSeconds = Math.max(...topTasks.map(t => t.totalSeconds));

    // 棒グラフ描画（コンパクト化）
    const barHeight = 20;
    const barSpacing = 6;
    const leftMargin = 120;
    const rightMargin = 80;
    const chartWidth = canvas.width - leftMargin - rightMargin;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    topTasks.forEach((task, index) => {
        const y = index * (barHeight + barSpacing) + 10;
        const barWidth = (task.totalSeconds / maxSeconds) * chartWidth;

        // 業務名
        ctx.fillStyle = '#c8c8c8';
        ctx.textAlign = 'right';
        ctx.fillText(task.task, leftMargin - 8, y + barHeight / 2 + 3);

        // バー
        const gradient = ctx.createLinearGradient(leftMargin, 0, leftMargin + barWidth, 0);
        gradient.addColorStop(0, '#4a5a4a');
        gradient.addColorStop(1, '#5a7a5a');
        ctx.fillStyle = gradient;
        ctx.fillRect(leftMargin, y, barWidth, barHeight);

        // 時間表示
        ctx.fillStyle = '#d8d8d8';
        ctx.textAlign = 'left';
        ctx.fillText(formatDuration(task.totalSeconds), leftMargin + barWidth + 8, y + barHeight / 2 + 3);
    });
}

function drawDailyChart() {
    const dailyData = aggregateByDay();
    const canvas = document.getElementById('daily-chart');
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const dates = Object.keys(dailyData);
    const values = Object.values(dailyData);
    const maxSeconds = Math.max(...values, 1);

    const leftMargin = 40;
    const rightMargin = 15;
    const bottomMargin = 30;
    const topMargin = 15;
    const chartWidth = canvas.width - leftMargin - rightMargin;
    const chartHeight = canvas.height - bottomMargin - topMargin;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    // グリッド線
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = topMargin + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(leftMargin, y);
        ctx.lineTo(canvas.width - rightMargin, y);
        ctx.stroke();

        // Y軸ラベル（時間）
        const hours = ((maxSeconds / 3600) * (1 - i / 4)).toFixed(1);
        ctx.fillStyle = '#808080';
        ctx.textAlign = 'right';
        ctx.fillText(`${hours}h`, leftMargin - 4, y + 3);
    }

    // バー描画
    const barWidth = chartWidth / dates.length * 0.7;
    const barSpacing = chartWidth / dates.length;

    dates.forEach((date, index) => {
        const seconds = values[index];
        const barHeight = (seconds / maxSeconds) * chartHeight;
        const x = leftMargin + index * barSpacing + (barSpacing - barWidth) / 2;
        const y = topMargin + chartHeight - barHeight;

        // バー
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#5a7a5a');
        gradient.addColorStop(1, '#4a5a4a');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // X軸ラベル（日付）
        ctx.fillStyle = '#a0a0a0';
        ctx.textAlign = 'center';
        ctx.fillText(date, x + barWidth / 2, canvas.height - bottomMargin + 18);
    });
}

// ========================================
// 期間選択
// ========================================
function setupPeriodButtons() {
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // アクティブ状態を切り替え
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 期間を更新
            currentPeriod = this.dataset.period;

            // データを再描画
            updateTaskTable();
            drawTaskChart();
        });
    });
}

// ========================================
// ウィンドウリサイズ対応
// ========================================
function setupResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            drawTaskChart();
            drawDailyChart();
        }, 250);
    });
}

// ========================================
// 初期化
// ========================================
function init() {
    updateSummaryCards();
    updateTaskTable();
    drawTaskChart();
    drawDailyChart();
    setupPeriodButtons();
    setupResizeHandler();
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);
