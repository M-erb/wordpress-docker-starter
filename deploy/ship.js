'use strict';
// -------------------
// Ship off built files
// -------------------

require('dotenv').config({
  path: '../.env'
})

const chalk = require('chalk')
const log = console.log
const inquirer = require('inquirer')
const notifier = require('node-notifier')
const collectFiles = require('./functions/collectFiles')
const execSync = require('child_process').execSync
const shipCommand = process.env.SHIP
const shipCommandProd = process.env.SHIP_PROD

async function init () {
  log(chalk.bgBlue('-==Lets get this thing shipped!==-'))

  if (!shipCommand || !shipCommandProd) {
    log(chalk.bgRed('Oops, I ether cannot find a ".env" file or the ship commands are not given there.'))
    return
  }

  const questions = [
    {
      type: 'list',
      name: 'envTo',
      message: 'Which Enviorment?',
      choices: [
        {
          name: 'Staging',
          value: 'stag'
        },
        {
          name: 'Production',
          value: 'prod'
        }
      ]
    },
    {
      type: 'list',
      name: 'whichFiles',
      message: 'What files to ship?',
      choices: [
        {
          name: 'Just Theme',
          value: 'themeOnly',
          short: 'Just Theme'
        },
        {
          name: 'Full Site',
          value: 'fullSite',
          short: 'Full Site'
        }
      ]
    },
    {
      type: 'list',
      name: 'isConfirmed',
      message: 'Are you sure you want to ship to prod?',
      choices: [
        {
          name: 'No',
          value: false,
          short: '"No" - Cancel ship'
        },
        {
          name: 'Yes',
          value: true,
          short: 'Yes'
        }
      ],
      when(curAnswers) {
        return curAnswers.envTo === 'prod'
      }
    }
  ]

  const answers = await inquirer.prompt(questions)
  // console.log('answers: ', answers)

  if (answers.envTo === 'prod' && !answers.isConfirmed) {
    log('')
    log('    ' + chalk.bgRed('=-=-=-=-=-=-=-=-=-=-='))
    log('    ' + chalk.bgRed('CANCELLED!           '))
    log('    ' + chalk.bgRed('ENV: Prod            '))
    log('    ' + chalk.bgRed('=-=-=-=-=-=-=-=-=-=-='))
    log('')

    return
  }

  let isBuildErr = false
  await collectFiles(answers.whichFiles).catch(err => {
    errorNoty(err)
    isBuildErr = true
  })
  if (isBuildErr) return

  if (answers.envTo === 'prod' && !shipCommandProd) return log(chalk.bgRed('Oops, I cannot find the SHIP_COMMAND_PROD'))
  if (answers.envTo === 'stag' && !shipCommand) return log(chalk.bgRed('Oops, I cannot find the SHIP_COMMAND_PROD'))

  const executeOrder = `rsync -rvzz ../.dist/ ${answers.envTo === 'prod' ? shipCommandProd : shipCommand} --progress`

  try {
    execSync(executeOrder, { stdio: [0, 1, 2] })
  } catch (error) {
    return errorNoty(error)
  }

  notifier.notify({
    title: `SHIPPED to ${answers.envTo === 'stag' ? 'Staging' : 'Prod'}`,
    message: 'Yay! Success!'
  })

  log('')
  log('    ' + chalk.green('=-=-=-=-=-=-=-=-=-=-='))
  log('    ' + chalk.green('SHIPPED!'))
  log('    ' + chalk.green(`ENV: ${answers.envTo === 'stag' ? 'Staging' : 'Prod'}`))
  log('    ' + chalk.green('=-=-=-=-=-=-=-=-=-=-='))
  log('')
}

function errorNoty (err) {
  notifier.notify({
    title: `SHIPPED FAIILD`,
    message: 'check console'
  })

  log('')
  log('    ' + chalk.bgRed('=-=-=-=-=-=-=-=-=-=-='))
  log('    ' + chalk.red('Something went wrong with the ship command, please check it'))
  log('    ' + chalk.bgRed('=-=-=-=-=-=-=-=-=-=-='))
  log('')
}

init()
