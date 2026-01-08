const startbtn = document.getElementById('start');
const sendphonebtn = document.getElementById('sendphone');
const checkcodebtn = document.getElementById('checkcode');
const choisedaybtn = document.getElementById('choiseday');
const senddatabtn = document.getElementById('senddata');
const backbtns = document.querySelectorAll('.back');
const days = document.querySelectorAll('.day-box')

startbtn.addEventListener('click', startReservation);
sendphonebtn.addEventListener('click', validatePhone);
checkcodebtn.addEventListener('click', checkCode);
choisedaybtn.addEventListener('click', confirmDay);
senddatabtn.addEventListener('click', finalStep);
backbtns.forEach(btn => {btn.addEventListener('click', back)});
days.forEach(d => d.addEventListener('click', function(){selectDay(this, d.id)}))

let current = "welcome";
let selectedDay = null;
let finalCodeValue = "";

function back() {
    if(current === 'welcome') return
    const steps = ['welcome', 'phone', 'verify', 'day', 'group']
    let index = steps.indexOf(current)
    document.getElementById(current).classList.remove("active");
    current = steps[index - 1];
    document.getElementById(current).classList.add("active");
}

function typeText(el,text,interval=40){
    el.innerHTML="";
    let i=0;
    (function t(){
        if(i<text.length){
            el.innerHTML+=text[i++];
            setTimeout(t,interval);
        }
    })();
}

function startReservation(){
    document.getElementById(current).classList.remove("active");
    document.getElementById("phone").classList.add("active");
    current="phone";
    typeText(document.getElementById("messagePhone"),"لطفاً شماره تماس خود را وارد کنید.");
}

function toEnglishDigits(str){
    const persian = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    const english = ['0','1','2','3','4','5','6','7','8','9'];
    return str.replace(/[۰-۹]/g,function(w){ return english[persian.indexOf(w)]; });
}

function validatePhone(){
    let phone = toEnglishDigits(document.getElementById("phoneInput").value.trim());
    if(phone.startsWith("0")) phone = phone.slice(1);
    if(/^9\d{9}$/.test(phone)){

        fetch('/send_code/', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie('csrftoken')
        },
        body: JSON.stringify({ phone: phone })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.code)
            nextStep('verify', "کد تایید برای شماره شما ارسال شد.");
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        alert("شماره تماس معتبر نیست. لطفاً شماره ایران وارد کنید.");
    }

    
}

function getCookie(name) {
    let cookieValue = null;
    if(document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for(let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if(cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function checkCode(){
    let code = toEnglishDigits(document.getElementById("codeInput").value.trim());

    fetch('/verify_code/', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie('csrftoken')
        },
        body: JSON.stringify({ code: code })
    })

    .then(response => response.json())
    .then(data => {
        if(data.success){
            fetch('/check_phone/', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie('csrftoken')
                }
            })

            .then(response => response.json())
            .then(data => {
                if(data.exist) {
                    skip()
                }
                else {
                    nextStep("day");
                    typeText(document.getElementById("messageDay"),"روز حضور خود را انتخاب نمایید.");
                    loadDaysStatus()
                }
            })
        }
        else {
            alert("کد وارد شده اشتباه است.");
        }
    })

        .catch(error => {
        console.error('Error:', error);
    });
}

function nextStep(step,msg){
    document.getElementById(current).classList.remove("active");
    document.getElementById(step).classList.add("active");
    current=step;
    if(msg) typeText(document.getElementById("messageVerify"),msg);
}

function loadDaysStatus() {
    
    fetch('/get_days_status/')
    .then(response => response.json())
    .then(data => {
        const daysMap = {}
        document.querySelectorAll('.day-box').forEach(el => {daysMap[el.id] = el})

        for(const [day, info] of Object.entries(data)) {
            const el = daysMap[day]
            if(!el) continue;
            const status = info.status
            if(status === 'able') {
                el.style.backgroundColor = ''
                el.style.opacity = '1'
                el.style.pointerEvents = 'auto'
            }

            else if(status === 'complited') {
                el.style.backgroundColor = '#d4af37'
                el.style.opacity = '0.2'
                el.style.pointerEvents = 'none'
                el.style.color = 'black'
                el.innerHTML += '     (ظرفیت تکمیل)'
            }
            
            else if(status === 'unable') {
                el.style.backgroundColor = '#d4af37'
                el.style.opacity = '0.2'
                el.style.pointerEvents = 'none'
                el.style.color = 'black'
                el.innerHTML += '     (غیر فعال)'
            }
            
            else {
                el.style.backgroundColor = '#d4af37'
                el.style.opacity = '0.2'
                el.style.pointerEvents = 'none'
                el.style.color = 'black'
                el.innerHTML += 'error'
            }
        }
    })

    .catch(error => console.error('Error loading days status:', error))

}

function selectDay(el,val){
    document.querySelectorAll(".day-box").forEach(d=>d.classList.remove("active"));
    el.classList.add("active");
    selectedDay=val;
    fetch('/give_day/', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie('csrftoken')
        },
        body: JSON.stringify({ day: selectedDay })
    })
    .then(response => response.json())
    .then(data => console.log('Day saved:', data))
    .catch(error => console.error('Error saving day:', error));
}

function confirmDay(){
    if(!selectedDay){ alert("یک روز انتخاب کنید"); return; }
    document.getElementById(current).classList.remove("active");
    document.getElementById("group").classList.add("active");
    current="group";
    typeText(document.getElementById("messageGroup"),"اطلاعات گروه را تکمیل کنید.");
}

function checkMax(el){
    if(Number(el.value)>5) {
        el.value=5;
        alert("حد اکثر تعداد قابل رزرو 5 نفر\nبرای رزرو بیشتر تماس بگیرید")
    }
    if(Number(el.value)<0) {
        el.value=0;
    }
}

function finalStep(){
    const leader = document.getElementById("leaderName").value.trim();
    const male = document.getElementById("maleCount").value.trim();
    const female = document.getElementById("femaleCount").value.trim();

    if(!leader || !male || !female){
        alert("لطفاً همه فیلدها را تکمیل کنید.");
        return;
    }

    fetch('/save_reserv/', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie('csrftoken')
        },
        body: JSON.stringify({
            leader_name: leader,
            men: male,
            women: female
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.reservation_code) {
            const codeEl = document.getElementById("finalCode");
            codeEl.innerHTML=""; 
            const str = data.reservation_code.toString();
            document.getElementById(current).classList.remove("active");
            document.getElementById("result").classList.add("active");
            current="result";
            let i=0;
            (function t(){
                if(i<str.length){
                    codeEl.innerHTML+=str[i++];
                    setTimeout(t,500);
                }
            })();
        }
    })
    .catch(error => console.error('Error saving day:', error));
}

function skip() {
    fetch('/skip/', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.reservation_code) {
            const codeEl = document.getElementById("finalCode");
            codeEl.innerHTML="";
            const str = data.reservation_code.toString();
            document.getElementById(current).classList.remove("active");
            document.getElementById("result").classList.add("active");
            current="result";
            let i=0;
            document.getElementById("finalMessage").innerHTML = "شما قبلا با این شماره رزرو کرده اید.<br>کد تایید رزرو قبلی شما";

            (function t(){
                if(i<str.length){
                    codeEl.innerHTML+=str[i++];
                    setTimeout(t,500);
                }
            })();
        }
    })
    .catch(error => console.error('Error saving day:', error));
}







document.addEventListener("DOMContentLoaded", function() {
    // همه input-number wrappers
    const numberInputs = document.querySelectorAll('.input-number');

    numberInputs.forEach(wrapper => {
        const input = wrapper.querySelector('input[type="number"]');
        const btnPlus = wrapper.querySelector('.btn-plus');
        const btnMinus = wrapper.querySelector('.btn-minus');

        // دکمه +
        btnPlus.addEventListener('click', () => {
            if(input.max === "") {
                input.stepUp();
            } else {
                let max = parseInt(input.max);
                if(Number(input.value) < max) input.stepUp();
            }
            input.dispatchEvent(new Event('input')); // trigger any listener
        });

        // دکمه -
        btnMinus.addEventListener('click', () => {
            if(input.min === "") {
                input.stepDown();
            } else {
                let min = parseInt(input.min);
                if(Number(input.value) > min) input.stepDown();
            }
            input.dispatchEvent(new Event('input')); // trigger any listener
        });
    });
});
