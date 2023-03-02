'use strict';
// -------------------
// Generate server ready files
// ready to be shipped
// -------------------
const path = require('path')
const fse = require('fs-extra')
const notifier = require('node-notifier')
const root = path.join(__dirname, '../../')
const buildList = require('../build-list.config')
const destFolder = path.join(root, '.dist')

module.exports = async (list = 'fullSite') => {
  // Delete destination folder first
  // to start fresh
  let isErr = false
  await fse.remove(destFolder).catch(err => {
    console.error('fse.remove error: ', err)
    isErr = true
  })
  await fse.ensureDir(destFolder).catch(err => {
    console.error('fse.ensureDir error: ', err)
    isErr = true
  })

  if (isErr) {
    notifier.notify({
      title: 'BUILD FAILD',
      message: 'redirecthealth.com_wp - check console'
    })
    throw 'Build Failed'
  }

  for (const fileName of buildList[list]) {
    const file = path.join(root, fileName)
    const dest = path.join(destFolder, fileName)
    await fse.copy(file, dest).catch(err => console.error(`fse.copy error ${fileName}: `, err))
  }

  notifier.notify({
    title: 'BULD DONE',
    message: 'redirecthealth.com_wp'
  })

  return `Build done ${destFolder}`
}
