const WORK_TIME = 600;
const SWITCH_TIME = 180;
const WARNING_AT = 120;

const teamsDiv = document.getElementById("teams");
const teamInput = document.getElementById("teamName");
const alarm = document.getElementById("alarmSound");
const warning = document.getElementById("warningSound");

const teams = [];

//ENTER KEY SUPPORT
teamInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTeam();
});

function formatTime(s) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function saveToLocalStorage() {
  const teamsData = teams.map((team) => ({
    teamName: team.title,
    currentPlayer: team.curr.value,
    previousPlayer: team.prev.value,
    time: team.time,
    mode: team.mode,
    warned: team.warned,
  }));
  localStorage.setItem("relaythonTeams", JSON.stringify(teamsData));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("relaythonTeams");
  if (saved) {
    try {
      const teamsData = JSON.parse(saved);
      teamsData.forEach((data) => {
        addTeam(data);
      });
    } catch (e) {
      console.error("Failed to load teams from localStorage:", e);
    }
  }
}

// Load teams on page load
window.addEventListener("DOMContentLoaded", loadFromLocalStorage);

function addTeam(savedData = null) {
  const teamName = savedData ? savedData.teamName : teamInput.value.trim();
  if (!teamName) return;

  let time = savedData ? savedData.time : WORK_TIME;
  let mode = savedData ? savedData.mode : "READY";
  let interval = null;
  let warned = savedData ? savedData.warned : false;

  const card = document.createElement("div");

  const modeClassMap = {
    READY: "ready",
    WORK: "working",
    SWITCH: "switching",
    DQ: "dq",
  };

  const modeStatusMap = {
    READY: "READY",
    WORK: "WORKING",
    SWITCH: "SWITCHING",
    DQ: "DISQUALIFIED",
  };

  function applyModeStyles() {
    const className = modeClassMap[mode] || "ready";
    card.className = `team-card ${className}`;
    status.innerText = modeStatusMap[mode] || mode;
  }

  function highlightCard() {
    card.classList.add("alert");
    setTimeout(() => card.classList.remove("alert"), 2000);
  }

  const del = document.createElement("div");
  del.className = "delete-btn";
  del.innerText = "❌";
  del.onclick = () => {
    clearInterval(interval);
    card.remove();
    teams.splice(teams.indexOf(teamObj), 1);
    saveToLocalStorage();
  };

  const title = document.createElement("h3");
  title.innerText = teamName;

  const status = document.createElement("div");
  status.innerText = mode;

  //PREVIOUS PLAYER LABEL + INPUT
  const prevLabel = document.createElement("div");
  prevLabel.className = "player-label";
  prevLabel.innerText = "PREV PLAYER:";

  const prev = document.createElement("input");
  prev.className = "player-input";
  prev.disabled = true;
  if (savedData) prev.value = savedData.previousPlayer;

  //CURRENT PLAYER LABEL + INPUT
  const currLabel = document.createElement("div");
  currLabel.className = "player-label";
  currLabel.innerText = "CURRENT PLAYER:";

  const curr = document.createElement("input");
  curr.className = "player-input";
  curr.placeholder = "Enter name";
  if (savedData) {
    curr.value = savedData.currentPlayer;
    curr.disabled = mode === "WORK";
  }

  const timer = document.createElement("div");
  timer.className = "timer";
  timer.innerText = formatTime(time);

  const start = document.createElement("button");
  start.innerText = "Start";
  start.className = "btn";

  const end = document.createElement("button");
  end.innerText = "End";
  end.className = "btn";

  function run() {
    clearInterval(interval);
    interval = setInterval(() => {
      time--;
      timer.innerText = formatTime(time);

      if (mode === "WORK" && time === WARNING_AT && !warned) {
        for (let i = 0; i < 3; i++) {
          warning.play();
        }
        highlightCard();
        warned = true;
      }

      if (time <= 0) {
        clearInterval(interval);
        mode = "DQ";
        applyModeStyles();
        timer.innerText = "DQ";
        teamObj.mode = mode;
        teamObj.time = 0;
        alarm.play();
        highlightCard();
        start.disabled = end.disabled = true;
        saveToLocalStorage();
      } else {
        teamObj.time = time;
        saveToLocalStorage();
      }
    }, 1000);
  }

  function startWork() {
    if (!curr.value.trim()) return;
    curr.disabled = true;
    mode = "WORK";
    warned = false;
    time = WORK_TIME;
    applyModeStyles();
    teamObj.mode = mode;
    teamObj.time = time;
    teamObj.warned = warned;
    saveToLocalStorage();
    run();
  }

  function startSwitch() {
    mode = "SWITCH";
    time = SWITCH_TIME;
    applyModeStyles();
    teamObj.mode = mode;
    teamObj.time = time;
    saveToLocalStorage();
    run();
  }

  start.onclick = startWork;

  end.onclick = () => {
    clearInterval(interval);
    if (mode === "WORK") {
      startSwitch();
    } else if (mode === "SWITCH") {
      prev.value = curr.value;
      curr.value = "";
      curr.disabled = false;
      saveToLocalStorage();
      startWork();
    }
  };

  const teamObj = {
    startWork,
    curr,
    prev,
    title: teamName,
    time,
    mode,
    warned,
  };
  teams.push(teamObj);

  card.append(
    del,
    title,
    status,
    prevLabel,
    prev,
    currLabel,
    curr,
    timer,
    start,
    end,
  );

  applyModeStyles();
  timer.innerText = formatTime(time);

  teamsDiv.appendChild(card);
  if (!savedData) {
    teamInput.value = "";
    saveToLocalStorage();
  }
}

function startAll() {
  teams.forEach((t) => {
    if (t.curr.value.trim()) t.startWork();
  });
}
