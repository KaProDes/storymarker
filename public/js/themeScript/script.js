let themeCss = document.querySelector("#theme_select");
const setTheme = (mode)=>{
    if(mode==="light"){
        themeCss.href = "./themes/style.css";
    }
    else if(mode==="dark"){
        themeCss.href = "./themes/dark.css";
    }
    else if(mode==="azul"){
        themeCss.href = "./themes/azul.css";
    }
    else if(mode==="purpura"){
        themeCss.href = "./themes/purpura.css";
    }
    else if(mode==="rosa"){
        themeCss.href = "./themes/rosa.css";
    }
    localStorage.setItem('theme',mode);
}

let theme = localStorage.getItem("theme");

if(theme == null){
    setTheme('light')
}
else{
    setTheme(theme);
}



document.querySelectorAll(".theme_dot").forEach((d)=>{
    d.addEventListener("click",(e)=>{
        e.preventDefault();
        setTheme(d.id);
    })
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function grow(){
    let i = 0;
    document.querySelector(".flow").setAttribute("width",`${i}%`);
    while(i<100){
        i++;
        document.querySelector(".flow").style.width = `${i}%`;
        await sleep(100);
    }
    return;
}


document.querySelectorAll(".browser_dot").forEach((bd)=>{
    bd.addEventListener("click",(e)=>{
        e.preventDefault();
        if(bd.id === "one"){
            document.querySelector(".flow").style.backgroundColor = "#f75d59";
            grow();
        }
        else if(bd.id === "two"){
            document.querySelector(".flow").style.backgroundColor = "#f7b742";
            grow();
        }
        else if(bd.id === "three"){
            document.querySelector(".flow").style.backgroundColor = "#00c44c"
            grow();
        }
    })
})

var inputs = document.querySelectorAll(['input','textarea']);
 
const resetForm = () => {
    inputs.forEach(input =>  input.value = '');
    inputs[inputs.length-1].value = "Send"
}

function requestFullScreen() {
        var el = document.documentElement
        , rfs = // for newer Webkit and Firefox
            el.requestFullscreen
            || el.webkitRequestFullScreen
            || el.mozRequestFullScreen
            || el.msRequestFullscreen
    ;
    if(typeof rfs!="undefined" && rfs){
    rfs.call(el);
    } else if(typeof window.ActiveXObject!="undefined"){
    // for Internet Explorer
    var wscript = new ActiveXObject("WScript.Shell");
    if (wscript!=null) {
        wscript.SendKeys("{F11}");
    }
    }
}

function exitFullscreen() {
    var el = document;
    var requestMethod = el.cancelFullScreen||el.webkitCancelFullScreen||el.mozCancelFullScreen||el.exitFullscreen||el.webkitExitFullscreen;
    if (requestMethod) { // cancel full screen.
        requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

var elem = document.body; // Make the body go full screen.
document.querySelector("#three").addEventListener("click",requestFullScreen)
document.querySelector("#one").addEventListener("click",exitFullscreen)
