import JACXLSX from "./JACXLSX";
import JACGreenJetXLSX from "./JACGreenJetXLSX";
import SDECXLSX from "./SDECXLSX";
import FAWHQXLSX from "./FAWHQXLSX";
import GWMXLSX from "./GWMXLSX";
import QingLing_GF_XLSX from "./QingLing_GF_XLSX";
import FENGZEXLSX from "./FENGZEXLSX";
import TIANRONGXLSX from "./TIANRONGXLSX";
import CHONGQINGXLSX from "./CHONGQINGXLSX";
import YANGZHOUXLSX from "./YANGZHOUXLSX";
import CHANGCHAIXLSX from "./CHANGCHAIXLSX";
import SANYKUNSHANXLSX from "./SANYKUNSHANXLSX";
import SANYCHANGSHAXLSX from "./SANYCHANGSHAXLSX";
import ENDAXLSX from "./ENDAXLSX";
import MONTAPLASTXLSX from "./MONTAPLASTXLSX";
import DFCVSHIYANXLSX from "./DFCVSHIYANXLSX";
import JSDYULINXLSX from "./JSDYULINXLSX";
import WANSANGXLSX from "./WANSANGXLSX";
import WEICHAIAPTXLSX from "./WEICHAIAPTXLSX";
import FAWDAXLSX from "./FAWDAXLSX";
import FAWDEXLSX from "./FAWDEXLSX";
import BYDXIANXLSX from "./BYDXIANXLSX";
import BYDCHANGSHAXLSX from "./BYDCHANGSHAXLSX";
import YUEJINXLSX from "./YUEJINXLSX";
import HINOXLSX from "./HINOXLSX";

export default async function loadXLSXData(file, shipTo, message) {
  switch (shipTo) {
    case "1000005146":
      return await JACXLSX(file);
    case "1000030959":
      return await JACGreenJetXLSX(file);
    case "1000013960":
      return await SDECXLSX(file);
    case "1000917865":
      return await FAWHQXLSX(file);
    case "1000155552":
      return await GWMXLSX(file);
    case "1000005259":
      return await QingLing_GF_XLSX(file);
    case "1000160265":
      return await FENGZEXLSX(file);
    case "1000026976":
      return await TIANRONGXLSX(file);
    case "1000028469":
      return await CHONGQINGXLSX(file);
    case "1000027939":
      return await YANGZHOUXLSX(file);
    case "1000005256":
      return await CHANGCHAIXLSX(file);
    case "1000014218":
      return await SANYKUNSHANXLSX(file);
    case "1000159507":
      return await SANYCHANGSHAXLSX(file);
    case "1000031020":
      return await ENDAXLSX(file);
    case "1000009506":
      return await MONTAPLASTXLSX(file);
    case "1000005102":
      return await DFCVSHIYANXLSX(file);
    case "1000158160":
      return await DFCVSHIYANXLSX(file);
    case "1000027938":
      return await JSDYULINXLSX(file);
    case "1000026939":
      return await WANSANGXLSX(file);
    case "1000018125":
      return await WEICHAIAPTXLSX(file);
    case "1000005134":
      return await FAWDAXLSX(file);
    case "1000024275":
      return await FAWDEXLSX(file);
    case "1000027378":
      return await BYDXIANXLSX(file);
    case "1000027380":
      return await BYDCHANGSHAXLSX(file);
    case "1000036821":
      return await YUEJINXLSX(file);
    case "1000005260":
      return await HINOXLSX(file);
    default:
      message.warning("暂时不支持解析此客户的Excel文件");
  }
}
