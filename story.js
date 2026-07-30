// 使用者故事資料：圖片、章節標題、單句敘述（救出狗狗）
const scenes = [
  {
    img: "1.png",
    chapter: "第一章 · 發現藏身處",
    text: "跟著警探一路找，終於找到可愛的狗狗——糟糕，牠被鎖在魔法箱裡了！",
  },
  {
    img: "2.png",
    chapter: "第二章 · 記住密碼",
    text: "魔法箱開口說：「記好順序囉！密碼是——左、右、右、左！」",
  },
  {
    img: "3.png",
    chapter: "第三章 · 一起解鎖",
    text: "換你上場！照著記憶把四個空格填好：左、右、右、左。\n（把螢幕往左或往右轉，就能輸入方向喔！）",
  },
  {
    img: "4.png",
    chapter: "第四章 · 成功救援",
    text: "叮！箱子打開了，狗狗蹦出來撲進你懷裡——記憶與復健，一次成功！",
  },
];

let index = 0;

const imgEl = document.getElementById("storyImg");
const chapterEl = document.getElementById("storyChapter");
const textEl = document.getElementById("storyText");
const pageNowEl = document.getElementById("pageNow");
const dotsEl = document.getElementById("storyDots");
const cardEl = document.querySelector(".story-card");

// 第三頁互動遊戲元素
const GAME_INDEX = 2; // 第三張（0-based）
const gameEl = document.getElementById("storyGame");
const slotsEl = document.getElementById("gameSlots");
const resultEl = document.getElementById("gameResult");
const hintEl = document.getElementById("gameHint");
const arrowLeftEl = document.getElementById("arrowLeft");
const arrowRightEl = document.getElementById("arrowRight");
const imgWrapEl = document.querySelector(".story-imgwrap");
const answer = ["左", "右", "右", "左"];
let filled = [];

// 建立進度點
scenes.forEach((_, i) => {
  const dot = document.createElement("button");
  dot.className = "story-dot";
  dot.setAttribute("aria-label", `第 ${i + 1} 張`);
  dot.addEventListener("click", () => goTo(i));
  dotsEl.appendChild(dot);
});

// ==== 把畫面往左/右掰 → 輸入方向 ====
function renderSlots() {
  [...slotsEl.children].forEach((slot, i) => {
    slot.textContent = filled[i] || "";
    slot.classList.toggle("done", Boolean(filled[i]));
  });
}

function checkGame() {
  if (filled.length < answer.length) return;
  const ok = filled.every((v, i) => v === answer[i]);
  if (ok) {
    resultEl.textContent = "🎉 密碼正確！魔法箱打開了！";
    resultEl.className = "game-result success";
    hintEl.textContent = "太棒了，往下一頁看看狗狗！";
    document.getElementById("nextBtn").disabled = false;
  } else {
    resultEl.textContent = "❌ 順序不對，密碼是：左 右 右 左";
    resultEl.className = "game-result fail";
    setTimeout(() => {
      filled = [];
      renderSlots();
      resultEl.textContent = "";
      resultEl.className = "game-result";
    }, 1200);
  }
}

// 輸入一個方向，並播放「扳把」回饋
function inputDir(dir) {
  if (filled.length >= answer.length) return;
  filled.push(dir);
  renderSlots();
  // 對應箭頭閃一下
  const arrow = dir === "左" ? arrowLeftEl : arrowRightEl;
  arrow.classList.add("flash");
  setTimeout(() => arrow.classList.remove("flash"), 350);
  checkGame();
}

function resetGame() {
  filled = [];
  renderSlots();
  resultEl.textContent = "";
  resultEl.className = "game-result";
  hintEl.textContent = "把畫面往左或往右轉，輸入密碼";
  // 尚未解鎖前，鎖住「下一頁」
  document.getElementById("nextBtn").disabled = true;
}

// ---- 拖曳偵測（滑鼠 + 觸控）----
let dragging = false;
let startX = 0;
let curDX = 0;
const THRESHOLD = 70; // 掰超過這距離才算數

function dragStart(clientX) {
  if (index !== GAME_INDEX) return;
  if (filled.length >= answer.length) return;
  dragging = true;
  startX = clientX;
  curDX = 0;
  imgWrapEl.classList.remove("springback");
  imgWrapEl.classList.add("grabbing");
}

function dragMove(clientX) {
  if (!dragging) return;
  curDX = clientX - startX;
  // 卡片跟著傾斜，最多 ±16 度
  const angle = Math.max(-16, Math.min(16, curDX / 12));
  imgWrapEl.style.transform = `perspective(900px) rotateY(${angle}deg) translateX(${curDX / 6}px)`;
  // 方向提示高亮
  arrowLeftEl.classList.toggle("active", curDX < -20);
  arrowRightEl.classList.toggle("active", curDX > 20);
}

function dragEnd() {
  if (!dragging) return;
  dragging = false;
  imgWrapEl.classList.remove("grabbing");
  arrowLeftEl.classList.remove("active");
  arrowRightEl.classList.remove("active");
  // 判斷方向
  if (curDX <= -THRESHOLD) inputDir("左");
  else if (curDX >= THRESHOLD) inputDir("右");
  // 回彈
  imgWrapEl.classList.add("springback");
  imgWrapEl.style.transform = "";
  setTimeout(() => imgWrapEl.classList.remove("springback"), 400);
}

// 滑鼠
imgWrapEl.addEventListener("mousedown", (e) => { e.preventDefault(); dragStart(e.clientX); });
window.addEventListener("mousemove", (e) => dragMove(e.clientX));
window.addEventListener("mouseup", dragEnd);
// 禁止圖片原生拖曳（否則會啟動 drag ghost，導致 mousemove 失效）
imgEl.setAttribute("draggable", "false");
imgEl.addEventListener("dragstart", (e) => e.preventDefault());
// 觸控
imgWrapEl.addEventListener("touchstart", (e) => dragStart(e.touches[0].clientX), { passive: true });
imgWrapEl.addEventListener("touchmove", (e) => dragMove(e.touches[0].clientX), { passive: true });
imgWrapEl.addEventListener("touchend", dragEnd);
// 鍵盤輔助：在遊戲頁用左右鍵也能輸入
function gameKeyInput(e) {
  if (index !== GAME_INDEX) return false;
  if (e.key === "ArrowLeft") { inputDir("左"); return true; }
  if (e.key === "ArrowRight") { inputDir("右"); return true; }
  return false;
}

function render() {
  const scene = scenes[index];
  imgEl.src = scene.img;
  imgEl.alt = scene.chapter;
  chapterEl.textContent = scene.chapter;
  textEl.textContent = scene.text;
  pageNowEl.textContent = index + 1;

  // 第三頁顯示互動遊戲
  const isGame = index === GAME_INDEX;
  gameEl.hidden = !isGame;
  if (isGame) resetGame();

  // 更新進度點
  [...dotsEl.children].forEach((d, i) =>
    d.classList.toggle("active", i === index)
  );

  // 淡入動畫
  cardEl.classList.remove("fade");
  void cardEl.offsetWidth; // reflow 重觸發動畫
  cardEl.classList.add("fade");

  // 邊界按鈕狀態
  document.getElementById("prevBtn").disabled = index === 0;
  // 遊戲頁要先解鎖魔法箱才能往下一頁；其餘頁只受邊界限制
  const unlockedGame = isGame && filled.length === answer.length &&
    filled.every((v, i) => v === answer[i]);
  document.getElementById("nextBtn").disabled =
    index === scenes.length - 1 || (isGame && !unlockedGame);
}

function goTo(i) {
  index = Math.max(0, Math.min(scenes.length - 1, i));
  render();
}
const prev = () => goTo(index - 1);
const next = () => goTo(index + 1);

document.getElementById("prevBtn").addEventListener("click", prev);
document.getElementById("nextBtn").addEventListener("click", next);

// 鍵盤左右鍵：遊戲頁用來輸入方向，其他頁用來翻頁
document.addEventListener("keydown", (e) => {
  if (gameKeyInput(e)) return;
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
});

render();
