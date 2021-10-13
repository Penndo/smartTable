import sketch from 'sketch';
import BrowserWindow from 'sketch-module-web-view';
import {Rectangle,ShapePath,Style,Color,Group,Text,Layer} from 'sketch/dom';
import { getWebview } from 'sketch-module-web-view/remote';
import UI from 'sketch/ui';

const webviewIdentifier = 'smarttable.webview'

const thisDocument = sketch.getSelectedDocument();
const selectedLayers = thisDocument.selectedLayers.layers;

export default function () {
  const options = {
    identifier: webviewIdentifier,
    width: 1280,
    height: 768,
    show: false
  }

  const browserWindow = new BrowserWindow(options)

  // only show the window when the page has loaded to avoid a white flash
  browserWindow.once('ready-to-show', () => {
    browserWindow.show()
  })

  const webContents = browserWindow.webContents

  // print a message when the page loads
  webContents.on('did-finish-load', () => {
    UI.message('UI loaded!')
  })

  // add a handler for a call from web content's javascript
  webContents.on('nativeLog', s => {
    UI.message(s)
    webContents
      .executeJavaScript(`setRandomNumber(${Math.random()})`)
      .catch(console.error)
  })

  function reducer(a,b){
    return a+b;
  }

  browserWindow.loadURL(require('../resources/webview.html'))
  browserWindow.webContents.on('insert', function(renderData,controlData){

    let widthArr = [0]

    console.log(selectedLayers[0]);
    let heightStorage = {};

    renderData.map((row,rowIndex)=>{
      let rowGroup = new Group({
        name: 'row',
        parent:selectedLayers[0],
      });

      rowGroup.frame.y = 33 * rowIndex;
      rowGroup.frame.height = 33;

      const rowArr = Object.keys(row);

      rowArr.map((cell,cellIndex)=>{

        if(cell !== "key"){
          //定义表格内容
          const cellText = new Text({
            type:Text,
            text:row[cell],
            name:"cell#",
          });
          cellText.frame.x = 8;
          cellText.frame.y = 8;

          //定义表格背景
          const cellBg = new ShapePath({
            type: ShapePath,
            shapeType: ShapePath.ShapeType.Rectangle,
            frame:{
              x:0,
              y:0,
              width:cellText.frame.width + 16,
              height:cellText.frame.height + 16,
            },
            style:{
                  fills:[
                    {
                      fillType:Color,
                      enabled:true,
                      color:"white",
                    }
                  ],
                  borders:[],
                  styleType: Layer,
            },
            name:"rectangle"
          })



          //编组
          let cellGroup = new Group({
            name: 'my name',
            parent:rowGroup,
            frame:{
              x:widthArr.reduce(reducer),
              y:0,
              width:cellBg.frame.width,
              height:cellBg.frame.height
            },
            layers: [cellBg,cellText],
          });

          cellGroup.hasFixedHeight = false;
          cellGroup.hasFixedHeight = true;
          Object.assign(heightStorage, {"height":cellGroup.frame.height});
          if((cellIndex+1) % 4 !== 0){
            widthArr.push(cellGroup.frame.width)
          }else{
            widthArr = [0]
          }
          

        }
      })      
    })
  })
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) {
    existingWebview.close()
  }
}
