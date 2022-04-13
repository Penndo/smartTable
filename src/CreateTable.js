import sketch from 'sketch';
import {ShapePath, Color, Group, Text, Layer, SymbolMaster, SymbolInstance,Document,Page } from 'sketch/dom';
import BrowserWindow from 'sketch-module-web-view';
import { getWebview } from 'sketch-module-web-view/remote';
import { createCellText, createCellBg, createBorderBottom } from './createLayers';
import { createNewSymbolMaster } from './Help';
import UI from 'sketch/ui';

const webviewIdentifier = 'smarttable.webview'

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

  //转换字重
  function transFontWeight(fontWeight) {
    switch (fontWeight) {
      case "light":
        return 2;
      case "regular":
        return 8
      case "bold":
        return 10
      default:
        return 8;
    }
  }

  browserWindow.loadURL(require('../resources/webview.html'))
  browserWindow.webContents.on('insert', function (renderHead, renderData, controlData, cellSize) {

    var document = context.document;
    var selectedLayers = document.currentPage().selectedLayers().layers();
    var artboards = document.currentPage().artboards();
    var currentPage = document.currentPage();

    let parentOfSmartTable;
    if(selectedLayers.count() != 0){
      let layer = selectedLayers[0];
      if(layer.className() != "MSLayerGroup" && layer.className() != "MSArtboardGroup"){

        let x = layer.frame().rect().origin.x;
        let y = layer.frame().rect().origin.y;

        let group = MSLayerGroup.alloc().initWithFrame(layer.frame().rect());
        let parentGroup = layer.parentGroup();

        group.setName(layer.name());
        layer.moveToLayer_beforeLayer(group,nil);
        layer.frame().setX(0);
        layer.frame().setY(0);

        parentGroup.addLayer(group);
        group.frame().setX(x);
        group.frame().setY(y);

        parentOfSmartTable = group;

      }else{
        parentOfSmartTable = selectedLayers[0]
      }
    }else{
      if(artboards.count() != 0){
        parentOfSmartTable = artboards[0]
      }else{
        parentOfSmartTable = currentPage;
      }
    }

    const {b_bottom, b_left, b_top, b_right} = controlData.tbodyPadding;
    const {h_bottom,h_top} = controlData.theadPadding
    
    let titleArr = [];
    for (let o of renderHead) {
      titleArr.push(o.colID)
    }

    let tbodyRowsGroup = [];
    let tbodyRowsHeight = [0];

    let cellWidthArr = [0]
    let cellGroupArr = [];
    let cellHeightArr = [];

    let fontWeight_TD = transFontWeight(controlData.textStyle.fontWeight);
    let fontWeight_TH = transFontWeight(controlData.theadTextStyle.fontWeight);

    let styles_TD = {
      cellBg:{
        color:controlData.fill.basicColor.toUpperCase()
      },
      text:{
        textColor:controlData.textStyle.basicColor.toUpperCase(),
        fontSize:controlData.textStyle.fontSize,
        fontWeight:fontWeight_TD,
        alignment:"left",
        borders:[]
      },
      borderBottom:{
        color:controlData.border.basicColor.toUpperCase()
      },
      padding:{
        left:b_left,
        right:b_right,
        top:b_top,
        bottom:b_bottom
      }
    }

    let styles_TH = {
      cellBg:{
        color:controlData.theadFill.basicColor.toUpperCase()
      },
      text:{
        textColor:controlData.theadTextStyle.basicColor.toUpperCase(),
        fontSize:controlData.theadTextStyle.fontSize,
        fontWeight:fontWeight_TH,
        alignment:"left",
        borders:[]
      },
      borderBottom:{
        color:controlData.border.basicColor.toUpperCase()
      },
      padding:{
        left:b_left,
        right:b_right,
        top:h_top,
        bottom:h_bottom
      }
    }

    //表头&表格背景
    const tdCellBg = createCellBg(styles_TH.cellBg.color);
    const thCellBg = createCellBg(styles_TD.cellBg.color);
  
    //表头&表格文本
    const tdCellText = createCellText(styles_TD.text,b_left);
    const thCellText = createCellText(styles_TH.text,b_left);

    //表头&表格下方分割线
    const tdBorderBottom = createBorderBottom(styles_TD.borderBottom.color);
    const thBorderBottom = createBorderBottom(styles_TH.borderBottom.color);
    
    //固定元素
    fix(thCellBg,["left","right","top","bottom"]);
    fix(tdCellBg,["left","right","top","bottom"]);
    fix(thCellText,["left","width"]);
    fix(tdCellText,["left","width"]);
    fix(thBorderBottom,["bottom","height"]);
    fix(tdBorderBottom,["bottom","height"]);
        
    let layersArr_TD = [tdCellBg,tdCellText,tdBorderBottom];
    let layersArr_TH = [thCellBg,thCellText,thBorderBottom];
        
    let willUsedSymbolMaster_TD = createNewSymbolMaster("TD","UnSaved",layersArr_TD,styles_TD)
    let willUsedSymbolMaster_TH = createNewSymbolMaster("TH","UnSaved",layersArr_TH,styles_TH)

    
    //thead 内容
    renderHead.forEach((cell, cellIndex) => {
      const 
      cellGroup_frame_x = cellWidthArr.reduce(addReducer),
      cellGroup_frame_width = cellSize.width[cellIndex],
      cellGroup_frame_height = cellSize.height[0];
      
      var cellGroup = new SymbolInstance({
        name:"theadCell",
        parent:parentOfSmartTable,
        frame: {
            x: cellGroup_frame_x,
            y: 0,
            width: cellGroup_frame_width,
            height: cellGroup_frame_height
        },
        master:willUsedSymbolMaster_TH,
      })

      const override = {
        value:cell.title.toString() === "" ? " " : cell.title.toString(),
      }

      cellGroup.overrides[0] = Object.assign(cellGroup.overrides[0],override);

      cellGroupArr.push(cellGroup);
      cellWidthArr.push(cellGroup.frame.width);
      cellHeightArr.push(cellGroup.frame.height)

    })

    //将上面的单元格编组放入到 行内容编组中
    let rowGroup = new Group({
      name: 'row',
      //这里一定要注意 frame 和 layers 的顺序。如果 layers 在前，那么后面设置的 frame 将对先生成的内容进行拉伸。
      frame: {
        x: 0,
        y: 0,
        width: cellWidthArr.reduce(addReducer),
        height: getMaxValue(cellHeightArr)
      },
      layers: cellGroupArr,
    });

    //tbody 内容
    renderData.forEach((row,rowIndex) => {

      let 
      cellWidthArr = [0], cellGroupArr = [], cellHeightArr = [];


      // const 
      // rowGroup_frame_y = tbodyRowsHeight.reduce(addReducer), 
      // rowGroup_frame_width = cellWidthArr.reduce(addReducer),
      // rowGroup_frame_height = getMaxValue(cellHeightArr);

      titleArr.forEach((cell, cellIndex) => {
        
        const //提前取出要用到的值，避免在生成内容时再去计算，这样在速度上会有不小的提升。
        cellGroup_name = row[cell].toString() === "" ? "tbodyCell" : row[cell].toString(),
        cellGroup_frame_x = cellWidthArr.reduce(addReducer),
        cellGroup_frame_width = cellSize.width[cellIndex],
        cellGroup_frame_height = cellSize.height[rowIndex + 1];

        var cellGroup = new SymbolInstance({
          name:cellGroup_name,
          parent:parentOfSmartTable,
          frame: {
            x: cellGroup_frame_x,
            y: 0,
            width: cellGroup_frame_width,
            height: cellGroup_frame_height
          },
          master:willUsedSymbolMaster_TD,
        })

        const override = {
          value:row[cell].toString() === "" ? " " : row[cell].toString(),
        }
        cellGroup.overrides[0] = Object.assign(cellGroup.overrides[0],override);

        //将单元格编组放入一个数组中，供下方的行编组使用。
        cellGroupArr.push(cellGroup);
        cellWidthArr.push(cellGroup.frame.width);
        cellHeightArr.push(cellGroup.frame.height);
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

    

    // const 
    // thead_frame_width = rowGroup.frame.width,
    // thead_frame_height = rowGroup.frame.height,
    // tbody_frame_widht = tbodyRowsGroup[0].frame.width,
    // tbody_frame_height = tbodyRowsHeight.reduce(addReducer);

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
      parent: parentOfSmartTable,
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
