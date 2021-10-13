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

  function addReducer(a,b){
    return a+b;
  }

  

  browserWindow.loadURL(require('../resources/webview.html'))
  browserWindow.webContents.on('insert', function(renderData,controlData){
    
    let rowGroupArr = [];

    console.log(selectedLayers[0]);
    let heightStorage = {};

    renderData.map((row,rowIndex)=>{
      let widthArr = [0]
      let cellGroupArr = [];
      const rowArr = Object.keys(row);

      rowArr.map((cell,cellIndex)=>{

        if(cell !== "key"){

          //定义表格内容
          const cellText = new Text({
            type:Text,
            text:row[cell],
            name:"cellText",
          });
          cellText.frame.x = 8;
          cellText.frame.y = 8;

          //定义表格背景
          const cellBg = new ShapePath({
            type: ShapePath,
            shapeType: ShapePath.ShapeType.Rectangle,
            name:"cellBg",
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
          })

          //将表格内容与表格背景编组并整合为一行
          let cellGroup = new Group({
            name: 'cell',
            frame:{
              //x 位置为前一个编组的宽度
              x:widthArr.reduce(addReducer),
              y:0,
              //宽高为表格背景的宽度
              width:cellBg.frame.width,
              height:cellBg.frame.height
            },
            layers: [cellBg,cellText],
          });

          //将单元格编组放入一个数组中，供下方的行编组使用。
          cellGroupArr.push(cellGroup);
          Object.assign(heightStorage, {"height":cellGroup.frame.height});
          widthArr.push(cellGroup.frame.width)
        }
      })      

      //将上面的单元格编组放入到 行内容编组中
      let rowGroup = new Group({
        name: 'row',
        // parent:selectedLayers[0],
        //这里一定要注意 frame 和 layers 的顺序。如果 layers 在前，那么后面设置的 frame 将对先生成的内容进行拉伸。
        frame:{
          x:0,
          y:heightStorage.height*rowIndex,
          width:widthArr.reduce(addReducer),
          height:heightStorage.height
        },
        layers:cellGroupArr,
      });

      rowGroupArr.push(rowGroup)

    })

    //最后将行内容编组放入最终的table中
    new Group({
      name:'smartTable',
      parent:selectedLayers[0],
      frame:{
        x:24,
        y:24,
        width:400,
        height:165
      },
      layers:rowGroupArr
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
