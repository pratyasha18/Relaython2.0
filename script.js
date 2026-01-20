const WORK_TIME = 600;
const SWITCH_TIME = 180;
const WARNING_AT = 120;

const teamsDiv = document.getElementById("teams");
const teamInput = document.getElementById("teamName");
const alarm = document.getElementById("alarmSound");
const warning = document.getElementById("warningSound");

const teams = [];

//ENTER KEY SUPPORT
teamInput.addEventListener("keydown", e => {
    if (e.key === "Enter") addTeam();
});

function formatTime(s){
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}

function addTeam(){
    const teamName = teamInput.value.trim();
    if(!teamName) return;

    let time = WORK_TIME;
    let mode = "READY";
    let interval = null;
    let warned = false;

    const card = document.createElement("div");

    function highlightCard(){
        card.classList.add("alert");
        setTimeout(() => card.classList.remove("alert"), 2000);
    }


    card.className = "team-card ready";

    const del = document.createElement("div");
    del.className = "delete-btn";
    del.innerText = "❌";
    del.onclick = () => {
        clearInterval(interval);
        card.remove();
        teams.splice(teams.indexOf(teamObj), 1);
    };

    const title = document.createElement("h3");
    title.innerText = teamName;

    const status = document.createElement("div");
    status.innerText = "READY";

    //PREVIOUS PLAYER LABEL + INPUT
    const prevLabel = document.createElement("div");
    prevLabel.className = "player-label";
    prevLabel.innerText = "PREV PLAYER:";

    const prev = document.createElement("input");
    prev.className = "player-input";
    prev.disabled = true;

    //CURRENT PLAYER LABEL + INPUT
    const currLabel = document.createElement("div");
    currLabel.className = "player-label";
    currLabel.innerText = "CURRENT PLAYER:";

    const curr = document.createElement("input");
    curr.className = "player-input";
    curr.placeholder = "Enter name";

    const timer = document.createElement("div");
    timer.className = "timer";
    timer.innerText = formatTime(time);

    const start = document.createElement("button");
    start.innerText = "Start";
    start.className = "btn";

    const end = document.createElement("button");
    end.innerText = "End";
    end.className = "btn";

    function run(){
        clearInterval(interval);
        interval = setInterval(() => {
            time--;
            timer.innerText = formatTime(time);

            if(mode === "WORK" && time === WARNING_AT && !warned){
                for(let i = 0; i < 3; i++){
                    warning.play();
                }
                highlightCard();
                warned = true;
            }

            if(time <= 0){
                clearInterval(interval);
                card.className = "team-card dq";
                status.innerText = "DISQUALIFIED";
                timer.innerText = "DQ";
                alarm.play();
                highlightCard();
                start.disabled = end.disabled = true;
            }
        }, 1000);
    }

    function startWork(){
        if(!curr.value.trim()) return;
        curr.disabled = true;
        mode = "WORK";
        warned = false;
        time = WORK_TIME;
        status.innerText = "WORKING";
        card.className = "team-card working";
        run();
    }

    function startSwitch(){
        mode = "SWITCH";
        time = SWITCH_TIME;
        status.innerText = "SWITCHING";
        card.className = "team-card switching";
        run();
    }

    start.onclick = startWork;

    end.onclick = () => {
        clearInterval(interval);
        if(mode === "WORK"){
            startSwitch();
        }
        else if(mode === "SWITCH"){
            prev.value = curr.value;
            curr.value = "";
            curr.disabled = false;
            startWork();
        }
    };

    const teamObj = { startWork, curr };
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
        end
    );

    teamsDiv.appendChild(card);
    teamInput.value = "";
}

function startAll(){
    teams.forEach(t => {
        if(t.curr.value.trim()) t.startWork();
    });
}