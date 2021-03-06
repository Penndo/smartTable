import sketch from 'sketch';
import BrowserWindow from 'sketch-module-web-view';
import { Rectangle, ShapePath, Style, Color, Group, Text, Layer } from 'sketch/dom';
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

  function addReducer(a, b) {
    return a + b;
  }

  function getMaxValue(arr) {
    let maxValue = "";
    if (isNaN(Math.max(arr))) {
      maxValue = arr[0]
    } else {
      maxValue = Math.max(arr)
    }
    return maxValue
  }



  browserWindow.loadURL(require('../resources/webview.html'))
  browserWindow.webContents.on('insert', function (renderHead, renderData, controlData) {
    const paddingBottom = controlData.padding.bottom;
    const paddingLeft = controlData.padding.left;
    const paddingTop = controlData.padding.top;

    console.log(renderHead, renderData, controlData)

    let titleArr = []
    for (let o of renderHead) {
      titleArr.push(o.title)
    }

    console.log(titleArr)

    let tbodyRowsGroup = [];
    let tbodyRowsHeight = [0];

    let cellWidthArr = [0]
    let cellGroupArr = [];
    let cellHeightArr = [];

    titleArr.map((cell, cellIndex) => {
      console.log(cell)
      //定义表格内容
      const cellText = new Text({
        text: cell.toString(),
        name: cell.toString(),
        style: {
          textColor: controlData.theadTextStyle.basicColor,
          fontSize: controlData.theadTextStyle.fontSize,
          borders: [],
        }
      });
      cellText.frame.x = paddingLeft;
      cellText.frame.y = paddingTop;

      const borderBottom = new ShapePath({
        shapeType: ShapePath.ShapeType.Rectangle,
        name: "borderBottom",
        frame: {
          x: 0,
          y: cellText.frame.height * 1 + paddingBottom * 1 + paddingTop * 1 - 1,
          width: controlData.cellSize.width[cellIndex],
          height: 1,
        },
        style: {
          fills: [
            {
              fillType: Color,
              enabled: true,
              color: controlData.border.basicColor,
            }
          ],
          borders: [],
          styleType: Layer,
        },
      })

      const borderRight = new ShapePath({
        shapeType: ShapePath.ShapeType.Rectangle,
        name: "borderRight",
        frame: {
          x: controlData.cellSize.width[cellIndex]*1 - 1,
          y: 0,
          width: 1,
          height: cellText.frame.height * 1 + paddingBottom * 1 + paddingTop * 1,
        },
        style: {
          fills: [
            {
              fillType: Color,
              enabled: true,
              color: controlData.border.basicColor,
            }
          ],
          borders: [],
          styleType: Layer,
        },
      })

      //定义表格背景
      const cellBg = new ShapePath({
        shapeType: ShapePath.ShapeType.Rectangle,
        name: "cellBg",
        frame: {
          x: 0,
          y: 0,
          width: controlData.cellSize.width[cellIndex],
          height: cellText.frame.height * 1 + paddingBottom * 1 + paddingTop * 1,
        },
        style: {
          fills: [
            {
              fillType: Color,
              enabled: true,
              color: controlData.theadFill.basicColor,
            }
          ],
          borders: [],
          styleType: Layer,
        },
      })

      let cellGroupLayers = [];

      if(cellIndex === titleArr.length - 1){
        cellGroupLayers = [cellBg,cellText,borderBottom]
      }else{
        if(controlData.border.intervalColor === ""){
          cellGroupLayers = [cellBg,cellText,borderBottom]
        }else{
          cellGroupLayers = [cellBg,cellText,borderBottom,borderRight]
        }
      }

      //将表格内容与表格背景编组并整合为一行
      let cellGroup = new Group({
        name: 'cell',
        frame: {
          //x 位置为前一个编组的宽度
          x: cellWidthArr.reduce(addReducer),
          y: 0,
          //宽高为表格背景的宽度
          width: cellBg.frame.width,
          height: cellBg.frame.height
        },
        layers: cellGroupLayers,
      });

      //将单元格编组放入一个数组中，供下方的行编组使用。
      cellGroupArr.push(cellGroup);
      cellWidthArr.push(cellGroup.frame.width);
      cellHeightArr.push(cellGroup.frame.height)

    })

    //将上面的单元格编组放入到 行内容编组中
    let rowGroup = new Group({
      name: 'row',
      // parent:selectedLayers[0],
      //这里一定要注意 frame 和 layers 的顺序。如果 layers 在前，那么后面设置的 frame 将对先生成的内容进行拉伸。
      frame: {
        x: 0,
        y: 0,
        width: cellWidthArr.reduce(addReducer),
        // height:Math.max(cellHeightArr),
        height: getMaxValue(cellHeightArr)
      },
      layers: cellGroupArr,
    });

    renderData.map((row,rowIndex) => {
      let cellWidthArr = [0]
      let cellGroupArr = [];
      let cellHeightArr = [];

      titleArr.map((cell, cellIndex) => {
        //定义表格内容
        const cellText = new Text({
          //表格数据是否为空
          text: row[cell].toString() === "" ? " " : row[cell].toString(),
          name: row[cell].toString() === "" ? "text" : row[cell].toString(),
          style: {
            textColor: controlData.textStyle.basicColor,
            fontSize: controlData.textStyle.fontSize,
            borders: [],
          }
        });
        cellText.frame.x = paddingLeft;
        cellText.frame.y = paddingTop;

        const borderBottom = new ShapePath({
          shapeType: ShapePath.ShapeType.Rectangle,
          name: "borderBottom",
          frame: {
            x: 0,
            y: cellText.frame.height * 1 + paddingBottom * 1 + paddingTop * 1 - 1,
            width: controlData.cellSize.width[cellIndex],
            height: 1,
          },
          style: {
            fills: [
              {
                fillType: Color,
                enabled: true,
                color: controlData.border.basicColor,
              }
            ],
            borders: [],
            styleType: Layer,
          },
        })

        const borderRight = new ShapePath({
          shapeType: ShapePath.ShapeType.Rectangle,
          name: "borderRight",
          frame: {
            x: controlData.cellSize.width[cellIndex]*1 - 1,
            y: 0,
            width: 1,
            height: cellText.frame.height * 1 + paddingBottom * 1 + paddingTop * 1,
          },
          style: {
            fills: [
              {
                fillType: Color,
                enabled: true,
                color: controlData.border.basicColor,
              }
            ],
            borders: [],
            styleType: Layer,
          },
        })

        //定义表格背景
        const cellBg = new ShapePath({
          shapeType: ShapePath.ShapeType.Rectangle,
          name: "cellBg",
          frame: {
            x: 0,
            y: 0,
            width: controlData.cellSize.width[cellIndex],
            height: cellText.frame.height * 1 + paddingBottom * 1 + paddingTop * 1,
          },
          style: {
            fills: [
              {
                fillType: Color,
                enabled: true,
                color: controlData.fill.intervalColor !== "" && rowIndex%2 === 1 ? controlData.fill.intervalColor : controlData.fill.basicColor,
              }
            ],
            borders: [],
            styleType: Layer,
          },
        })

        let cellGroupLayers = [];

        if(rowIndex === renderData.length - 1 && cellIndex === titleArr.length - 1){
          cellGroupLayers = [cellBg,cellText]
        }else{
          if(cellIndex === titleArr.length - 1){
            cellGroupLayers = [cellBg,cellText,borderBottom]
          }else{
            if(controlData.border.intervalColor === ""){
              if(rowIndex === renderData.length - 1){
                cellGroupLayers = [cellBg,cellText]
              }else{
                cellGroupLayers = [cellBg,cellText,borderBottom]
              }
            }else{
              if(rowIndex === renderData.length - 1){
                cellGroupLayers = [cellBg,cellText,borderRight]
              }else{
                cellGroupLayers = [cellBg,cellText,borderBottom,borderRight]
              }
            }
          }
        }

        //将表格内容与表格背景编组并整合为一行
        let cellGroup = new Group({
          name: 'cell',
          frame: {
            //x 位置为前一个编组的宽度
            x: cellWidthArr.reduce(addReducer),
            y: 0,
            //宽高为表格背景的宽度
            width: cellBg.frame.width,
            height: cellBg.frame.height
          },
          layers: cellGroupLayers,
        });

        //将单元格编组放入一个数组中，供下方的行编组使用。
        cellGroupArr.push(cellGroup);
        cellWidthArr.push(cellGroup.frame.width);
        cellHeightArr.push(cellGroup.frame.height)

      })

      //将上面的单元格编组放入到 行内容编组中
      let rowGroup = new Group({
        name: 'row',
        // parent:selectedLayers[0],
        //这里一定要注意 frame 和 layers 的顺序。如果 layers 在前，那么后面设置的 frame 将对先生成的内容进行拉伸。
        frame: {
          x: 0,
          y: tbodyRowsHeight.reduce(addReducer),
          width: cellWidthArr.reduce(addReducer),
          // height:Math.max(cellHeightArr),
          height: getMaxValue(cellHeightArr)
        },
        layers: cellGroupArr,
      });
      tbodyRowsGroup.push(rowGroup);
      tbodyRowsHeight.push(rowGroup.frame.height)

    })

    let thead = new Group({
      name: 'thead',
      frame: {
        x: 0,
        y: 0,
        width: rowGroup.frame.width,
        height: rowGroup.frame.height,
      },
      layers: [rowGroup]
    })

    //最后将行内容编组放入最终的table中
    let tbody = new Group({
      name: 'tbody',
      frame: {
        x: 0,
        y: thead.frame.height,
        width: tbodyRowsGroup[0].frame.width,
        height: tbodyRowsHeight.reduce(addReducer),
      },
      layers: tbodyRowsGroup
    })


    new Group({
      name: 'smartTable',
      parent: selectedLayers[0],
      frame: {
        x: 24,
        y: 24,
        width: thead.frame.width,
        height: thead.frame.height*1 + tbody.frame.height*1,
      },
      layers: [tbody,thead]
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
