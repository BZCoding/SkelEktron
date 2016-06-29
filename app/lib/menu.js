'use strict'

const isDev = (require('electron-is-dev') || global.appSettings.debug)
const { app } = require('electron')
const ipc = require('electron').ipcMain

var menuTemplate = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Back',
        accelerator: 'CmdOrCtrl+B',
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.goBack()
          }
        }
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function (item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.reload()
          }
        }
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Info',
        click: () => {
          ipc.emit('open-info-window')
        }
      }
    ]
  }
]

// Show Dev Tools menu if running in development
if (isDev) {
  menuTemplate[1].submenu.push(
    {
      label: 'Toggle Developer Tools',
      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.webContents.toggleDevTools()
        }
      }
    }
  )
}

if (process.platform === 'darwin') {
  var name = app.getName()
  menuTemplate.unshift({
    label: name,
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
  // Window menu.
  menuTemplate[3].submenu.push(
    {
      type: 'separator'
    },
    {
      role: 'front'
    }
  )
}

module.exports = menuTemplate
