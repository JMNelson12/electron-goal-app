const remote = require('electron').remote;
const fs = remote.require('fs');

var fileInteract = fileInteraction();

$(function () {
    $('.tb-exit').on('click', () => {
        remote.getCurrentWindow().close();
        window.close();
    });
    $('.tb-min').on('click', () => {
        remote.BrowserWindow.getFocusedWindow().minimize();
    });

    combiner();
    $('.remove').on('click', (e) => {
        var goalContainer = e.target.parentElement.parentElement.nextElementSibling.nextElementSibling.nextElementSibling;
        var editContainer = goalContainer;
        var type = e.target.parentElement.previousElementSibling.children[0].innerHTML;

        // Gets goal type
        var index = type.indexOf('Goals');
        var word = type.substr(0, index - 1);

        for (var i = 0; i < goalContainer.children.length; i++) {
            if (editContainer.children[i].children[0].children[2].style.display !== 'none') {
                var textToRemove = editContainer.children[i].children[1].innerText;
                editContainer.children[i].remove();
                setNumOfGoals(word);
                fileInteract.setGoalAndType(textToRemove, word);
                fileInteract.removeFromFile();
            }
        }
    });

    minimizeEnities();

    setTimeout(() => {
        editText();
    }, 100);
});

function minimizeEnities() {
    $('.min-section').on('click', (e) => {
        e.target.parentElement.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.style.display = 'none';
        e.target.parentElement.parentElement.nextElementSibling.nextElementSibling.style.display = 'none';
        e.target.innerText = '+';
        e.target.style.fontSize = '18px';
        e.target.className = 'plus-btn';
        
        $('.plus-btn').on('click', (e) => {
            e.target.parentElement.parentElement.nextElementSibling.nextElementSibling.nextElementSibling.style.display = 'block';
            e.target.parentElement.parentElement.nextElementSibling.nextElementSibling.style.display = 'block';
            e.target.innerHTML = '&#9866;';
            e.target.className = 'min-section';
            e.target.style.fontSize = '13px';
            minimizeEnities();
        })
    });
}

function editText() {
    $('.edit').on('click', (e) => {
        var editText = e.target.parentElement.nextSibling.nextSibling;
        var editTextVal = editText.innerText;

        // Getting Goal Type
        var editSection = e.target.parentElement.parentElement.parentElement.parentElement.id;
        var cutting = editSection.indexOf('-goal-section');
        editSection = editSection.substr(0, cutting);

        editText.innerHTML = '<input type="text" name="txtEdit" id="txtEdit" >';
        var $txtEdit = $('#txtEdit');
        $txtEdit.val(editTextVal);
        $txtEdit.focus();
        $txtEdit.on('keypress', (e) => {
            if (e.keyCode === 13) {
                e.target.parentElement.innerHTML = e.target.value;
                editTextVal = e.target.value;
                fileInteract.setGoalAndType(editTextVal, editSection);
                fileInteract.editFile();
            }
        });
    })
}

function combiner() {
    const Handlebars = require('handlebars');
    var goalType = {
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly',
        life: 'Lifetime'
    }
    var selectedSection, inputGoal;
    var txtGoal = $('.txtGoal');
    var errorMsg = $('.errorMsg');
    var type, leGoal;

    $.getJSON("./goals.json", (data) => {
        $.each(data, (key, values) => {
            var len = values.length;
            var incLen;
            var i, j;
            for (i = 0; i < len; i++) {
                incLen = values[i].list.length;
                leGoal = values[i].type;
                for (j = 0; j < incLen; j++) {
                    appendGoal(values[i].list[j], leGoal)
                }
            }
        })
    });

    $(document).on('keypress', (e) => {
        if (e.keyCode == 13) {
            if (txtGoal.is(":focus") || $('#selType').is(":focus")) {
                if (txtGoal.val() == '') {
                    errorMsg.text('Please Enter A Goal.');
                } else {
                    errorMsg.text('');
                    selectedSection = $('#selType :selected').text();
                    inputGoal = txtGoal.val();

                    // Append Goal to Correct Place
                    appendGoal(inputGoal, selectedSection);
                    editText();

                    // Write Goal to file
                    fileInteract.setGoalAndType(inputGoal, selectedSection);
                    fileInteract.writeToFile();

                    // Reset Inputs
                    txtGoal.val('');
                    $('#selType option[value="daily"]').attr('selected', 'selected');
                }
            }
        }
    });

    var buildSections = () => {
        const source = document.getElementById("entry-template").innerHTML;
        const template = Handlebars.compile(source);
        var content = $('.content');

        for (key in goalType) {
            var obj = goalType[key];
            var context = {
                numOfGoals: 0,
                title: obj,
                id: obj + "-goal-section"
            };
            var html = template(context);
            content.append(html);
        }
    }

    var appendGoal = (goal, section) => {
        var source = document.getElementById("goal-template").innerHTML;
        var template = Handlebars.compile(source);
        var context = {
            goal: goal
        };
        var html = template(context);
        $('#' + section + '-goal-section .goal-section').append(html);

        setNumOfGoals(section);
        newGoal();
    }

    return buildSections();
}

function fileInteraction() {
    var obj = {};
    var typeOfGoal;
    var goal, section;

    return {
        // Write Goal to file
        writeToFile: () => {
            fs.readFile('./goals.json', (err, data) => {
                if (err) return console.log(err);

                obj = JSON.parse(data);
                obj.Goals[typeOfGoal].list.push(goal);
                content = JSON.stringify(obj);
                fs.writeFile('./goals.json', content, (err) => {
                    if (err) return console.log(err);
                    console.log('Sent');
                })
            });
        },
        // Edit goal in file
        editFile: () => {
            var newArr = [];
            var test = $('#' + section + '-goal-section .my-goal-text').toArray();
            test.map(x => newArr.push(x.innerText));

            fs.readFile('./goals.json', (err, data) => {
                obj = JSON.parse(data);
                var arr = obj.Goals[typeOfGoal].list = newArr;

                obj.Goals[typeOfGoal].list = arr;
                var content = JSON.stringify(obj);
                fs.writeFile('./goals.json', content, (err) => {
                    if (err) return console.log(err);
                    console.log('edited');
                })
            });
        },
        // Remove goal in file
        removeFromFile: () => {
            fs.readFile('./goals.json', (err, data) => {
                obj = JSON.parse(data);
                var arr = obj.Goals[typeOfGoal].list;
                arr.splice(arr.indexOf(goal), 1);
                obj.Goals[typeOfGoal].list = arr;
                var content = JSON.stringify(obj);
                fs.writeFile('./goals.json', content, (err) => {
                    if (err) return console.log(err);
                    console.log('Removed');
                })
            });
        },
        // Set Goal and Type
        setGoalAndType: (input, goalType) => {
            goal = input;
            section = goalType;
            switch (section) {
                case 'Daily':
                    typeOfGoal = 0;
                    break;
                case 'Weekly':
                    typeOfGoal = 1;
                    break;
                case 'Monthly':
                    typeOfGoal = 2;
                    break;
                case 'Yearly':
                    typeOfGoal = 3;
                    break;
                case 'Lifetime':
                    typeOfGoal = 4;
                    break;
            }
        }
    }
}

function newGoal() {
    $('.check').on('click', function () {
        var _this = $(this);
        checkBoxes(_this);
    });
    $('.checkmark').on('click', function () {
        var _this = $(this);
        checkBoxes(_this, 'checkmark');
    });
}

function checkBoxes(that, el) {
    var innards = that[0].parentElement.nextSibling.nextSibling;
    if (el == 'checkmark') {
        that.prev('span').css('display', 'inline');
        innards.style.textDecoration = '';
    } else {
        innards.style.textDecoration = 'line-through';
        that.next('span').css('display', 'inline');
    }
    that.css('display', 'none');
}

function setNumOfGoals(el) {
    var count = $('#' + el + '-goal-section .goal-section').children().length;
    $('#' + el + '-goal-section .numOfGoals span').text(count.toString());
}