document.addEventListener('DOMContentLoaded', () => {
    const homePage = document.getElementById('home-page');
    const reportPage = document.getElementById('report-page');
    const reportForm = document.getElementById('lost-found-form');

    // --- التعديل الجديد: التحكم في ظهور وإخفاء خانة مكان التواجد ---
    const typeSelect = document.getElementById('in-type'); // نفس الـ ID بتاعك
    const availGroup = document.getElementById('availability-group'); // الـ ID اللي هيشيل الخانة بالكامل
    const placeGroup = document.getElementById('in-place');
    typeSelect.addEventListener('change', () => {
        const selectedType = typeSelect.value;
        // الخانة تظهر فقط إذا اختار "موجود"
        if (typeSelect.value === 'found') {
            availGroup.style.display = 'block';
        } else {
            availGroup.style.display = 'none';
        }
        // --- 2. التعديل الجديد: إخفاء خانة المكان لو اختار "مستلم" ---
        if (selectedType === 'return') { // فرضنا إن قيمة المستلم في الـ HTML هي received
            placeGroup.style.display = 'none'; // شيل خانة المكان
        } else {
            placeGroup.style.display = 'block'; // تظهر عادي مع مفقود وموجود
        }
    });
    // ========================= تضبيط الناف بار تمام ===============
    
  
    // --------------------------------------------------------

    // التنقل (تأكدي أن الـ Navbar به IDs: nav-home و nav-report)
    const btnHome = document.getElementById('nav-home');
    const btnReport = document.getElementById('nav-report');

    btnHome?.addEventListener('click', (e) => {
        e.preventDefault();
        homePage.style.display = 'block';
        reportPage.style.display = 'none';
    });

    btnReport?.addEventListener('click', (e) => {
        e.preventDefault();
        homePage.style.display = 'none';
        reportPage.style.display = 'block';
    });
     
    
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const type = document.getElementById('in-type').value;
        const name = document.getElementById('in-name').value;
        const place = document.getElementById('in-place').value;
        const availability = document.getElementById('in-availability').value;

        // الشروط الذكية الجديدة للفحص:
        const isAvailabilityRequired = (type === 'found'); // التواجد مطلوب لو "موجود" بس
        const isPlaceRequired = (type !== 'return');       // المكان مطلوب في كل الحالات "إلا" لو مرتجع

        // الفحص الذكي: لو الاسم فاضي، أو المكان مطلوب وفاضي، أو التواجد مطلوب وفاضي
        if (!name || (isPlaceRequired && !place) || (isAvailabilityRequired && !availability)) {
            alert("املء كل الخانات يا زعمان");
            return; // وقف الكود ومتنشرش
        }

        // سطر التواجد يظهر في الكارت فقط لو النوع "موجود"
        let availText = "";
        if (type === 'found') {
            availText = `<p style="margin:0; color:#007bff; font-size:0.9rem;">🏠 التواجد: ${availability}</p>`;
        }

        // سطر المكان يظهر في الكارت فقط لو النوع مش "مرتجع"
        let placeText = "";
        if (type !== 'return') {
            placeText = `<p style="margin:5px 0; font-size:0.9rem;">📍 الموقع: ${place}</p>`;
        }

        const card = `
            <div class="item-card">
                <strong>📦 ${name}</strong>
                ${placeText}
                ${availText}
            </div>
        `;

        let list;
        if (type === 'lost') list = document.getElementById('lost-list');
        else if (type === 'found') list = document.getElementById('found-list');
        else list = document.getElementById('return-list');

        if (list.innerHTML.includes("لا يوجد")) list.innerHTML = '';
        list.innerHTML += card;

        // إظهار النجاح وتصفير الفورم (بدون تغيير حسب طلبك)
        document.getElementById('success-msg').style.display = 'block';
        reportForm.reset();
        availGroup.style.display = 'none'; // نرجعه مخفي تلقائياً بعد التصفير
        placeGroup.style.display = 'block';
        setTimeout(() => { document.getElementById('success-msg').style.display = 'none'; }, 2000);
    });
});




