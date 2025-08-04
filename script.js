

const iconRoom = `<img src="hotel.png" class="icon" alt="Room">`;
const iconNextClean = `<img src="calendar.png" class="icon" alt="Next Clean">`;
const iconSoap = `<img src="air-conditioning.png" class="icon" alt="Soap">`;
const iconAir = `<img src="air-conditioner.png" class="icon" alt="Air Filter">`;

// ✅ flag ว่าผู้ใช้กด OK มาแล้ว
let userConfirmedOnce = false;
let isSearching = false;
let isSpecialRoom = false;  

document.addEventListener("DOMContentLoaded", () => {
    const modalOkBtn = document.getElementById("modalOkBtn");
    const container = document.querySelector(".container");
    const modal = document.getElementById("myModal");
    const roomInput = document.getElementById("roomNumber");

    // ฟังก์ชันเมื่อกดปุ่ม OK
    modalOkBtn.addEventListener("click", () => {
        closeModal();
        userConfirmedOnce = true;

        container.classList.remove("shrink", "expand");
        void container.offsetWidth;

        container.classList.add("shrink");
        setTimeout(() => {
            container.classList.remove("shrink");
            void container.offsetWidth;
            container.classList.add("expand");
        }, 300);
    });

    // ปิด modal เมื่อคลิกพื้นที่ว่าง
    document.addEventListener("click", (event) => {
        if (modal.classList.contains("show") && event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        // ปิด modal ด้วย ESC
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeModal();
            return;
        }

        // ปิด modal ด้วย Enter
        if (event.key === "Enter" && modal.classList.contains("show")) {
            closeModal();
            return;
        }

        // Submit ห้องเมื่อกด Enter และ modal ยังไม่เปิด
        if (event.key === "Enter" && document.activeElement === roomInput && !modal.classList.contains("show")) {
            submitRoom();
            return;
        }
    });

    // เรียกใช้แอนิเมชันเมื่อโหลดหน้า
    container.classList.add('animate-on-load');
});

// ฟังก์ชันแปลงเวลา
function convertToBangkokTime(dateString) {
    if (!dateString || dateString === "No schedule available") {
        return "N/A";
    }
    return dateString.replace(/(\d{2})(\d{2})(\d{2})/, "$1/$2/20$3");
}

// ฟังก์ชันแสดง modal
function showModal(message) {
    document.getElementById("modalMessage").innerHTML = message;
    let modal = document.getElementById("myModal");
    modal.style.display = "flex";
    setTimeout(() => {
        modal.classList.add("show");
    }, 10);
}

// ฟังก์ชันปิด modal
function closeModal() {
    let modal = document.getElementById("myModal");
    modal.classList.remove("show");
    setTimeout(() => {
        modal.style.display = "none";
        document.getElementById("roomNumber").focus(); // 👈 focus คืน
    }, 300);
}

document.querySelector("form")?.addEventListener("submit", e => e.preventDefault());
// ฟังก์ชันเมื่อเลือกห้องจาก Special Rooms


function selectSpecialRoom(room) {
    // ปิด modal
    closeModal();

    // ใส่ข้อมูลห้องที่เลือกเข้าไปใน input
    document.getElementById('roomNumber').value = room;

    // ตั้งค่า flag ว่าเป็นห้องจาก Special Rooms
    isSpecialRoom = true;

    // เรียกฟังก์ชัน submitRoom เพื่อทำการค้นหาห้อง
    submitRoom();
}

function showSpecialRoomOptions() {
     const specialRooms = [
    "Co Working",
    "People Café",
    "Restaurant",
    "Main kitchen",
    "Game Room",
    "Fitness",
    "Canteen",
    "Kid's Club",
    "HK Office",
    "Eng Office",
    "Receiving Office",
    "Exe. Office",
    "Front Office",
    "HR Office",
    "Garbage Room",
    "LP Office",
    "FB Office",
    "Wine Room",
    "vegetable Room"
];

    let optionsHtml = `
        <h3 style="margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #ddd;">เลือกพื้นที่ที่ต้องการ:</h3>
        <div style="max-height: 400px; overflow-y: auto; padding-right: 10px; margin-bottom: 15px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; padding: 5px;">`;

    specialRooms.forEach(room => {
        optionsHtml += `
            <div style="padding: 5px;">
                <button style="width: 100%; padding: 10px; cursor: pointer; border-radius: 8px; 
                background-color: #f5f5f5; border: 1px solid #ddd; transition: all 0.3s ease;
                font-size: 14px; text-align: left; overflow: hidden; text-overflow: ellipsis;"
                onmouseover="this.style.backgroundColor='#e0e0e0'"
                onmouseout="this.style.backgroundColor='#f5f5f5'"
                onclick="selectSpecialRoom('${room}')">${room}</button>
            </div>`;
    });

    optionsHtml += `
            </div>
        </div>
        <div style="text-align: center; padding-top: 10px;">
            <button style="padding: 8px 20px; cursor: pointer; background-color: #f44336; color: white; 
            border: none; border-radius: 4px;" onclick="closeModal()">ยกเลิก</button>
        </div>`;

    // ปรับขนาด modal ให้เหมาะสม
    const modal = document.getElementById("myModal");
    const modalContent = modal.querySelector(".modal-content");
    
    if (modalContent) {
        modalContent.style.maxWidth = "700px";
        modalContent.style.padding = "20px";
        modalContent.style.borderRadius = "12px";
    }

    showModal(optionsHtml);
fodal(optionsHtml);
}

// เพิ่มฟังก์ชัน searchRoom
function searchRoom(roomNumber) {
    let resultElement = document.getElementById('result');
    let submitBtn = document.getElementById('submitBtn');
    let loadingGif = document.getElementById('loadingGif');
    let container = document.querySelector('.container');

    isSearching = true; // ตั้ง flag

    resultElement.innerText = "Searching...";
    resultElement.style.color = "blue";
    loadingGif.style.display = "block";
    container.classList.add("shrink");

    // เพิ่ม padding animation ถ้าเคยกด OK
    if (userConfirmedOnce) {
        container.classList.remove("padding-anim");
        void container.offsetWidth; // รีเฟรชการแสดงผล
        container.classList.add("padding-anim"); // เพิ่มแอนิเมชัน
        container.classList.remove("expand", "shrink");
        void container.offsetWidth; // รีเฟรชการแสดงผล
    }
    // เพิ่ม padding animation ถ้าเคยกด OK
if (userConfirmedOnce) {
    // ลบ class เก่าเพื่อรีเซ็ตแอนิเมชัน
    container.classList.remove("padding-anim", "expand", "shrink");

    // บังคับรีเฟรชการแสดงผล (trigger reflow)
    void container.offsetWidth;

    // เพิ่มแอนิเมชันใหม่
    container.classList.add("padding-anim");
}

    submitBtn.disabled = true;
    submitBtn.innerText = "Searching...";

    fetch("https://script.google.com/macros/s/AKfycbwd9ZXZZ9smyywYK5FBCJPT9TWAQkCqoZ4PSUOBqLbmdZOsa_lK6yeb5th0ytEWf6DQ/exec?room=" + encodeURIComponent(roomNumber))
        .then(response => response.json())
        .then(data => {
            isSearching = false; // รีเซ็ต flag

            loadingGif.style.display = "none";
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit";

            container.classList.remove("expand", "shrink");
            void container.offsetWidth;
            container.classList.add("shrink");

            // รีเซ็ต userConfirmedOnce หลังจากค้นหาสำเร็จ
            userConfirmedOnce = false;

            if (data.room) {
                let deepCleanDate = convertToBangkokTime(data.deep_clean);
                let filterAirDate = convertToBangkokTime(data.filter_air);
                let nextTimeDate = convertToBangkokTime(data.next_deepclean);
                let nextFilterAirDate = convertToBangkokTime(data.next_filter_air);
                
                resultElement.innerHTML = `
                ${iconRoom} <strong>Room:</strong> ${roomNumber} <br>
                ${iconNextClean} <strong>Next Deep Clean:</strong> ${nextTimeDate} <br>
                ${iconSoap} <strong>Latest Deep Clean:</strong> ${deepCleanDate} <br>
                ${iconNextClean} <strong>Next Air Filter Clean:</strong> ${nextFilterAirDate} <br>
                ${iconAir} <strong>Latest Air Filter Clean:</strong> ${filterAirDate} <br>
                <p style="margin-top: 10px;">
                    <small>
                        <em>🐾 Come meet TaoTao, the super cute cat that everyone falls in love with at first sight. 
                       <a href="https://www.instagram.com/p/DKoBYixSmEb/" style="color: blue; text-decoration: underline; font-weight: bold;"> click</a>
                    TaoTao and you'll see why everyone's so smitten!</em>
                    </small>
                </p>
            `;
                
                resultElement.style.color = "green";
                showModal(resultElement.innerHTML);
            } else if (data.error) {
                resultElement.innerText = data.error;
                resultElement.style.color = "red";
                showModal("❌ " + data.error);
            }
        })
        .catch(() => {
            isSearching = false; // รีเซ็ต flag

            resultElement.innerText = "❌ An error occurred.";
            resultElement.style.color = "red";
            showModal("❌ Please try again.");
            loadingGif.style.display = "none";
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit";

            container.classList.remove("expand", "shrink");
            void container.offsetWidth;
            container.classList.add("shrink");
        });
}

function submitRoom() {
    if (isSearching) return; // ป้องกันการกดซ้ำ

    let roomInput = document.getElementById('roomNumber');

    // บังคับให้ input สูญเสียโฟกัส (ปิด keyboard บนมือถือ)
    roomInput.blur();

    let roomNumber = roomInput.value.trim().toUpperCase();
    let pattern = /^[ABC]\d{3}$/;
    let resultElement = document.getElementById('result');
    let submitBtn = document.getElementById('submitBtn');
    let loadingGif = document.getElementById('loadingGif');
    let container = document.querySelector('.container');

    // ... ส่วนโค้ดที่เหลือเหมือนเดิม



    // container.classList.add("shrink");
    void container.offsetWidth;
    
    // ตรวจสอบว่าเป็น ## หรือไม่ก่อนตรวจสอบ pattern
    if (roomNumber === "##") {
        showSpecialRoomOptions();
        return;
    }
    
    // ถ้าเลือกห้องจาก Special Rooms ข้ามการตรวจสอบรูปแบบ
    if (isSpecialRoom) {
        // รีเซ็ต flag หลังจากการเลือกห้องจาก Special Rooms
        isSpecialRoom = false;
        searchRoom(roomNumber);  // เรียกฟังก์ชัน searchRoom โดยไม่ตรวจสอบรูปแบบ
        return;
    }
    
    if (pattern.test(roomNumber)) {
        isSearching = true; // ✅ ตั้ง flag

        resultElement.innerText = "Searching...";
        resultElement.style.color = "blue";
        loadingGif.style.display = "block";
        container.classList.add("shrink");

        // ✅ เพิ่ม padding animation ถ้าเคยกด OK
        if (userConfirmedOnce) {
            container.classList.remove("padding-anim");
            void container.offsetWidth; // รีเฟรชการแสดงผล
            container.classList.add("padding-anim"); // เพิ่มแอนิเมชัน
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "Searching...";  // 👈 เพิ่มบรรทัดนี้ก่อน fetch

        fetch("https://script.google.com/macros/s/AKfycbwd9ZXZZ9smyywYK5FBCJPT9TWAQkCqoZ4PSUOBqLbmdZOsa_lK6yeb5th0ytEWf6DQ/exec?room=" + encodeURIComponent(roomNumber))
            .then(response => response.json())
            .then(data => {
                isSearching = false; // ✅ รีเซ็ต flag

                loadingGif.style.display = "none";
                submitBtn.disabled = false;
                submitBtn.innerText = "Submit";  // 👈 เพิ่มบรรทัดนี้หลังจาก fetch เสร็จ

                container.classList.remove("expand", "shrink");
                void container.offsetWidth;
                container.classList.add("shrink");

                // รีเซ็ต userConfirmedOnce หลังจากค้นหาสำเร็จ
                userConfirmedOnce = false;

                if (data.room) {
                    let deepCleanDate = convertToBangkokTime(data.deep_clean);
                    let filterAirDate = convertToBangkokTime(data.filter_air);
                    let nextTimeDate = convertToBangkokTime(data.next_deepclean);
                    let nextFilterAirDate = convertToBangkokTime(data.next_filter_air);

                    
                   resultElement.innerHTML = `
                    ${iconRoom} <strong class="result-label">Room:</strong> <span class="result-green">${roomNumber}</span> <br>
                    ${iconNextClean} <strong class="result-label">Next Deep Clean:</strong> <span class="result-orange">${nextTimeDate}</span> <br>
                    ${iconSoap} <strong class="result-label">Latest Deep Clean:</strong> <span class="result-gray">${deepCleanDate}</span> <br>
                    ${iconNextClean} <strong class="result-label">Next Air Filter Clean:</strong> <span class="result-orange">${nextFilterAirDate}</span> <br>
                    ${iconAir} <strong class="result-label">Latest Air Filter Clean:</strong> <span class="result-gray">${filterAirDate}</span> <br>
                    `;


                


                    resultElement.style.color = "green";
                    showModal(resultElement.innerHTML);
                } else if (data.error) {
                    resultElement.innerText = data.error;
                    resultElement.style.color = "red";
                    showModal("❌ " + data.error);
                }
            })
            
            .catch(() => {
                isSearching = false; // ✅ รีเซ็ต flag

                resultElement.innerText = "❌ An error occurred.";
                resultElement.style.color = "red";
                showModal("❌ Please try again.");
                loadingGif.style.display = "none";
                submitBtn.disabled = false;
                submitBtn.innerText = "Submit";  // 👈 เพิ่มบรรทัดนี้หลังจาก fetch เสร็จ

                container.classList.remove("expand", "shrink");
                void container.offsetWidth;
                container.classList.add("shrink");
            });
            
    } else {
        resultElement.innerText = "❌ Invalid format!";
        resultElement.style.color = "red";
        showModal("❌ Invalid room format!");
    }
}
