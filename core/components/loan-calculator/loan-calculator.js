'use strict';
function calculate() {
    var amount = document.getElementById('amount');
    var apr = document.getElementById('apr');
    var years = document.getElementById('years');
    var zipcode = document.getElementById('zipcode');
    var payment = document.getElementById('payment');
    var total = document.getElementById('total');
    var totalinterest = document.getElementById('totalinterest');

    debugger;
    var principal = parseFloat(amount.value);
    var interest = parseFloat(apr.value) / 100 / 12;
    var payments = parseFloat(years.value) * 12;
    var x = Math.pow(1 + principal, payments);
    var monthly = (principal * x * interest) / (x - 1);

    if (isFinite(monthly)) {
        payment.innerHTML = monthly.toFixed(2);
        total.innerHTML = (monthly * payments - principal).toFixed(2);

        //save data
        //reinput data when user back to this page
        save(amount.value, apr.value, years.value, zipcode.value);
        //interception of all errors
        try {
            getLenders(amount.value, apr.value, years.value, zipcode.value);
        } catch (err) {
            //ignore errors
        }

        //display chart
        chart(principal, interest, monthly, payments);
    } else {
        payment.innerHTML = '';
        total.innerHTML = '';
        totalinterest.innerHTML = '';
        chart();
    }
}
function save(amount, apr, years, zipcode) {
    if (window.localStorage) {
        localStorage.loan_amount = amount;
        localStorage.loan_apr = apr;
        localStorage.loan_years = years;
        localStorage.loan_zipcode = zipcode;
    }
}

//restore all data when user returns to the page
window.onload = function() {
    document.getElementById('amount').value = localStorage.loan_amount;
    document.getElementById('apr').value = localStorage.loan_apr;
    document.getElementById('years').value = localStorage.loan_years;
    document.getElementById('zipcode').value = localStorage.loan_zipcode;
};

function getLenders(amount, apr, years, zipcode) {
    if (!window.XMLHttpRequest) return;

    var ad = document.getElementById('lenders');
    if (!ad) return;

    var url =
        'getLEnders.php' +
        '?amt=' +
        encodeURIComponent(amount) +
        '&apr=' +
        encodeURIComponent(apr) +
        '&yrs' +
        encodeURIComponent(years) +
        '&zip' +
        encodeURIComponent(zipcode);

    var req = XMLHttpRequest();
    req.open('get', url);
    req.send(null);

    req.onreadytostatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var res = req.responseText;
            var lenders = JSON.parse(res);
        }
        var list = '';
        for (var i = 0; i < lenders.length; i++) {
            list += `<li><a href=${lenders[i].url}></a>${lenders[i].name}</li>`;
        }

        ad.innerHTML = `<ul>${list}</ul>`;
    };
}

function chart(principal, interest, monthly, payments) {
    var graph = document.getElementById('graph');
    graph.width = graph.width;

    if (arguments.length == 0 || !graph.getContext) return;

    var g = graph.getContext('2d');
    var width = graph.width;
    var height = graph.height;

    function paymentToX(n) {
        return (n * width) / payments;
    }
    function amountToY(a) {
        return height - (a * height) / (monthly * payments * 1.05);
    }

    g.moveTo(paymentToX(0), amountToY(0));

    g.lineTo(
        paymentToX(payments), // В пра­вый верх­ний
        amountToY(monthly * payments)
    );
    g.lineTo(paymentToX(payments), amountToY(0)); // В пра­вый ниж­ний
    g.closePath(); // И об­рат­но в на­ча­ло
    g.fillStyle = '#f88'; // Свет­ло-крас­ный
    g.fill(); // За­лить тре­уголь­ник
    g.font = 'bold 12px sans-serif'; // Оп­ре­де­лить шрифт
    g.fillText('Total Interest Payments', 20, 20); // Вы­вес­ти текст в ле­ген­де
    // Кри­вая на­ко­п­лен­ной сум­мы по­га­ше­ния кре­ди­та не яв­ля­ет­ся ли­ней­ной
    // и вы­вод ее реа­ли­зу­ет­ся не­мно­го слож­нее
    var equity = 0;
    g.beginPath(); // Но­вая фи­гу­ра
    g.moveTo(paymentToX(0), amountToY(0)); // из ле­во­го ниж­не­го уг­ла
    for (var p = 1; p <= payments; p++) {
        // Для ка­ж­до­го пла­те­жа вы­яс­нить до­лю вы­плат по про­цен­там
        var thisMonthsInterest = (principal - equity) * interest;
        equity += monthly - thisMonthsInterest; // Ос­та­ток - по­га­ше­ние кред.
        g.lineTo(paymentToX(p), amountToY(equity)); // Ли­нию до этой точ­ки
    }
    g.lineTo(paymentToX(payments), amountToY(0)); // Ли­нию до оси X
    g.closePath(); // И опять в нач. точ­ку
    g.fillStyle = 'green'; // Зе­ле­ный цвет
    g.fill(); // За­лить обл. под кри­вой
    g.fillText('Total Equity', 20, 35); // Над­пись зе­ле­ным цве­том
    // По­вто­рить цикл, как вы­ше, но на­ри­со­вать гра­фик ос­тат­ка по кре­ди­ту
    var bal = principal;
    g.beginPath();
    g.moveTo(paymentToX(0), amountToY(bal));
    for (var p = 1; p <= payments; p++) {
        var thisMonthsInterest = bal * interest;
        bal -= monthly - thisMonthsInterest; // Ос­та­ток от по­гаш. по кре­ди­ту
        g.lineTo(paymentToX(p), amountToY(bal)); // Ли­нию до этой точ­ки
    }
    g.lineWidth = 3; // Жир­ная ли­ния
    g.stroke(); // На­ри­со­вать кри­вую гра­фи­ка
    g.fillStyle = 'black'; // Чер­ный цвет для тек­ста
    g.fillText('Loan Balance', 20, 50); // Эле­мент ле­ген­ды
    // На­ри­со­вать от­мет­ки лет на оси X
    g.textAlign = 'center'; // Текст ме­ток по цен­тру
    var y = amountToY(0); // Ко­ор­ди­на­та Y на оси X
    for (var year = 1; year * 12 <= payments; year++) {
        // Для ка­ж­до­го го­да
        var x = paymentToX(year * 12); // Вы­чис­лить по­зи­цию мет­ки
        g.fillRect(x - 0.5, y - 3, 1, 3); // На­ри­со­вать мет­ку
        if (year == 1) g.fillText('Year', x, y - 5); // Под­пи­сать ось
        if (year % 5 == 0 && year * 12 !== payments)
            // Чис­ла че­рез ка­ж­дые 5 лет
            g.fillText(String(year), x, y - 5);
    }
    // Сум­мы пла­те­жей у пра­вой гра­ни­цы
    g.textAlign = 'right'; // Текст по пра­во­му краю
    g.textBaseline = 'middle'; // Цен­три­ро­вать по вер­ти­ка­ли
    var ticks = [monthly * payments, principal]; // Вы­вес­ти две сум­мы
    var rightEdge = paymentToX(payments); // Ко­ор­ди­на­та X на оси Y
    for (var i = 0; i < ticks.length; i++) {
        // Для ка­ж­дой из 2 сумм
        var y = amountToY(ticks[i]); // Оп­ре­де­лить ко­ор­ди­на­ту Y
        g.fillRect(rightEdge - 3, y - 0.5, 3, 1); // На­ри­со­вать мет­ку
        g.fillText(
            String(ticks[i].toFixed(0)), // И вы­вес­ти ря­дом сум­му.
            rightEdge - 5,
            y
        );
    }
}
