import sketch from 'sketch';
import BrowserWindow from 'sketch-module-web-view';
import {ShapePath, Color, Group, Text, Layer, SymbolMaster, SymbolInstance,Document } from 'sketch/dom';
import { getWebview } from 'sketch-module-web-view/remote';
import UI from 'sketch/ui';

const webviewIdentifier = 'smarttable.webview'

const selectedDocument = Document.getSelectedDocument();
const selectedPages = selectedDocument.pages;
const selectedLayers = selectedDocument.selectedLayers.layers;

export default function () {
  const browserWindowOptions = {
    identifier: webviewIdentifier,
    width: 1280,
    height: 768,
    show: false
  }
  
  const browserWindow = new BrowserWindow(browserWindowOptions)

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

  //累加
  function addReducer(a, b) {
    return a + b;
  }

  //获取最大值
  function getMaxValue(arr) {
    let maxValue = "";
    if (isNaN(Math.max(arr))) {
      maxValue = arr[0]
    } else {
      maxValue = Math.max(...arr)
    }
    return maxValue
  }

  //固定位置
  function fix(item,positionArr){
    let itemNative = item.sketchObject;
    itemNative.hasFixedLeft = false;
    itemNative.hasFixedRight = false;
    itemNative.hasFixedTop = false;
    itemNative.hasFixedBottom = false;
    itemNative.hasFixedWidth = false;
    itemNative.hasFixedHeight = false;

    for(let i=0;i<positionArr.length;i++){
        switch (positionArr[i]) {
            case "left":
                itemNative.hasFixedLeft = true;
                break;
            case "right":
                itemNative.hasFixedRight = true;
                break;
            case "top":
                itemNative.hasFixedTop = true;
                break;
            case "bottom":
                itemNative.hasFixedBottom = true;
                break;
            case "width":
                itemNative.hasFixedWidth = true;
                break;
            case "height":
                itemNative.hasFixedHeight = true;
                break;
            default:
                break;
        }
    }
}

  browserWindow.loadURL(require('../resources/webview.html'))
  browserWindow.webContents.on('insert', function (renderHead, renderData, controlData, cellSize) {
    
    const {b_bottom, b_left, b_top} = controlData.tbodyPadding
    const {h_bottom, h_top} = controlData.theadPadding
    
    let titleArr = []
    for (let o of renderHead) {
      titleArr.push(o.colID)
    }

    let tbodyRowsGroup = [];
    let tbodyRowsHeight = [0];

    let cellWidthArr = [0]
    let cellGroupArr = [];
    let cellHeightArr = [];

    //定义一个表格组件

    //定义表格背景
    const cellBg = new ShapePath({
      shapeType: ShapePath.ShapeType.Rectangle,
      name: "cellBg",
      frame: {
          x: 0,
          y: 0,
          width: 120,
          height: 40,
      },
      style: {
          fills: [
              {
                  fillType: Color,
                  enabled: true,
                  color: "#ffffff",
              }
          ],
          borders: [],
          styleType: Layer,
      },
    });
  
    const cellText = new Text({
        text: "text",
        name: "layerName",
        style: {
          textColor:"#000000",
          fontSize: 14,
          borders: [],
        }
    });
    cellText.adjustToFit();
    cellText.frame.x = 8;
    cellText.frame.y = (cellBg.frame.height - cellText.frame.height) / 2;
  
    const borderBottom = new ShapePath({
      shapeType: ShapePath.ShapeType.Rectangle,
      name: "borderBottom",
      frame: {
          x: 0,
          y: cellBg.frame.height - 1,
          width: 120,
          height: 1,
      },
      style: {
          fills: [
          {
              fillType: Color,
              enabled: true,
              color: "#eeeeee",
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
          x: cellBg.frame.width - 1,
          y: 0,
          width: 1,
          height: 40,
      },
      style: {
          fills: [
          {
              fillType: Color,
              enabled: true,
              color: "#eeeeee",
          }
          ],
          borders: [],
          styleType: Layer,
      },
    })
  
    fix(cellBg,["left","right","top","bottom"]);
    fix(cellText,["left"]);
    fix(borderBottom,["bottom","height"]);
    fix(borderRight,["right","width"]);

    var symbolSource = new SymbolMaster({
      name:"TD",
      layers:[cellBg,cellText,borderBottom,borderRight],
      parent:selectedPages[0],
      frame:{
          x:currentSymbolPosition,
          y:0,
          width:cellBg.frame.width,
          height:cellBg.frame.height
      },
    });

    var instance = symbolSource.createNewInstance();

    //thead 内容
    renderHead.map((cell, cellIndex) => {
      //定义表格内容
      const cellText = new Text({
        text: cell.title.toString() === "" ? " " : cell.title.toString(),
        name: cell.title.toString() === "" ? "text" : cell.title.toString(),
        style: {
          textColor: controlData.theadTextStyle.basicColor,
          fontSize: controlData.theadTextStyle.fontSize,
          borders: [],
        }
      });
      cellText.frame.x = b_left;
      cellText.frame.y = h_top;
      
      const borderBottom = new ShapePath({
        shapeType: ShapePath.ShapeType.Rectangle,
        name: "borderBottom",
        frame: {
          x: 0,
          y: cellText.frame.height * 1 + h_bottom * 1 + h_top * 1 - 1,
          width: cellSize.width[cellIndex],
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
          x: cellSize.width[cellIndex]*1 - 1,
          y: 0,
          width: 1,
          height: cellText.frame.height * 1 + h_bottom * 1 + h_top * 1,
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
          width: cellSize.width[cellIndex],
          height: cellText.frame.height * 1 + h_bottom * 1 + h_top * 1,
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

    
    //tbody 内容
    renderData.map((row,rowIndex) => {
      let cellWidthArr = [0]
      let cellGroupArr = [];
      let cellHeightArr = [];
      
      titleArr.map((cell, cellIndex) => {
        //定义表格内容
        console.log("数据来了/213")
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
        console.log("数据来了/224")
        cellText.frame.x = b_left;
        cellText.frame.y = b_top;
        console.log("数据来了/217")
        const borderBottom = new ShapePath({
          shapeType: ShapePath.ShapeType.Rectangle,
          name: "borderBottom",
          frame: {
            x: 0,
            y: cellText.frame.height * 1 + b_bottom * 1 + b_top * 1 - 1,
            width: cellSize.width[cellIndex],
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
            x: cellSize.width[cellIndex]*1 - 1,
            y: 0,
            width: 1,
            height: cellText.frame.height * 1 + b_bottom * 1 + b_top * 1,
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
            width: cellSize.width[cellIndex],
            height: cellText.frame.height * 1 + b_bottom * 1 + b_top * 1,
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
