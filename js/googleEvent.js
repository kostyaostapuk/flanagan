function showBanner() {
    var answer = confirm("You js developer?");
    if (answer) window.location = "http://learn.javascript.ru";
}

setTimeout(showBanner, 3000);
