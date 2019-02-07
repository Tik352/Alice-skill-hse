
// импортируемые модули и файлы для дальнейшей работы навыка
const { Alice, Reply, Stage, Scene } = require('yandex-dialogs-sdk')

var dialogs = require('./../data/dialogs.json')
var programs = require('./../data/programfull.json')
// END объявление импортируемых модулей


// Объявление констант
const alice = new Alice()
const alice_stage = new Stage()

var campuse = "";

const CAMPUSE_CSHOOSE = "CAMPUSE_CSHOOSE"
const atCampuseChoosing = new Scene(CAMPUSE_CSHOOSE) // сцена, в которую попадает пользователь при выборе кампуса

const EXAM_QUIZ = "EXAM_QUIZ"
const atExamEquiz = new Scene(EXAM_QUIZ)


const PROGRAM_CHOOSE = "PROGRAM_CHOOSE"
const atProgramChoose = new Scene(PROGRAM_CHOOSE)
// END объявление констант



//--------SUPPORT FUNCTIONS----------------------------------------------------

// Выводит список имеющихся программ в данном кампусе
function getPrograms(city) {
  var names = "";
  programs.forEach(element => {
    if(element.Edu_program_city == city)
      names += element.Edu_program_name +"\n" 
    })

  return names;
}


//--------END SUPPORT FUNCTIONS------------------------------------------------

//--------CAMPUSE SCENE--------------------------------------------------------

const EXTRA_PARAMS = {
}

atCampuseChoosing.command(dialogs.campuse.moscow, ctx => {
  campuse = dialogs.campuse.moscow[0]
  ctx.enter(EXAM_QUIZ)
  return Reply.text(dialogs.do_u_know_exam_res.phrase_1)
})

atCampuseChoosing.command(dialogs.campuse.saint_pt, ctx => {
  campuse = dialogs.campuse.saint_pt[0]
  ctx.enter(EXAM_QUIZ)
  return Reply.text(dialogs.do_u_know_exam_res.phrase_1)
})

atCampuseChoosing.command(dialogs.campuse.nizniy_novg, ctx => {
  campuse = dialogs.campuse.nizniy_novg[0]
  ctx.enter(EXAM_QUIZ)
  return Reply.text(dialogs.do_u_know_exam_res.phrase_1)
})

atCampuseChoosing.command(dialogs.campuse.perm, ctx => {
  campuse = dialogs.campuse.perm
  ctx.enter(EXAM_QUIZ)
  return Reply.text(dialogs.do_u_know_exam_res.phrase_1)
})

atCampuseChoosing.any(ctx => {
  return Reply.text('Не слышала о таком городе...')
})


//---------END CAMPUSE SCENE---------------------------------------------



//---------EXAM QUIZ SCENE-----------------------------------------------

atExamEquiz.command(dialogs.do_u_know_exam_res.answer_pos, ctx => {
  return Reply.text("Данная ветвь диалога ещё не проработана")
})

atExamEquiz.command(dialogs.do_u_know_exam_res.answer_neg, ctx => {
  ctx.enter(PROGRAM_CHOOSE)
  ctx.message = ''
  return Reply.text(dialogs.choose_program.phrase_1)
})


//---------END EAXAM QUIZ SCENE-------------------------------------------


//---------PROGRAM CHOOSE SCENE-------------------------------------------

atProgramChoose.command('', ctx => {
  return Reply.text('отлично!')
})
atProgramChoose.any( ctx => {
  return Reply.text("Вы уверены, что такие направления есть в выбранном кампусе?")
})

//---------END PROGRAM CHOOSE SCENE---------------------------------------


//---------ALICE DIALOGS--------------------------------------------------

alice_stage.addScene(atCampuseChoosing)
alice_stage.addScene(atExamEquiz)
alice_stage.addScene(atProgramChoose)

alice.use(alice_stage.getMiddleware())


// Базовые реплики Алисы, позволяющие ввести пользователя в диалог. 

alice.command('', ctx => {
  return Reply.text(dialogs.welcome.phrase_1, {
    tts: dialogs.welcome.phrase_1,
    buttons: [dialogs.welcome.answer_pos[0], dialogs.welcome.answer_neg[0]] 
  })
})


// В случае позитивного ответа на вопрос, интересует ли пользователя 
// Имеющаяся информация
alice.command(dialogs.welcome.answer_pos, ctx => {
  ctx.enter(CAMPUSE_CSHOOSE)
  return Reply.text(dialogs.welcome.phrase_2, {
    tts: "Отлично",
    buttons: [dialogs.campuse.moscow[0], dialogs.campuse.saint_pt[0], 
    dialogs.campuse.nizniy_novg[0], dialogs.campuse.perm]
  })
})

// В случае негативного ответа на вопрос, интересует ли пользователя 
// Имеющаяся информация
alice.command(dialogs.welcome.answer_neg, ctx => {
  return Reply.text(dialogs.welcome.phrase_3)
})

// В случае неопределенного ответа 
alice.any(ctx => {
  return Reply.text('Мне сложно понять вас')
})

//--------END ALICE DIALOG ----------------------------------------------------

//Ставим алису на прослушку 3001 порта
const server = alice.listen(3001, '/')