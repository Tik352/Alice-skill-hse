// импортируемые модули и файлы для дальнейшей работы навыка
const { Alice, Reply, Stage, Scene, Markup } = require('yandex-dialogs-sdk');

// импортируем необходимые .json файлы с данными
const dialogs = require('./../data/dialogs.json'); // дерево диалогов 
const program_discounts = require('./../data/program_discounts.json');

const getlist = require('./getList');
const fs = require('fs');
// END объявление импортируемых модулей

// Объявление констант
const alice = new Alice();
const alice_stage = new Stage();

let user_info = {
    "campus": "Москва",
    "program": "nan",
    "program_id": 0,
    "chosen_faculties": [
        { "id": 0 },
        { "title": "non title" }
    ]
};

let isForNews = false;

const EXAMS_GRADES = program_discounts.exams.grades;
const EXAM_NAMES = program_discounts.exams.items;

const CAMPUSE_CSHOOSE = "CAMPUSE_CSHOOSE";
const atCampuseChoosing = new Scene(CAMPUSE_CSHOOSE); // сцена, в которую попадает пользователь при выборе кампуса

const EXAM_QUIZ = "EXAM_QUIZ";
const atExamEquiz = new Scene(EXAM_QUIZ);

const PROGRAM_CHOOSE = "PROGRAM_CHOOSE";
const atProgramChoose = new Scene(PROGRAM_CHOOSE);

const FACULTY_CHOOSE = "FACULTY_CHOOSE";
const atFacultyChoose = new Scene(FACULTY_CHOOSE);

const NEWS_CHECK = "NEWS_CHECK";
const atNewsChecking = new Scene(NEWS_CHECK);

const DEADLINES = "DEADLINES";
const atdeadlines = new Scene(DEADLINES);
// END объявление констант

//--------SUPPORT FUNCTIONS----------------------------------------------------

// Возвращает массив программ, имеющихся в выбранном кампусе
function getPrograms(city) {
    let correct = [];
    let index = 0;
    for (let program_index = 0; program_index < program_discounts.programs.length; program_index++) {
        for (let item_index = 0; item_index < program_discounts.programs[program_index].items.length;
            item_index++) {
            if (program_discounts.programs[program_index].items[item_index].campus_title.toLowerCase() === city.toLowerCase()) {
                correct.push((program_discounts.programs[program_index].title).match('[а-яА-Я ]+')[0]);
                // correct += ++index + ". " + (program_discounts.programs[program_index].title).match('[а-яА-Я ]+') +"\n";
                break;
            }
        }
    }
    return correct;
};

function getFaculties(city, from) {
    let correct = [];
    for (let program_index = 0; program_index < program_discounts.programs.length; program_index++) {
        for (let item_index = 0; item_index < program_discounts.programs[program_index].items.length; item_index++) {
            if (program_discounts.programs[program_index].title.toLowerCase().includes(city.toLowerCase()) &&
                program_discounts.programs[program_index].items[item_index].campus_title.toLowerCase() === from.toLowerCase()) {
                correct.push(
                    program_discounts.programs[program_index].items[item_index]
                );
            }
        }
    }
    return correct;
};


function getAllFaculties() {
    let correct = [];
    for (let program_index = 0; program_index < program_discounts.programs.length; program_index++) {
        for (let item_index = 0; item_index < program_discounts.programs[program_index].items.length; item_index++) {
            correct.push(program_discounts.programs[program_index].items[item_index]);
        }
    }
    return correct;
};



let faculties = getAllFaculties();

//--------END SUPPORT FUNCTIONS------------------------------------------------

//---------ALICE DIALOGS--------------------------------------------------

alice_stage.addScene(atCampuseChoosing);
alice_stage.addScene(atExamEquiz);
alice_stage.addScene(atProgramChoose);
alice_stage.addScene(atFacultyChoose);
alice_stage.addScene(atNewsChecking);

alice.use(alice_stage.getMiddleware());


// Базовые реплики Алисы, позволяющие ввести пользователя в диалог. 
alice.command('', ctx => {
    return Reply.text("Вы абитуриент или новости узнать хотите?", {
        buttons: [Markup.button({ title: "Абитуриент", hide: true }),
        Markup.button({ title: "Новости", hide: true })],
        tts: 'Здравствуйте! Вы хотите поступить в лучший вуз страны или узнать новости о вышке?',
    });
});


// В случае позитивного ответа на вопрос, интересует ли пользователя 
// Имеющаяся информация

alice.command(/(Информация о поступлении)|(поступ)|(инф[ау])|(абит[уриенту])/i, ctx => {
    isForNews = false;
    ctx.enter(CAMPUSE_CSHOOSE);
    return Reply.text("У вышки много кампусов, какой именно вас интересует?", {
        tts: 'У в+ышки много к+ампусов.-- как+ой+именно - в+асинтерес+ует?Москва? Питер? Пермь? Нижнийновгород?',
        buttons: [dialogs.campuse.moscow[0], dialogs.campuse.saint_pt[0],
        dialogs.campuse.nizniy_novg[0], dialogs.campuse.perm]
    });
});

alice.command(/Новост[ия]*/i, ctx => {
    isForNews = true;
    ctx.enter(CAMPUSE_CSHOOSE);
    return Reply.text("У вышки много кампусов, какой именно вас интересует?", {
        tts: 'У в+ышки много к+ампусов-- как+ой+именно - в+асинтерес+ует? Москва? Питер? Пермь? Нижний Новгород?',
        buttons: [dialogs.campuse.moscow[0], dialogs.campuse.saint_pt[0],
        dialogs.campuse.nizniy_novg[0], dialogs.campuse.perm]
    });
});

// В случае негативного ответа на вопрос, интересует ли пользователя 
// Имеющаяся информация
alice.command(dialogs.welcome.answer_neg, ctx => {
    return Reply.text(dialogs.welcome.phrase_3, {
        buttons: [
            {
                title: "Перейти на сайт НИУ ВШЭ",
                payload: {},
                url: "https://hse.ru/",
                hide: false
            }
        ],
        end_session: false
    })
});

alice.command(/(уйти)|(пока)|(досвидания)/i, ctx => {
    return Reply.text("Уже уходите? Всего вам доброго!", {
        tts: 'Уже уходите? Всего вам доброго',
        end_session: true
    });
});


// В случае неопределенного ответа 
alice.any(ctx => Reply.text('Не понимаю, чего вы хотите') );


//--------END WELCOMING--------------------------------------------------------

let cities = dialogs.campuse.moscow
    .concat(dialogs.campuse.saint_pt
        .concat(dialogs.campuse.nizniy_novg
            .concat(dialogs.campuse.perm)))
let citybuttons = dialogs.campuse.cities;
var listprograms = [];// список направлений,доступных в кампусе

let countOfProg = 0;//текущее количество программ
let MAX_COUNT = 0;//максимально количество программ
atCampuseChoosing.command(cities, ctx => {
    user_info.campus = ctx.data.request.command;

    if (dialogs.campuse.moscow.includes(ctx.data.request.command))
        user_info.campus = dialogs.campuse.moscow[0];
    if (dialogs.campuse.saint_pt.includes(ctx.data.request.command))
        user_info.campus = dialogs.campuse.saint_pt[0];
    if (dialogs.campuse.nizniy_novg.includes(ctx.data.request.command))
        user_info.campus = dialogs.campuse.nizniy_novg[0];
    if (dialogs.campuse.perm === ctx.data.request.command)
        user_info.campus = dialogs.campuse.perm;

    if (!isForNews) {
        ctx.enter(EXAM_QUIZ);
        return Reply.text(dialogs.do_u_know_exam_res.phrase_1, { buttons: ["Да", "Нет", "Назад"] });
    }
    else {
        listprograms = getPrograms(user_info.campus);//получаем список направлений,доступных в кампусе
        MAX_COUNT = listprograms.length;//считаем какое будет максимально количество программ
        countOfProg = 0;
        let temp = [];//временный массив программ
        for (let i = 0; i < 5 & i < MAX_COUNT; i++) {
            temp.push(listprograms[i])//добавляем программы из списка
            countOfProg++;//считаем кол-во прорамм, которые мы добавили
        }

        for (var i = 0; i < countOfProg; i++) {
            listprograms.shift();
        }

        //создаем список айтемов для карточки
        let items = temp.map(el => ({
            image_id: "1656841/987aad4849a6e123fb01",
            title: el,
            button: {
                text: el,
                payload: el
            },
        }));
        ctx.enter(PROGRAM_CHOOSE);//входим в сцену выбора образовательного направления
        //если количество не выведенных больше 5
        if (countOfProg < MAX_COUNT) {
            return Reply.itemsListCard("Направления", {
                header: "Хорошо, тогда выберите одно из направлений, которые есть в выбранном кампусе ",
                items: items,
                footer: {
                    text: "ещё",
                    button: {
                        text: "ещё",
                        payload: "ещё"
                    }
                },
            });
        }
        else {
            return Reply.itemsListCard("Направления", {
                header: "Хорошо, тогда выберите одно из направлений, которые есть в выбранном кампусе ",
                items: items
            });
        }
        
        return Reply.text(dialogs.choose_program.phrase_1, { buttons: getPrograms(user_info.campus) })
    }

});

atCampuseChoosing.command(/(Назад)|(верни)|(стой)|(наверх)/i, ctx => {
    ctx.leave();
    return Reply.text("Вы абитуриент или новости узнать хотите?", {
        tts: "Здравствуйте! Вы хотите поступить в лучший вуз страны или узнать новости о вышке?",
        buttons: [Markup.button({ title: "Абитуриент", hide: true }),
        Markup.button({ title: "Новости", hide: true })]
    });
});
//ответ на хотите сменить кампус?
atCampuseChoosing.command(/(нет)|(передум)/i, ctx => {
    if (!isForNews) {
        ctx.enter(EXAM_QUIZ);
        return Reply.text("У вас есть результаты ЕГЭ?", { buttons: [{ title: ["Да", "Нет", "назад"], hide: true }] });
    }
    ctx.enter(PROGRAM_CHOOSE);
    return Reply.text(dialogs.choose_program.phrase_1, { buttons: getPrograms(user_info.campus) })
});


atCampuseChoosing.command(/(уйти)|(пока)|(досвидания)|(отвали)|(отстань)|(хватит)/i, ctx => {
    return Reply.text("Уже уходите? Всего вам доброго!", {
        tts: 'Уже уходите? Всего вам доброго',
        end_session: true
    });
});
atCampuseChoosing.any(ctx => {
    return Reply.text('Не слышала о таком городе...')
});


//---------END CAMPUSE SCENE---------------------------------------------


//---------EXAM QUIZ SCENE-----------------------------------------------

atExamEquiz.command(dialogs.do_u_know_exam_res.answer_pos, ctx => {
    return Reply.text("Данная ветвь диалога ещё не проработана")
});

atExamEquiz.command(/(Назад)|(верн[и])|(стой)|(наверх)|(ой)/i, ctx => {
    ctx.enter(CAMPUSE_CSHOOSE);
    return Reply.text("Хотите сменить кампус?", {
        buttons: citybuttons
    });
});


atExamEquiz.command(/(не[ат]*)/i, ctx => {
    listprograms = getPrograms(user_info.campus);//получаем список направлений,доступных в кампусе
    MAX_COUNT = listprograms.length;//считаем какое будет максимально количество программ
    countOfProg = 0;
    let temp = [];//временный массив программ
    for (let i = 0; i < 5 & i < MAX_COUNT; i++) {
        temp.push(listprograms[i])//добавляем программы из списка
        countOfProg++;//считаем кол-во прорамм, которые мы добавили
    }
   
    for (var i = 0; i < countOfProg; i++) {
        listprograms.shift();
    }

    //создаем список айтемов для карточки
    let items = temp.map(el => ({
        image_id: "1656841/987aad4849a6e123fb01",
        title: el,
        button: {
            text: el,
            payload: el
        },
    }));
    ctx.enter(PROGRAM_CHOOSE);//входим в сцену выбора образовательного направления
    //если количество не выведенных больше 5
    if (countOfProg < MAX_COUNT) {
        return Reply.itemsListCard("Направления", {
            header: "Отлично, вот список направлений, выбери любое и я выведу список образовательных программ по нему ",
            items: items,
            footer: {
                text: "ещё",
                button: {
                    text: "ещё",
                    payload: "ещё"
                }
            },
        });
    }
    else {
        return Reply.itemsListCard("Направления", {
            header: "Отлично, вот список направлений, выбери любое и я выведу список образовательных программ по нему ",
            items: items
        });
    }
});


atExamEquiz.command(/(Назад)|(верни)|(стой)|(наверх)(ой)/i, ctx => {
    ctx.leave();
    return Reply.text("Вы абитуриент или новости узнать хотите?", {
        buttons: [Markup.button({ title: "Абитуриент", hide: true }),
        Markup.button({ title: "Новости", hide: true })],
        tts: 'Здравствуйте! Вы абитуриент или хотите узнать новости о вышке?',
    })

})

atExamEquiz.command(/(уйти)|(пока)|(досвидания)/i, ctx => {
    return Reply.text("Уже уходите? Всего вам доброго!", {
        tts: 'Уже уходите? Всего вам доброго',
        end_session: true
    });
});

atExamEquiz.any(ctx => {
    return Reply.text("О чем вы?");
});

//---------END EAXAM QUIZ SCENE-------------------------------------------

//---------PROGRAM CHOOSE SCENE-------------------------------------------

atProgramChoose.command('', ctx => {

    if (getPrograms(user_info.campus).includes(ctx.payload))//если пользователь выбрал направление
    {
        user_info.program = ctx.payload;
        faculties = getFaculties(user_info.program, user_info.campus);
        ctx.enter(FACULTY_CHOOSE);//переходим в сцену выбора образователной программы
        return Reply.text(ctx.payload + "? Хорошо, вот список образовательных программ данном направлении:\n" +
            "Выберите интересующую вас программу обучения и я выведу всю известную о нём информацию", {
                buttons: faculties.map(el => el.title)
            });
    }
    if (ctx.payload == 'ещё' && listprograms.length <= 0) {
        return Reply.text("Упс, кажется список уже закончился! скажи назад или выбери направление\n" )
    }
    //если пользователь не выбрал направление, а нажал еще
    if (ctx.payload == 'ещё' && listprograms.length > 0) {
        let temp = [];

        MAX_COUNT -= countOfProg;//вычитаем из общего количества количество ранее выведенных
        countOfProg = 0;//обнуляем счетчик текущего количества программ в айтеме
     
        for (let i = 0; i < 5 & i < MAX_COUNT; i++) {
            temp.push(listprograms[i])
            countOfProg++;
        }
       
        for (var i = 0; i < countOfProg; i++) {
            listprograms.shift();
        }
       

        //создаем список айтемов
        let items = temp.map(el => ({
            image_id: "1656841/987aad4849a6e123fb01",
            title: el,
            button: {
                text: el,
                payload: el
            },
        }));

        if (countOfProg < MAX_COUNT) {
            return Reply.itemsListCard("Направления", {
                header: "Если ты не можешь найти свое направление, попробуй сменить кампус",
                items: items,
                footer: {
                    text: "ещё",
                    button: {
                        text: "ещё",
                        payload: "ещё"
                    }
                },
            });
        }
        else {
            return Reply.itemsListCard("Направления", {
                header: "Кажется, список закончился",
                items: items
            });
        }
    }
    

});
atProgramChoose.command(getPrograms(user_info.campus), ctx => {

    ctx.enter(FACULTY_CHOOSE);
    return Reply.text(ctx.data.request.command + "? Хорошо, вот список программ в данном направлении:\n" +
        "Выберите интересую вас программу и я выведу всю известную о нём информацию", {
            buttons: faculties.map(el => el.title)
        });
});
atProgramChoose.command(/ещ[её]/i, ctx => {

    if (listprograms.length <= 0) {
        return Reply.text("Упс, кажется список уже закончился! скажи назад или выбери направление\n")
    }
    //если пользователь не выбрал направление, а нажал еще
    if (listprograms.length > 0) {
        let temp = [];

        MAX_COUNT -= countOfProg;//вычитаем из общего количества количество ранее выведенных
        countOfProg = 0;//обнуляем счетчик текущего количества программ в айтеме

        for (let i = 0; i < 5 & i < MAX_COUNT; i++) {
            temp.push(listprograms[i])
            countOfProg++;
        }

        for (var i = 0; i < countOfProg; i++) {
            listprograms.shift();
        }

        //создаем список айтемов
        let items = temp.map(el => ({
            image_id: "1656841/987aad4849a6e123fb01",
            title: el,
            button: {
                text: el,
                payload: el
            },
        }));

        if (countOfProg < MAX_COUNT) {
            return Reply.itemsListCard("Направления", {
                header: "Если ты не можешь найти свое направление, попробуй сменить кампус",
                items: items,
                footer: {
                    text: "ещё",
                    button: {
                        text: "ещё",
                        payload: "ещё"
                    }
                },
            });
        }
        else {
            return Reply.itemsListCard("Направления", {
                header: "Кажется, список закончился",
                items: items
            });
        }
    }
});

atProgramChoose.command(/(Назад)|(верни)|(стой)|(наверх)|(ой)/i, ctx => {
    ctx.leave();
    return Reply.text("Хотите узнать новости или информацию о поступлении?", {
        buttons: [Markup.button({ title: "О поступлении", hide: true }),
        Markup.button({ title: "Новости", hide: true })
        ]
    });
});


atProgramChoose.command(/(уйти)|(пока)|(досвидания)/i, ctx => {
    return Reply.text("Уже уходите? Всего вам доброго!", {
        end_session: true
    });
});

atProgramChoose.any(ctx => {
    return Reply.text(ctx.data.request.command + "? Впервые слышу. Вы уверены, что такой факльутет есть в нашем ВУЗе?");
});

//---------END PROGRAM CHOOSE SCENE---------------------------------------


//---------FACULTY CHOOSE SCENE--------------------------------------------

let chosen_one;

atFacultyChoose.command(faculties.map(el => el.title), ctx => {

    chosen_one = faculties.find(val => val.title === ctx.data.request.command);
    getlist(chosen_one.href, info => {
        fs.writeFile('./data/news.json', JSON.stringify(info), (err, data) => {
            if (err)
                throw err;
        })
    });
    if (!isForNews) {
        return Reply.text(ctx.data.request.command + "? Отличный выбор! Вот, что я могу рассказать о нём:\n\n",
            {
                buttons: [
                    "Цена за обучение",
                    "Минимальные проходные баллы",
                    "Проходные баллы прошлых лет",
                    "Новости",
                    "Время обучения",
                    "Количество Бюджетных и платных мест",
                    "Контакты"
                ]
            });
    };
    return Reply.text("Узнать о последних событиях на " + chosen_one.title, {
        buttons: ["Давай", "Не надо"]
    });
});
atFacultyChoose.command(/(Узнать последние новости)|(давай)|(что нового)|(нов)/i, ctx => {
    let news = fs.readFileSync('./data/news.json', 'utf-8');
    let jsonNews = JSON.parse(news);
    if (jsonNews.length == 0) {
        ctx.leave();
        return Reply.text("К сожалению, новостей на сегодня нет\n" +
            "Что вас интересует?",
            {
                buttons: [Markup.button({ title: "Информация о поступлении", hide: true }),
                Markup.button({ title: "Новости", hide: true })
                ]
            });
    }
    let temp = [];
    for (var i = 0; i < jsonNews.length && i<5; i++) {
        temp.push(jsonNews[i]);
    }
    
    let items = temp.map(el => ({
        image_id: "1656841/987aad4849a6e123fb01",
        title: el.description,
        description: el.description,
        button: {
            text: "Узнать подробнее...",
            url: el.url,
            payload: {}
        }
    }
    ));
    return Reply.itemsListCard("Новости", {
        header: "Новости",
        items: items
    });
});

atFacultyChoose.command(/(цен[аник])|(прайс)|(бабки)|(деньги)|(мани)|(сколько стоит)|(скидк[аи])/i, ctx => {
    return Reply.text("Цена за обучение на \"" + chosen_one.title + "\": " + chosen_one.cost, {
        buttons: [           
            "Минимальные проходные баллы",
            "Проходные баллы прошлых лет",
            "Новости",
            "Время обучения",
            "Количество бюджетных и платных мест",
            "Контакты" ,
            "Цена за обучение"
        ]
    });
});

atFacultyChoose.command(/(Время обучения)|(долго)|(сколько учиться)|(время)/i, ctx => {
    return Reply.text("Время обучения на \"" + chosen_one.title + "\": " + chosen_one.period, {
        buttons: [       
            "Количество бюджетных и платных мест",
            "Контакты",
            "Цена за обучение",
            "Минимальные проходные баллы",
            "Проходные баллы прошлых лет",
            "Новости",
            "Время обучения"
        ]
    });
});
atFacultyChoose.command(/(миним)/i, ctx => {
    let info = "";
    let exam_points = EXAMS_GRADES.filter(el => el.program_id === chosen_one.id);

    for (let i = 0; i < exam_points.length; i++)
        for (let j = 0; j < EXAM_NAMES.length; j++)
            if (EXAM_NAMES[j].id === exam_points[i].id)
                info += EXAM_NAMES[j].title + ": " + exam_points[i].grade + "\n";
    if (info == "")
        info = "Не приведены, дополнительную информацию ищите на сайте" + chosen_one.href;
    return Reply.text("Минимальные проходные баллы по ЕГЭ на \"" + chosen_one.title + "\":\n " + info.toString(), {
        buttons: [
            "Проходные баллы прошлых лет",
            "Новости",
            "Время обучения",
            "Количество бюджетных и платных мест",
            "Контакты",
            "Цена за обучение",
            "Минимальные проходные баллы"
        ]
    });
});

atFacultyChoose.command(/(Количество бюджетных и платных мест)|(мест[а])|(бюджет)|(плат[ка]*)/, ctx => {
    return Reply.text(chosen_one.positions, {
        buttons: [
            "Контакты",
            "Цена за обучение",
            "Минимальные проходные баллы",
            "Проходные баллы прошлых лет",
            "Новости",
            "Время обучения",
            "Количество бюджетных и платных мест"
        ]
    });
});

atFacultyChoose.command(/Назад/i, ctx => {
    ctx.leave();
    return Reply.text("Что вас интересует?", {
        buttons: [Markup.button({ title: "Информация о поступлении", hide: true }),
        Markup.button({ title: "Новости", hide: true })
        ]
    });
});

atFacultyChoose.command(/(уйти)|(пока)|(досвидания)/i, ctx => {
    return Reply.text("Уже уходите? Всего вам доброго!", {
        end_session: true
    });
});

atFacultyChoose.any(ctx => {
    return Reply.text(ctx.data.request.command + "Этого я не знаю");
});

//---------END FACULTY CHOOSE SCENE---------------------------------------


//--------END ALICE DIALOG ----------------------------------------------------

const server = alice.listen(3030, '/');