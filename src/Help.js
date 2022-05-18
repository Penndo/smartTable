import sketch from 'sketch';
import {ShapePath, Color, Group, Text, Layer, SymbolMaster, SymbolInstance,Document,Page } from 'sketch/dom';

var document = context.document;
var documentData = document.documentData();
var symbolsPage = documentData.symbolsPageOrCreateIfNecessary();


function createNewSymbolMaster(TH_TD,modalName,layersArr,styles){

    let position;

    let symbolSource_name = "SmartTable_" + modalName + "/" + TH_TD;
    let symbolSource_name_reg = "SmartTable_" + modalName + "\/" + TH_TD + "[-]?.*";

    let contains = documentData.allSymbols();
    let predicate = NSPredicate.predicateWithFormat("name MATCHES[c] %@", symbolSource_name_reg);
    let symbolSources = contains.filteredArrayUsingPredicate(predicate);
    let matchVersionCode = /\d*$/;
    let versionCodeArr = [];

    symbolSources.forEach((symbol)=>{
        let symbolName = symbol.name();
        if(matchVersionCode.test(symbolName)){
            versionCodeArr.push(symbolName.match(matchVersionCode)[0])
        }
        
    });

    let lastVersionCode = Math.max(...versionCodeArr);
    let willUsedVersionCode = lastVersionCode + 1;
    let matchedCount = symbolSources.count();
    let willUsedSymbolMaster;

    if(matchedCount < 1){
        position = symbolsPage.originForNewArtboardWithSize(nil);
        let symbol = new SymbolMaster({
            name:symbolSource_name,
            layers:layersArr,
            parent:symbolsPage,
            frame:{
                x:position.x,
                y:position.y,
                width:layersArr[0].frame.width,
                height:layersArr[0].frame.height
            },
        });
        willUsedSymbolMaster = symbol.sketchObject;

    }else{
        //匹配到同名内容，匹配到组件默认为 false；
        let matched = false
        //对每个组件进行匹配，匹配成功即退出循环，并将 matched 标记为 true
        for (let symbolMaster of Array.from(symbolSources)){
            let symbolMasterContainedLayers = symbolMaster.layers();
            let equal;
            let equals = [];//收集所有 layer 的样式和传过来的参数是否相同。
            symbolMasterContainedLayers.forEach((layer,index)=>{
                let layerName = layer.name();
                let jsLayer = sketch.fromNative(layer);
                //需要先判断一下原有的包含图层和现在传入的是否一致吧，然后再去判断属性是否相同
                if(symbolMasterContainedLayers.count() == layersArr.length && layer.name() == layersArr[index].name){
                    switch (layerName.substring(0)) {
                        case "cellBg_interval":
                            let cellBg_interval_color = jsLayer.style.fills[0].color.substring(0,7).toUpperCase() == styles.cellBg.intervalColor.toUpperCase();
                            // let cellBg_interval_border = true;
                            // if(jsLayer.style.borders[0] == undefined && styles.cellBg.border == "" ){
                            //     cellBg_interval_border = true;
                            // }else if(jsLayer.style.borders[0] != undefined && styles.cellBg.border != ""){
                            //     cellBg_interval_border = jsLayer.style.borders[0].color.substring(0,7) == styles.cellBg.border;
                            // }else{
                            //     cellBg_interval_border = false;
                            // }
                            // let cellBg_interval_equal = cellBg_interval_color && cellBg_interval_border;
                            equals.push(cellBg_interval_color);
                            break;
                        case "cellBg":
                            console.log("TH问题")
                            console.log(jsLayer.style.borders[0],styles.cellBg.border)
                            let cellBgEqual = jsLayer.style.fills[0].color.substring(0,7).toUpperCase() == styles.cellBg.color.toUpperCase();
                            let cellBgBorder = true;
                            if(jsLayer.style.borders[0] == undefined && styles.cellBg.border == "" ){
                                cellBgBorder = true;
                            }else if(jsLayer.style.borders[0] != undefined && styles.cellBg.border != ""){
                                cellBgBorder = jsLayer.style.borders[0].color.substring(0,7) == styles.cellBg.border;
                            }else{
                                cellBgBorder = false;
                            }
                            let cellBgStyleEqual = cellBgEqual && cellBgBorder;
                            equals.push(cellBgStyleEqual);
                            break;
                        case "layerName":
                            let textColor = jsLayer.style.textColor.substring(0,7).toUpperCase() == styles.text.textColor.toUpperCase();
                            let fontSize = jsLayer.style.fontSize == styles.text.fontSize;
                            let fontWeight = jsLayer.style.fontWeight == styles.text.fontWeight;
                            let padding_left = jsLayer.frame.x == styles.padding.left;
                            let textStyleEqual = textColor && fontSize && fontWeight && padding_left;
                            equals.push(textStyleEqual);
                            break;
                        case "borderBottom":
                            let borderBottomEqual = jsLayer.style.fills[0].color.substring(0,7).toUpperCase() == styles.borderBottom.color.toUpperCase();
                            equals.push(borderBottomEqual)
                            break;
                        default:
                            break;
                    }
                }else{
                    equals.push(false)
                }                
            })
            equal = equals.every((a) => a == true);
            //如果全部匹配到，退出循环。说明存在已经重复的组件样式，不再新增。
            if (equal) {
                matched = true;
                willUsedSymbolMaster = symbolMaster;
                break;
            };
        }

        //如果没有匹配到，创建新组件
        if(!matched){
            position = symbolsPage.originForNewArtboardWithSize(nil);
            let symbol = new SymbolMaster({
                name:symbolSource_name + "-V" + willUsedVersionCode,
                layers:layersArr,
                parent:symbolsPage,
                frame:{
                    x:position.x,
                    y:position.y,
                    width:layersArr[0].frame.width,
                    height:layersArr[0].frame.height
                },
            });
            willUsedSymbolMaster = symbol.sketchObject;
        }
    }

    return willUsedSymbolMaster;
}

export {createNewSymbolMaster}
