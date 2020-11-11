$(function () {

    var played = false;
    try {
        var actx = new (AudioContext || webkitAudioContext)(),
            src = `/piggy/sound/piggy_sound4.mp3`,
            audioData, srcNode = null;
    } catch (e) {

    }


    function soundInit() {
        if (played == false) {
            played = true;

            fetch(src, {mode: "cors"}).then(function (resp) {
                return resp.arrayBuffer()
            }).then(decode);

        }

        function decode(buffer) {
            actx.decodeAudioData(buffer, playLoop);
        }

        function playLoop(abuffer) {
            if (!audioData) {
                audioData = abuffer;
            }
            srcNode = actx.createBufferSource();
            srcNode.buffer = abuffer;
            srcNode.connect(actx.destination);
            srcNode.loop = true;
            if (started == true) {
                srcNode.start(0);
            }

        }


    }

    function initMusic() {
        if (Core.load('sound') == true) {
            soundInit();
        }

    }
    var cloudLevelMax = 12,
        bonus = 1,
        bonusCount = 0,
        wallet = 0,
        cashPerClick = 0.1,
        xp = 0,
        cloudLevel = 0,
        sad = true,
        started = false,
        clicked = false;


    setInterval(function () {
        if (cloudLevel > cloudLevelMax) {
            window.location = '/piggy/stop.html';
            return;
        }
        myTimer()
    }, 1000);


    $("#onoff").on('click', function () {
        if (Core.load('sound') == true) {
            Core.save('sound', false)
            $("#onoff").attr('class', 'soundOff');
        } else {
            Core.save('sound', true)
            initMusic();
            $("#onoff").attr('class', 'soundOn');
        }
    });

    $(window).keyup(function (e) {
        if (e.keyCode == 0 || e.keyCode == 32) {
            $("#swin").click();


        }
    });

    $("#swin").on('click', function () {
        if (started == false) {
            started = true;
        }

        if (Core.load('sound') == true) {
            initMusic();
        }


        if (isNaN(wallet)) {
            saveUs();
        }
        if (cloudLevel > cloudLevelMax) {
            window.location = '/piggy/stop.html';
            return;
        }
        wallet = wallet + cashPerClick * bonus;
        if (sad == true) {
            updateBackground();
        }
        sad = false;
        clicked = true;
        xp = xp + bonus;
        updateOutput();
    });


    $("#updaCash").on("click", function () {
        if (wallet < costOfCashUpgrade()) {
            return;
        }
        wallet = wallet - costOfCashUpgrade();
        cashPerClick = getCashUpgrade();
        xp = xp + costOfCashUpgrade();

        if (Core.load('sound') == true) {
            let audio = new Audio("/piggy/sound/click.mp3");
            audio.play();
        }
        updateOutput();
    });


    $("#updaCloud").on("click", function () {
        if (cloudLevel > cloudLevelMax) {
            window.location = '/piggy/stop.html';
            return;
        }
        if (wallet < costOfCloudUpgrade()) {
            return;
        }
        if (cloudLevel > cloudLevelMax) {
            window.location = '/piggy/stop.html';
            return;
        }

        if (Core.load('sound') == true) {
            let audio = new Audio("/piggy/sound/click.mp3");
            audio.play();
        }


        wallet = wallet - costOfCloudUpgrade();
        cloudLevel = cloudLevel + 1;
        xp = xp + costOfCloudUpgrade();
        updateBackground();
        sad = false;
        updateOutput();
    });



    if(!Core.load('isInstall')){
        Core.save('isInstall', 1);
        saveUs();
        save();
    }


    function myTimer() {
        if (clicked == false) {
            if (played) {
                srcNode.stop();
                played = false;
            }
        }


        if (sad == false) {
            if (clicked == false) {
                $("#content").css({
                    "background-image" : "url('/piggy/assets/images/sad.jpg')"
                });
                //document.body.style.backgroundImage = "url('/piggy/assets/images/sad.jpg')";
                sad = true;
                bonus = 1;
                bonusCount = 0;
                updateOutput();
            }
        }
        if (clicked) {
            bonusCount = bonusCount + .06;
        }
        if (bonusCount > bonus) {
            bonus = bonus + 1;
            bonusCount = 0;
            updateOutput();
        }

        clicked = false;

    }

    function updateOutput() {
        $("#xplabel").html("Level " + cloudLevel);
        $("#walletDisp").html("$" + dispNumb(wallet))

        $("#updaCash_text").text("Upgrade $" + (dispNumb(getCashUpgrade())) + " for $" + dispNumb(costOfCashUpgrade()) + "");
        $("#updaCloud_text").html("Flexing $" + dispNumb(costOfCloudUpgrade()));


        if (clicked == true) {
            $("#balance").html(`Bonus: x ${bonus}`)
            $("#mir").html(`Bonus: x ${bonus}`)

        } else {
            $("#mir").html(`Rain those $$$`)
        }
        if (wallet >= costOfCashUpgrade()) {
            $("#updaCash").addClass("green");
            $("#updaCash").removeClass("red");
        } else {
            $("#updaCash").addClass("red");
            $("#updaCash").removeClass("green");
        }
        if (wallet >= costOfCloudUpgrade()) {
            $("#updaCloud").addClass("green");
            $("#updaCloud").removeClass("red");
        } else {
            $("#updaCloud").addClass("red");
            $("#updaCloud").removeClass("green");
        }
        save();
    }

    function getCashUpgrade() {
        var numb = cashPerClick;
        if (numb < 10) {
            return numb + 1;
        }
        var first = String(numb).charAt(0);
        if (first == "1") {
            first = "2";
        } else if (first == "2") {
            first = "5";
        } else if (first == "5") {
            first = "10";
        }

        var rest = String(numb).substring(1, String(numb).length);
        return parseInt(first + "" + rest);
    }

    function dispNumb(number) {
        var long = String(number).length,
            temp = 0,
            ending = "hi";
        if (long < 4) {
            return number;
        }
        if (long < 7) {
            temp = Math.round(number / 10) / 100;
            ending = "K";
        } else if (long < 10) {
            temp = Math.round(number / 10000) / 100;
            ending = "M";
        } else if (long < 13) {
            temp = Math.round(number / 10000000) / 100;
            ending = "B";
        } else if (long < 16) {
            temp = Math.round(number / 10000000000) / 100;
            ending = "T";
        } else if (long >= 16) {
            temp = Math.round(number / 10000000000000) / 100;
            ending = "q";
        }
        temp = parseFloat(temp).toFixed(2);
        return temp + " " + ending;
    }


    function costOfCashUpgrade() {
        return Math.round(2 * Math.round(5 * cashPerClick * Math.log(cashPerClick) * Math.log(cashPerClick))) + 1;
    }


    function updateBackground() {
        $("#content").css({
            backgroundImage: "url('/piggy/assets/images/piggy" + cloudLevel + ".gif')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat"

        })
    }

    function costOfCloudUpgrade() {
        return Math.round(2 * Math.pow(1 + cloudLevel, cloudLevel + 2));
    }

    function save() {
        Core.save('wallet', wallet);
        Core.save('cashPerClick', cashPerClick);
        Core.save('xp', xp);
        Core.save('cloudLevel', cloudLevel);
    }

    function load() {
        wallet = Core.load('wallet');
        cashPerClick = Core.load('cashPerClick');
        xp = Core.load('xp');
        cloudLevel = Core.load('cloudLevel');

        if (cloudLevel > cloudLevelMax) {
            window.location = 'stop.html';
            return;
        }

    }

    function becomeOneWithWorld() {
        var walB = 0,
            cpcB = 0,
            xpB = 0,
            clB = 0;

        walB = Core.load('wallet');
        cpcB = Core.load('cashPerClick');
        clB = Core.load('cloudLevel');
        xpB = Core.load('xp');


        setTimeout(function () {
            if (xp > xpB) {
                Core.save('wallet', wallet);
                Core.save('cashPerClick', cashPerClick)
                Core.save('xp', xp)
                Core.save('cloudLevel', cloudLevel)

            } else {
                Core.save('wallet', walB);
                Core.save('cashPerClick', cpcB);
                Core.save('xp', xpB);
                Core.save('cloudLevel', clB);

            }
            load();
        }, 100);


    }

    function saveUs() {
        wallet = 0;
        cashPerClick = 1;
        xp = 1;
        cloudLevel = 1;
    }


    function doInit() {
        load();
        becomeOneWithWorld();
    }


    if (Core.load('sound') == true) {
        $("#onoff").attr('class', 'soundOn');
    } else {
        $("#onoff").attr('class', 'soundOff');
    }

    doInit();
    var cursorOffset = {
        left : -30
        , top  : -20
    }




})