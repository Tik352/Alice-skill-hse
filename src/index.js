
// импортируемые модули и файлы для дальнейшей работы навыка
const { Alice, Reply, Stage, Scene, Markup } = require('yandex-dialogs-sdk');

// импортируем необходимые .json файлы
// с данными
const dialogs = require('./../data/dialogs.json'); // дерево диалогов
const program_discounts = require('./../data/program_discounts.json');


// END объявление импортируемых модулей


// Объявление констант
const alice = new Alice();
const alice_stage = new Stage();

let user_info = {
  "campus" : "Москва",
  "program": "nan",
  "program_id": 0,
  "chosen_faculties" : [
      {"id" : 0},
      {"title":"non title"}
  ]
};
let faculty = { 
  title: "",
  id: 0,
  cost: 0,
  href: ""
};


const CAMPUSE_CSHOOSE = "CAMPUSE_CSHOOSE";
const atCampuseChoosing = new Scene(CAMPUSE_CSHOOSE); // сцена, в которую попадает пользователь при выборе кампуса


const EXAM_QUIZ = "EXAM_QUIZ";
const atExamEquiz = new Scene(EXAM_QUIZ);


const PROGRAM_CHOOSE = "PROGRAM_CHOOSE";
const atProgramChoose = new Scene(PROGRAM_CHOOSE);

const FACULTY_CHOOSE = "FACULTY_CHOOSE";
const atFacultyChoose = new Scene(FACULTY_CHOOSE);
// END объявление констант



//--------SUPPORT FUNCTIONS----------------------------------------------------

// Возвращает массив программ, имеющихся в выбранном кампусе
function getPrograms(city) {
  let correct = [];
  let index = 0;
  for(let program_index = 0; program_index < program_discounts.programs.length; program_index++) {
    for(let item_index = 0; item_index < program_discounts.programs[program_index].items.length;
       item_index++) {
      if(program_discounts.programs[program_index].items[item_index].campus_title.toLowerCase() === city.toLowerCase()) {
        correct.push((program_discounts.programs[program_index].title).match('[а-яА-Я ]+')[0]);
       // correct += ++index + ". " + (program_discounts.programs[program_index].title).match('[а-яА-Я ]+') +"\n";
        break;
      }
    }
  }
  return correct;
}

function getFaculties(city, from) {
  let correct = [];
  for(let program_index = 0; program_index < program_discounts.programs.length; program_index++) {
    for(let item_index = 0; item_index < program_discounts.programs[program_index].items.length; item_index++) {
      if(program_discounts.programs[program_index].title.toLowerCase().includes(city.toLowerCase()) &&
        program_discounts.programs[program_index].items[item_index].campus_title.toLowerCase() === from.toLowerCase()) {
        correct.push({
          title: program_discounts.programs[program_index].items[item_index].title,
          id:  program_discounts.programs[program_index].items[item_index].id,
          cost:  program_discounts.programs[program_index].items[item_index].cost,
          href:  program_discounts.programs[program_index].items[item_index].href
        });
      }
    }
  }
  return correct;
}
console.log(getFaculties("Информатика и вычислительная техника", "Москва").map(element =>  element.title));

//--------END SUPPORT FUNCTIONS------------------------------------------------



//--------  E--------------------------------------------------------


let cities = dialogs.campuse.moscow
  .concat(dialogs.campuse.saint_pt
  .concat(dialogs.campuse.nizniy_novg
  .concat(dialogs.campuse.perm)))

atCampuseChoosing.command(cities, ctx=> {
  user_info.campus = ctx.data.request.command;
  ctx.enter(EXAM_QUIZ);
  return Reply.text(dialogs.do_u_know_exam_res.phrase_1);
})

atCampuseChoosing.any(ctx => {
  return Reply.text('Не слышала о таком городе...')
});


//---------END CAMPUSE SCENE---------------------------------------------



//---------EXAM QUIZ SCENE-----------------------------------------------

atExamEquiz.command(dialogs.do_u_know_exam_res.answer_pos, ctx => {
  return Reply.text("Данная ветвь диалога ещё не проработана")
});

atExamEquiz.command(dialogs.do_u_know_exam_res.answer_neg, ctx => {
  ctx.enter(PROGRAM_CHOOSE);
  
  return Reply.text(dialogs.choose_program.phrase_1)
});



//---------END EAXAM QUIZ SCENE-------------------------------------------


//---------PROGRAM CHOOSE SCENE-------------------------------------------

atProgramChoose.command('го', ctx => {
  return Reply.text("Прошу, вот список направлений в вашем кампусе:",
  {
    buttons: getPrograms(user_info.campus)
  })
});


let faculties = []

atProgramChoose.command(getPrograms(user_info.campus), ctx=> {
  user_info.program = ctx.data.request.command;
  faculties = getFaculties(user_info.program, user_info.campus);

  //ctx.enter(FACULTY_CHOOSE);
  
  return Reply.text(ctx.data.request.command+"? Отлично, вот список факультетов в данном направлении:\n"+
  "Выберите интересующий вас факультет и я выведу всю известную о нём информацию", {
    buttons:getFaculties(user_info.program, user_info.campus)
  });
})

atProgramChoose.command(faculties.map(el=>el.title), ctx=> {
  return Reply.text(ctx.data.request.command+"? Отличный выбор!");
})
atProgramChoose.any(ctx => {
  console.log("Список факультетов:\n"+faculties.map(el=>el.title));
  console.log("Выбранный факультет: " + ctx.data.request.command);
  console.log("Проверка на наличие факультета: "+faculties.map(el=>el.title).includes(ctx.data.request.command));
  
  return Reply.text(ctx.data.request.command+"? Я о таком никогда не слышала");
});

//---------END PROGRAM CHOOSE SCENE---------------------------------------


//---------FACULTY CHOOSE SCENE--------------------------------------------


atFacultyChoose.command(faculties, ctx => {
  
  return Reply.text("Класс!");
})

atFacultyChoose.any(ctx => {
  return Reply.text("О чем вы вообще!!!");
})



//---------END FACULTY CHOOSE SCENE---------------------------------------



//---------ALICE DIALOGS--------------------------------------------------

alice_stage.addScene(atCampuseChoosing);
alice_stage.addScene(atExamEquiz);
alice_stage.addScene(atProgramChoose);
alice_stage.addScene(atFacultyChoose);
alice.use(alice_stage.getMiddleware());


// Базовые реплики Алисы, позволяющие ввести пользователя в диалог. 

alice.command('', ctx => { 
  return Reply.text(dialogs.welcome.phrase_1, {
    tts: dialogs.welcome.phrase_1,
    buttons: [Markup.button({title: dialogs.welcome.answer_pos[0], hide: false}),
              Markup.button({title: dialogs.welcome.answer_neg[0], hide: true})
    ]
  })
});


// В случае позитивного ответа на вопрос, интересует ли пользователя 
// Имеющаяся информация
alice.command(dialogs.welcome.answer_pos, ctx => {
  ctx.enter(CAMPUSE_CSHOOSE);
  return Reply.text(dialogs.welcome.phrase_2, {
    // ВОЗМОЖНО НЕ СРАБОТАЕТ!!!
    tts: dialogs.welcome.answer_pos,
    buttons: [dialogs.campuse.moscow[0], dialogs.campuse.saint_pt[0],
    dialogs.campuse.nizniy_novg[0], dialogs.campuse.perm]
  })
});

// В случае негативного ответа на вопрос, интересует ли пользователя 
// Имеющаяся информация
alice.command(dialogs.welcome.answer_neg, ctx => {
  return Reply.text(dialogs.welcome.phrase_3, {
    "buttons": [
      {
          "title": "Перейти на сайт НИУ ВШЭ",
          "payload": {},
          "url": "https://hse.ru/",
          "hide": false
      }
  ],
  end_session: false

  })
});

// В случае неопределенного ответа 
alice.any(ctx => {
  return Reply.text('Не понимаю, чего вы хотите')
});

//--------END ALICE DIALOG ----------------------------------------------------

const server = alice.listen(3001, '/');