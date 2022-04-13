import sketch from 'sketch';
import {ShapePath, Color, Layer, SymbolMaster,SymbolInstance,Document,Text,Group } from 'sketch/dom';

const selectedDocument = Document.getSelectedDocument();
const selectedPages = selectedDocument.pages;
const selectedLayers = sketch.getSelectedDocument().selectedLayers.layers;
const symbols = context.document.currentPage().symbols();

//
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

const modalName = "UnSaved";

const controlData = {
    tableWidth:"640",
    tableAmount:{
        cols:"4",
        rows:"4"
    },
    dataFrom:{
        api:"https://randomuser.me/api/?results=5&inc=",
        parameter:"gender,email,nat,phone"
    },
    tbodyPadding:{
        b_top:"12",
        b_right:"16",
        b_bottom:"12",
        b_left:"16"
    },
    theadPadding:{
        h_top:"12",
        h_bottom:"12"
    },
    fill:{
        basicColor:"#AAFFEE",
        switchState:false,
        intervalColor:""
    },
    border:{
        basicColor:"#EDEDED",
        switchState:true,
        intervalColor:"#EDEDED"
    },
    theadFill:{
        basicColor:"#FFFFFF"
    },
    textStyle:{
        basicColor:"#333333",
        fontSize:14,
        fontWeight:2
    },
    theadTextStyle:{
        basicColor:"#333333",
        fontSize:"14",
        fontWeight:"regular"
    }
}

export default function(){

    var document = context.document;
    var documentData = document.documentData();
    var currentPage = document.currentPage();
    var artboards = currentPage.artboards();
    var children = currentPage.children();
    var selection = context.selection;

    var selectedLayers = currentPage.selectedLayers();
    var artboards = context.document.currentPage().artboards();

    console.log(selection[0].frame().rect().origin.x);


    //通过 NSPredicate 查找内容
    // var symbolMasters = documentData.allSymbols();
    // var name = "控件/123";
    // var predicate = NSPredicate.predicateWithFormat("name == %@",name);
    // var queryResult = symbolMasters.filteredArrayUsingPredicate(predicate);



    // var layers = selectedDocument.getLayersNamed("控件/123")


    //图层转组件

    // var document = context.document;
    // var documentData = document.documentData();
    // var currentPage = document.currentPage();
    // var selection = context.selection;
    // var layer = selection[0];
    // var parent = layer.parentGroup();
    // var symbolsPage = documentData.symbolsPageOrCreateIfNecessary();
    // var symbolMaster_2 = MSSymbolMaster.alloc().init();

    // var frame = layer.frame().rect();

    // var position = symbolsPage.originForNewArtboardWithSize(frame.size);

    // var tempLayer = MSLayer.alloc().init();
    // parent.addLayer(tempLayer);
    // tempLayer.moveToLayer_beforeLayer(parent, nil);

    // var symbolMaster;
    // if(layer.class() == "MSArtBoard"){
    //     symbolMaster = MSSymbolMaster.convertArtboardToSymbol(layer)
    //     symbolMaster.moveToLayer_beforeLayer(symbolsPage, currentPage);
    // }else {
    //     var symbolMaster = MSSymbolMaster.alloc().initWithFrame(layer.frame().rect())
    //     symbolMaster.setName(layer.name());
    //     layer.moveToLayer_beforeLayer(symbolMaster,nil);
    //     layer.frame().setX(0);
    //     layer.frame().setY(0);
    //     symbolsPage.addLayer(symbolMaster);
    // }

    // symbolMaster.frame().setX(position.x);
    // symbolMaster.frame().setY(position.y);  
    
    // tempLayer.removeFromParent();
    

    //创建组件
    var symbolsPage = documentData.symbolsPageOrCreateIfNecessary();

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
                    color: controlData.fill.basicColor,
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
          textColor:controlData.textStyle.basicColor,
          fontSize: 14,
          borders: [],
          fontWeight:controlData.textStyle.fontWeight
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
                color: controlData.border.basicColor,
            }
            ],
            borders: [],
            styleType: Layer,
        },
    })
    
    
    fix(cellBg,["left","right","top","bottom"]);
    fix(cellText,["left"]);
    fix(borderBottom,["bottom","height"]);

    var position;

    var symbolSource_name = "SmartTable_" + modalName + "/TD";
    var reg = "SmartTable_" + modalName + "\/TD[-]?.*";
    
    var contains = documentData.allSymbols();
    var predicate_td = NSPredicate.predicateWithFormat("name MATCHES[c] %@", reg);
    var symbolSource_tds = contains.filteredArrayUsingPredicate(predicate_td);

    //获取所有 symbolSource 的版本号（结尾的数字）
    let matchVersionCode = /\d*$/;
    let versionCodeArr = [];
    symbolSource_tds.forEach((symbol)=>{
        let symbolName = symbol.name();
        if(matchVersionCode.test(symbolName)){
            versionCodeArr.push(symbolName.match(matchVersionCode)[0])
        }
        
    })
    var oldVersionCode = Math.max(...versionCodeArr);
    var willUsedVersionCode = oldVersionCode + 1;
    var matchedCount = symbolSource_tds.count();
    var willUsedSymbolMaster;

    if(matchedCount < 1){
        position = symbolsPage.originForNewArtboardWithSize(nil);
        var symbol = new SymbolMaster({
            name:symbolSource_name,
            layers:[cellBg,cellText,borderBottom],
            parent:symbolsPage,
            frame:{
                x:position.x,
                y:position.y,
                width:cellBg.frame.width,
                height:cellBg.frame.height
            },
        });
        willUsedSymbolMaster = symbol.sketchObject;
    }else{
        //匹配到同名内容，匹配到组件默认为 false；
        let matched = false

        //对每个组件进行匹配，匹配成功即退出循环，并将 matched 标记为 true
        for (let symbolMaster of Array.from(symbolSource_tds)){
            let symbolMasterContainedLayers = symbolMaster.layers();
            let equal;
            let equals = [];//收集所有 layer 的样式和传过来的参数是否相同。
            symbolMasterContainedLayers.forEach((layer)=>{
                var jsLayer = sketch.fromNative(layer);
                //判断图层名，然后根据图层名再去和指定的参数进行对比
                var layerName = layer.name();
                switch (layerName.substring(0)) {
                    case "cellBg":
                        let cellBgEqual = jsLayer.style.fills[0].color.substring(0,7).toUpperCase() == controlData.fill.basicColor.toUpperCase();
                        equals.push(cellBgEqual)
                        break;
                    case "layerName":
                        let textColor = jsLayer.style.textColor.substring(0,7).toUpperCase() == controlData.textStyle.basicColor.toUpperCase();
                        let fontSize = jsLayer.style.fontSize == controlData.textStyle.fontSize;
                        let fontWeight = jsLayer.style.fontWeight == controlData.textStyle.fontWeight;
                        let textStyleEqual = textColor && fontSize && fontWeight;
                        equals.push(textStyleEqual);
                        break;
                    case "borderBottom":
                        let borderBottomEqual = jsLayer.style.fills[0].color.substring(0,7).toUpperCase() == controlData.border.basicColor.toUpperCase();
                        equals.push(borderBottomEqual)
                        break;
                    default:
                        break;
                }
                // var textStyleEqual = false;
                // textStyleEqual = jsLayer.style.fills[0].fill.color === 
            })
            equal = equals.every((a) => a == true);
            //如果全部匹配到，说明存在已经重复的组件样式，不再新增。
            if (equal) {
                matched = true;
                willUsedSymbolMaster = symbolMaster;
                break;
            };
        }

        //如果没有匹配到，创建新组件
        if(!matched){
            position = symbolsPage.originForNewArtboardWithSize(nil);
            var symbol = new SymbolMaster({
                name:symbolSource_name + "-V" + willUsedVersionCode,
                layers:[cellBg,cellText,borderBottom],
                parent:symbolsPage,
                frame:{
                    x:position.x,
                    y:position.y,
                    width:cellBg.frame.width,
                    height:cellBg.frame.height
                },
            });
            willUsedSymbolMaster = symbol.sketchObject;
        }
    }

    // var instance = symbol.createNewInstance();

    var instance = new SymbolInstance({
        name:"symbolInstance",
        parent:selectedLayers[0],
        master:willUsedSymbolMaster
    })

    const rect = {
        origin:{
            x:0,
            y:0
        },
        size:instance.sketchObject.naturalSize()
    }
    // instance.sketchObject.frame().setRect(rect)
    instance.sketchObject.resizeInstanceToFitSymbol(instance.sketchObject.symbolMaster());

    // var duplicatedLayer = instance.duplicate();

    // const override = {
    //     value:"啊哈"
    // }

    
    // instance.overrides[0] = Object.assign(instance.overrides[0],override);
    // instance.setOverrideValue(instance.overrides[0],"打你娃儿哟")
    // duplicatedLayer.setOverrideValue(duplicatedLayer.overrides[0],"你个憨批")
    

    // var group = new Group({
    //     name: 'group',
    //     parent:selectedLayers[0],
    //     frame: {
    //       x: 0,
    //       y: 0,
    //       width: instance.frame.width,
    //       height: instance.frame.height
    //     },
    //     layers: [instance],
    // })
}

