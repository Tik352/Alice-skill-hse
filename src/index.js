
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


const CAMPUSE_CSHOOSE = "CAMPUSE_CSHOOSE";
const atCampuseChoosing = new Scene(CAMPUSE_CSHOOSE); // сцена, в которую попадает пользователь при выборе кампуса


const EXAM_QUIZ = "EXAM_QUIZ";
const atExamEquiz = new Scene(EXAM_QUIZ);


const PROGRAM_CHOOSE = "PROGRAM_CHOOSE";
const atProgramChoose = new Scene(PROGRAM_CHOOSE);
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
  let index = 0;
  for(let program_index = 0; program_index < program_discounts.programs.length; program_index++) {
    for(let item_index = 0; item_index < program_discounts.programs[program_index].items.length;
       item_index++) {
      if(program_discounts.programs[program_index].title.toLowerCase().includes(city.toLowerCase()) &&
        program_discounts.programs[program_index].items[item_index].campus_title.toLowerCase() === from.toLowerCase()) {
        correct.push(program_discounts.programs[program_index].items[item_index].faculty);
       // correct += ++index + ". " + (program_discounts.programs[program_index].title).match('[а-яА-Я ]+') +"\n";
      }
    }
  }
  return correct;
}
//console.log(getPrograms(dialogs.campuse.moscow[0]));
console.log(getFaculties("Изобразительное искусство и прикладные виды искусств", "Москва").toString());

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



atProgramChoose.command(getPrograms(user_info.campus), ctx=> {
  user_info.program = ctx.data.request.command;
  let faculties = getFaculties(user_info.program);
  return Reply.text(ctx.data.request.command+"? Отлично, вот список факультетов в данном направлении:\n"+
  "Выберите интересующий вас факультет и я выведу всю известную о нём информацию", {
    buttons:faculties
  });
})
atProgramChoose.any(ctx => {
  return Reply.text("Вы уверены, что такие направления есть в выбранном кампусе?");
});

//---------END PROGRAM CHOOSE SCENE---------------------------------------


//---------ALICE DIALOGS--------------------------------------------------

alice_stage.addScene(atCampuseChoosing);
alice_stage.addScene(atExamEquiz);
alice_stage.addScene(atProgramChoose);

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